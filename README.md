# VZ Clips

An interactive, responsive barber portfolio for Vaughn Zhao in Fremont, California. Inspired by Apple's restrained typography, generous spacing, and scroll-driven presentation, with its own VZ Clips identity.

## Features

- Staggered word reveals, subtle image motion, and an expanding cursor with reduced-motion support.
- Draggable, gently rotating haircut wheel featuring eight finished-look frames from six Instagram reels.
- Full haircut gallery and a keyboard-accessible photo lightbox with original-reel links.
- Six user-supplied five-star reactions in a rotating review wheel with pause and navigation controls.
- Actual video-frame covers for the hero and each craft reel, plus the supplied Vaughn portrait.
- Original Instagram reel embeds loaded only when requested, with original-post fallbacks.
- Booking buttons throughout the site and a persistent mobile booking bar.
- Calendly inline calendar and modal integration, enabled by one configuration value.
- Real Setmore appointment booking while Calendly is unconfigured.
- Public business contact details and booking FAQs.
- No build tool, dependency installation, database, or API key required.

## Run locally

Requires Node 18 or newer. Run `node server.mjs`, then open http://127.0.0.1:4173. Run `node --check dist/app.js`, `node --check dist/config.js`, and `node verify.mjs` for basic verification. All deployable files are in `dist/` and work on any static host.

## Connect Calendly

Edit `dist/config.js` and set `calendlyUrl` to Vaughn's exact HTTPS event URL, for example the URL copied from Calendly's Share control. Do not use a guessed account or event URL. Once configured, every booking button opens Calendly, and the booking section offers an inline calendar. Visitors must complete the provider's confirmation flow; the website never fabricates times or confirmations. Until the event URL is supplied, Setmore remains active.

## Update content

Business details and pricing are in `dist/index.html`. The hero, reels, gallery, and supplied review list are in `dist/config.js`. Interactive behavior is in `dist/app.js` and styling is in `dist/styles.css`. Local portfolio assets are in `dist/assets/`.

## Sources and limitations

See `CONTENT-SOURCES.md`. Instagram may require login or restrict embeds depending on visitor cookies, post privacy, and provider availability. Each reel includes an original-post link. Covers and gallery images are extracted frames stored locally, avoiding expiring CDN URLs. There is no automatic Instagram synchronization; edit the configuration to change featured posts. The six review quotes and their five-star ratings were supplied by the user; no additional reviews were invented. Pricing is a snapshot of the booking page and should be reconfirmed before public launch.

The first hosted Site is private for owner review. GitHub repository publication is separate from Sites hosting and requires an authenticated GitHub account.
