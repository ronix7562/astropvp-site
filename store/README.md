# AstroPvP Store page (`/astropvp-site/store/`)

A static page for GitHub Pages. **Every link and data source is set in `config.js`.** Rank text is in `ranks.js`.

| File | What it is |
|---|---|
| `index.html` | The page markup: the loader, top bar, header, hero, sidebar, the views, and the rank dialog |
| `store.css` | All styles, including the mobile breakpoints and the reduced-motion rules |
| `store.js` | The loader, the star/particle sky, routing, the rank cards and dialog, the data feeds, and copy-IP |
| `config.js` | Server IP, Discord, Tebex links, feed URLs, hero image, sale banner |
| `ranks.js` | Galaxy and Nebula price, type and perks. `verified:false` marks a perk as "to be confirmed" |

When you change a CSS or JS file, bump `?v=N` in `index.html` so browsers fetch the new copy.

Add `?demo=1` to the URL to see the Recent Payments and Top Spenders boxes with sample data. That data is **flagged DEMO**. Use it for previewing only and never link to it.

## Going live with Tebex
1. In Tebex, create the packages:
   - **Galaxy Rank**: subscription, $80 per month.
   - **Nebula Rank**: single purchase, $50.
2. Paste each package's checkout link into `config.js` under `tebex.packages.galaxy` and `tebex.packages.nebula`. Put the webstore URL in `tebex.storeUrl`. The buttons switch from "Coming soon" to real links automatically.

### Draft package commands (check these before using them)
These come from the live LuckPerms setup. Galaxy is the group `galaxy`. Nebula is the group `interstellar`, whose display name is Nebula.

| Package | When | Command |
|---|---|---|
| Galaxy (subscription) | on purchase | `lp user {username} parent add galaxy` |
| Galaxy (subscription) | on expiry / cancel | `lp user {username} parent remove galaxy` |
| Nebula (one-time) | on purchase | `lp user {username} parent add interstellar` |

- Use `parent add`, **not** `parent set`. The old AstroCore vouchers use `parent set`, which wipes every other parent, including staff groups.
- Galaxy's parent is `interstellar`. So Galaxy already includes Nebula's perks, and a player who also bought Nebula keeps Nebula when Galaxy ends.
- To check: whether parents should carry a `server=factions` context. The perk nodes use `server=factions`; the vouchers set parents globally, and the draft above does the same.
- The Tebex plugin must be connected on the main server first. Right now BuycraftX reports "fresh setup" / not connected; run `tebex secret <key>` in the main console. Never put that key on this website.

## Live data feeds (need a small backend)
GitHub Pages cannot keep a secret. Recent payments, top spenders and gift-card balances all need the Tebex **secret** key (Plugin API), so they need a tiny backend, for example a Cloudflare Worker. The backend calls Tebex and returns only public-safe JSON. Put its URLs in `config.js -> feeds`.

- `recentPayments`: `GET` returns `[{ "name": "Player", "item": "Heroic Bundle", "quantity": 6, "time": "2026-11-05T18:00:00Z" }]`
- `topSpenders`: `GET` returns `{ "month": [{ "name": "Player", "rank": "Galaxy" }], "all": [...] }`. The list is ordered and contains **no amounts**.
- `giftcardBalance`: `POST {"code":"..."}` returns `{ "balance": "10.00", "currency": "USD" }`. Rate-limit this endpoint.

Backend sources:
- Payments come from Plugin API `GET /payments`.
- Top spenders are totalled from payments per player.
- Gift cards come from `GET /gift-cards`, matched by code on the server side. Never send the list of all cards to the browser.

## Discord count
This comes from Discord's public invite API (`/invites/NtYpkCzpMy?with_counts=true`) and needs no key. Discord reports the count as *approximate*. The community strip uses it only when it is at least `communityMinimum` (currently 100). Below that, the strip shows "Join the AstroPvP community".
