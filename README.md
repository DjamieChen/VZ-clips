# VZ Clips

## [Open the live website →](https://djamiechen.github.io/VZ-clips/)

The full interactive website is hosted on GitHub Pages. Visitors can browse the haircuts, watch the reels, and book an appointment directly from that link.

## Edit the website text

Open a file below, press the pencil icon, edit the text, and **Commit changes** to main. GitHub automatically builds and publishes your changes. Allow a few minutes, then refresh the live website.

| Section | Headings and text | Images, video titles, or repeated content |
| --- | --- | --- |
| Logo and navigation | [header.html](sections/header.html) |  |
| Opening / good hairday | [hero.html](sections/hero.html) | [hero.json](sections/hero.json) |
| Moving text strip | [ticker.html](sections/ticker.html) |  |
| Every angle / haircut wheel | [cuts.html](sections/cuts.html) | [cuts.json](sections/cuts.json) |
| See the craft | [craft.html](sections/craft.html) | [craft.json](sections/craft.json) |
| Meet Vaughn | [meet-vaughn.html](sections/meet-vaughn.html) |  |
| Word from the chair | [reviews.html](sections/reviews.html) | [reviews.json](sections/reviews.json) |
| Booking, price, and contact | [booking.html](sections/booking.html) | [booking.json](sections/booking.json) |
| Questions and answers | [faq.html](sections/faq.html) |  |
| Bottom of the page | [footer.html](sections/footer.html) |  |

In HTML files, change the words between the tags. Keep IDs, classes, and tags so the design and motion continue working. In JSON files, change values inside quotation marks and keep commas and brackets. If you change the haircut price, also update the FAQ and mobile booking bar in [page.html](page.html).

To connect Calendly, paste Vaughn's actual event link into calendlyUrl in [booking.json](sections/booking.json). Setmore works until that link is added.

## Publishing

[View publishing progress](https://github.com/DjamieChen/VZ-clips/actions/workflows/pages.yml). Each change on main runs asset and content checks before publishing dist/ through GitHub Pages. A failed check leaves the previous successful version live.

The sections/ folder contains the editable source. page.html combines the sections. dist/index.html and dist/config.js are generated, so edit the section files instead. Design styles are in dist/styles.css, motion and interaction code is in dist/app.js, and images are in dist/assets/.

For optional local development, use Node 18 or newer: npm run dev. Use npm run check to build and verify. No dependency installation is required.

See [CONTENT-SOURCES.md](CONTENT-SOURCES.md) for media sources and booking information. Instagram embeds depend on Instagram availability and have links to the original posts.
