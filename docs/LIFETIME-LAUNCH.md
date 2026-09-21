# Lifetime launch checklist

Code + product + pricing shortcode are in place. Finish these after uploading the plugin zip.

## 1. Upload plugin (required)

Upload `ultra-card-integration.zip` (v1.3.50) via **Plugins → Add New → Upload Plugin → Replace**.

This enables:
- `[ultra_card_page id="pricing"]` on `/pricing/`
- Loyalty credit at checkout
- Auto-flip at $99 cumulative paid
- Lifetime revoke guard
- **Ultra Card → Lifetime** admin screen

## 2. Confirm product

Product already created: **ID 11702** — https://ultracard.io/product/ultra-card-pro-lifetime/

In **Ultra Card → Lifetime**, click **Create / repair Lifetime product** once if the option ID is empty after upload (should already be `ultra_card_lifetime_product_id=11702`).

## 3. Grandfather

1. Open **Ultra Card → Lifetime**
2. Click **Dry-run** — expect ~1 user at ≥ $60 today
3. Click **Apply grandfathering**

## 4. Flush caches

- SiteGround / SG Optimizer: purge caches
- Ultra Card → Website → Flush (so pricing fragment loads from GitHub after push)
- Visit `/pricing/` hard-refresh — you should see Monthly / Yearly / Lifetime, not blank

## 5. Discord announcement (paste)

```
Ultra Card Pro Lifetime is live — $99 once, for the life of Ultra Card.

• Monthly $4.99 · Yearly $45 · Lifetime $99
• Every Pro payment you've already made counts as loyalty credit toward Lifetime (min $29 remaining)
• Hit $99 total paid and you convert to Lifetime automatically — billing stops
• Early supporters who have paid $60+ are grandfathered at launch

Pricing: https://ultracard.io/pricing/
Lifetime: https://ultracard.io/product/ultra-card-pro-lifetime/
Dashboard shows your personal Lifetime price when logged in.
```

## 6. Renewal note (Oct–Jan yearly cohort — 46 subs / ~$2,070)

Personalize: Lifetime due = $99 − amount paid (usually $54 for a single $45 yearly).

```
Subject: Renew Ultra Card Pro — or go Lifetime

Hi {name},

Your Ultra Card Pro yearly plan renews on {date} for $45.

You can also go Lifetime for ${due} (your $45 already paid counts as credit). One payment, Pro for the life of Ultra Card — no more renewals.

Renew: https://ultracard.io/my-account/subscriptions/
Go Lifetime: https://ultracard.io/product/ultra-card-pro-lifetime/
```

## 7. Push website fragment

Commit + push so `website/pricing-page-embed.html` is on `main` (harness reads from GitHub). Until then, flush may 404 the fragment.
