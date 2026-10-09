---
description: ultracard.io runs a server-side mu-plugin that caches the preset feed and rate-limits JWT sign-ins. Read before changing REST routes, presets, auth or polling.
globs: ultra-card-integration/**,ultra-card-integration.php,includes/**,templates/**,src/services/**
alwaysApply: false
---

# ultracard.io server mu-plugin: WJD REST relief

Live since 2026-10-09, after the Oct 8 outage. File on the server:
`wp-content/mu-plugins/wjd-rest-relief.php`. Source copy:
`~/Claude/incident-2026-10-08/ultracard.io/wjd-rest-relief.php`.
It sits outside this repo, so nothing in `npm run plugin:zip` replaces or removes it.

## What it does

1. **Caches `GET /wp-json/wp/v2/presets_dir_ltg` (and `/presets_dir_ltg/<id>`) for 10 minutes**
   when the request is signed out: no logged-in user and no `Authorization` header.
   - The key is the route plus every query parameter, so `_embed`, `sort` and `page` each cache separately.
   - The response carries `X-WJD-Cache: HIT` or `MISS`. Hits also send `Cache-Control: public, max-age=300`.
   - `X-WP-Total`, `X-WP-TotalPages` and `Link` are replayed on hits. The plugin's own CORS headers still apply.
   - On 2026-10-09 the feed returned `[]` and still took about 10 s per call, roughly 1,750 calls a day.
     The card should use the native `/ultra-card/v1/presets` catalog. Fixing the fallback
     in `src/services/directories-pro-presets-api.ts` removes most of that traffic.
2. **Rate-limits `POST /wp-json/jwt-auth/v1/token` to 20 per IP every 10 minutes.**
   The 21st gets `429` with code `too_many_sign_ins` and `Retry-After` set to the seconds left in the window.
   - From mu-plugin 1.1.0 the window is fixed: it opens on the first sign-in and refused attempts are not counted.
     1.0.0 reset the 10-minute timer on every attempt.
   - On Oct 8 some Home Assistant installs (UA `HomeAssistant/UltraCardProCloud/1.0`) ran
     `POST /token` then `GET /wp/v2/users/me` every 10 to 20 seconds, with no `/subscription` call.
     Token requests went from about 570 a day to 3,000. The cause was Ultra Card Connect 1.8.0 signing in
     again on every setup retry; 1.8.1 shares the token across retries and waits out a 429.

## Rules when changing code

- Do not make signed-out `presets_dir_ltg` answers depend on the visitor (ratings per user, nonces, time-sensitive fields).
  They are shared for 10 minutes. Anything per-user needs an `Authorization` header or its own route.
- If ratings or new presets must show sooner, lower `WJD_RR_TTL` in the mu-plugin, not here.
- Never sign in again on every request or on a timer. Reuse the token until it is near expiry, use `/token/refresh`,
  and back off on `429` using `Retry-After`. A client that ignores 429 just keeps getting refused.
- Do not move the sign-in route away from `/jwt-auth/v1/token` without updating the mu-plugin. Otherwise the limit stops applying.
- To remove both behaviours, delete the mu-plugin file on the server.
