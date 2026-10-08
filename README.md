# VZ Clips

An interactive, responsive barber portfolio for Vaughn Zhao in Fremont, California. Inspired by Apple's restrained typography, generous spacing, and scroll-driven presentation, with its own VZ Clips identity.

## Features

- Scroll reveals and subtle image motion with reduced-motion support.
- Four selectable haircut styles and a keyboard-accessible photo lightbox.
- Original Instagram reel embeds loaded only when requested, with original-post fallbacks.
- Booking buttons throughout the site and a persistent mobile booking bar.
- Calendly inline calendar and modal integration, enabled by one configuration value.
- Real Setmore appointment booking while Calendly is unconfigured.
- Public business contact details, actual client reviews, and booking FAQs.
- No build tool, dependency installation, database, or API key required.

## Run locally

Requires Node 18 or newer. Run `node server.mjs`, then open http://127.0.0.1:4173. Run `node --check dist/app.js`, `node --check dist/config.js`, and `node verify.mjs` for basic verification. All deployable files are in `dist/` and work on any static host.

## Connect Calendly

Edit `dist/config.js` and set `calendlyUrl` to Vaughn's exact HTTPS event URL, for example the URL copied from Calendly's Share control. Do not use a guessed account or event URL. Once configured, every booking button opens Calendly, and the booking section offers an inline calendar. Visitors must complete the provider's confirmation flow; the website never fabricates times or confirmations. Until the event URL is supplied, Setmore remains active.

## Update content

Business details and pricing are in `dist/index.html`. Haircut descriptions and interactive behavior are in `dist/app.js`. The reel list is in `dist/config.js`. Styling is in `dist/styles.css`. Local portfolio assets are in `dist/assets/`.

## Sources and limitations

See `CONTENT-SOURCES.md`. Instagram may require login or restrict embeds depending on visitor cookies, post privacy, and provider availability. Each reel includes an original-post link. Reel cover images currently use VZ Clips' Setmore portfolio imagery rather than guaranteed exact frames from each reel. There is no automatic Instagram synchronization; edit the reel list to change featured posts. Review count and price are snapshots from the existing booking page and should be reconfirmed before public launch.

The first hosted Site is private for owner review. GitHub repository publication is separate from Sites hosting and requires an authenticated GitHub account.

