# Inner Revealing

The independent eLMS web frontend lives in [`lms/`](lms/) and is deployed at https://ir.vishwalabs.com. See [`lms/deploy/README.md`](lms/deploy/README.md) for server configuration and the pending production backend handoff. This repository root continues to contain the marketing website.

A responsive website for Inner Revealing Meditation Centre, built with Next.js App Router, React, TypeScript, and GSAP. Content follows the supplied `Inner Revealing - Website Content (New Structure).docx`, with the LunaFit Figma design language: Satoshi typography, white and light-gray surfaces, dark text, and rounded cards. The primary violet-to-magenta gradient matches the supplied logo. Desktop heroes use 64px type and section headings use 55px type, with a responsive scale for smaller screens.

The supplied source document, `.design-reference` research files and `output` working files are retained locally and excluded from the public repository. They are not required to run or build the website.

The website includes Home, About, Services, Fees, Recorded Meditations, Free Resources, Gallery, Testimonials and Contact, plus nine service detail pages. The main navigation and homepage cards link to these routes. Legacy public content URLs redirect to the new structure; private/client recording pages are not recreated.

Hero entrances, scroll reveals, reading progress and desktop button interactions use GSAP. Animations respect reduced-motion preferences. Gallery images and verified YouTube videos open in keyboard-accessible dialogs; meditation, video and book catalogs support filtering or search.

Contact and booking forms prepare an enquiry for the visitor to send through WhatsApp or email. They do not submit messages or reserve appointments automatically. This project has no booking/contact backend. Payment and donation buttons link to the existing provider pages on the original website; those integrations must remain accessible or be replaced when moving the original domain to this application.

The Fees page uses the document’s consolidated fee table. Confirm the monthly meditation pricing, weekly frequencies, active group batches and precise centre address with the owner before launch, as requested in Appendix B. Unknown recording prices show an enquiry option.

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000.

## Checks and production

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

Page routes live in `src/app`, content catalogs in `src/lib`, and shared layouts/motion in `src/components`. Local photos, facilitator portraits and certificate images are reused from the original centre website. Hiren Kapadia’s published book is served from `public/resources`; other books are listed as recommended reading. Assets and existing homepage design references are retained in `.design-reference`.

Satoshi is hosted locally in `public/fonts`. The LunaFit reference code, screenshots, and asset metadata are preserved in `.design-reference`.

Six editorial landing-page images were generated with the built-in image_gen tool for meditation, mindful breathing, counselling, self-reflection, children's mindfulness and shared meditation. Optimized WebP assets live in `public/images/generated`; the exact prompts and image metadata are recorded in `.design-reference/generated-landing-images.json`. The original session galleries, testimonial media, facilitator portraits and the supplied yoga line illustrations remain in use.
