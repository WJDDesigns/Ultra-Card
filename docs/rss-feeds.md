# RSS Feed module: tested feeds

German feeds tested in the RSS Feed module (list from a community tester, Nov 2026).
"Works" means the feed loads with Ultra Card 3.14.3-beta9 and Ultra Card Connect 1.12.3 or later.

## News

| Feed | Status |
|---|---|
| https://rss.sueddeutsche.de/rss/Alles | Works |
| https://www.n-tv.de/politik/rss | Works |
| https://www.tagesschau.de/infoservices/alle-meldungen-100~rss2.xml | Works |
| https://www.focus.de/rss | Works |
| https://newsfeed.zeit.de/index | Works |
| https://www.faz.net/rss/aktuell | Works |
| https://www.welt.de/feeds/latest.rss | Works |
| https://www.stern.de/feed/standard/all/ | Works |
| https://www.spiegel.de/schlagzeilen/index.rss | Works |
| https://www.heise.de/rss/heise.rdf | Works |
| https://www.hessenschau.de/suedhessen/index.rss | Works (needs Connect 1.12.3) |

## Finance

| Feed | Status |
|---|---|
| https://feeds.cms.handelsblatt.com/finanzen | Works |
| https://www.manager-magazin.de/news/index.rss | Works |
| https://newsfeed.zeit.de/wirtschaft/index | Works |
| https://www.welt.de/feeds/section/wirtschaft.rss | Works |
| https://www.capital.de/rss | Works from the next release. The site blocks apps on `/rss` ("Zugriff unterbunden"), so the card loads https://www.capital.de/feed/standard/ instead, which is open. On older versions, enter that address directly. |
| https://www.finanzen.net/rss/news | Does not work. finanzen.net's Akamai firewall answers every app with "Access Denied" (403), on all pages, not just the feed. Only a web browser gets through, and the site doesn't let other sites read it from the browser. Nothing Ultra Card can fix. |
| https://www.deraktionaer.de/aktionaer-news.rss | Works |
| https://www.wallstreet-online.de/rss/nachrichten-alle.xml | Works |

## Media

| Feed | Status |
|---|---|
| https://www.kino.de/feed/film/ | Works |
| https://www.sneak-kino.de/feed/ | Works |
| https://follow.it/der-postillon-abo/rss | Works |
| https://www.gala.de/feed/standard-rss/ | Works |
| https://www.twitterperlen.de/feed/ | Works |
| https://www.spiegel.de/kultur/kino/index.rss | Works |
| https://www.moviepilot.de/rss/moviepilot-standard | Works |

## Technology

| Feed | Status |
|---|---|
| https://www.spiegel.de/netzwelt/index.rss | Works |
| https://www.chip.de/rss | Works |
| https://feeds.cms.handelsblatt.com/technologie | Works |
| https://static.winfuture.de/feeds/WinFuture-News-rss2.0.xml | Works |
| https://feeds.feedburner.com/Macerkopf | Works |
| https://www.computerbild.de/rss/35011529.xml | Works |
| https://feeds.feedburner.com/netzwelt | Works |
| https://www.pcwelt.de/feed?story_types=news%2Cfeature | Works from the next Connect release. Older Connect versions re-encoded `%2C` as `,`, and the site redirected back to `%2C` in a loop. On older versions, https://www.pcwelt.de/feed works. |

## Why a feed can fail

- **The site refuses apps (401/403/429).** Some publishers only serve browsers. Connect asks like a browser, but firewalls such as Akamai can still tell it apart. Look for another feed address on the site.
- **The browser can't read it either.** Without Connect, the card fetches feeds straight from the browser, which only works when the site allows other sites to read it (CORS). Most news sites don't, so install Ultra Card Connect.
- **Not a feed.** A normal web page works only if it links to its feed in its page header.
