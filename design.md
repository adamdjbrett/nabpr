# Design — NABPR

The locked design system for nabpr.org. Every template uses this system.

## Genre

Editorial: an academic society presented as a living news magazine — a newspaper masthead over a filterable ledger of the association's public record.

## Macrostructure family

- Homepage: Ecosystem Index — a 50/50 positioning graf (justified text left, the seal in a lightbox panel right, kept light in both themes because the mark is black ink on transparent), a 50/50 featured card (image left, headline/summary/date right) over two columns carrying the next six entries, filterable ledger, people rail, publications index, membership.
- Content pages: Long Document with a readable measure and restrained metadata. `toc: true` in front matter prepends a table of contents built from the page's own h2/h3 headings.
- Archives: Index-First with dated rows, one-word category tags, and a pager. The chips above the blog are links to a per-category archive page, so they filter all 138 entries; the homepage ledger filters its own fourteen rows in place.

## Theme

Scholarly beige paper over green board cloth, archival in feel. Light and dark, both defined in `assets/css/site.css`; the system preference is the default and the masthead toggle persists a choice in `localStorage` under `nabpr-theme`.

- Paper: warm beige, `oklch(95.5% 0.016 92)`; steps 2 and 3 for insets.
- Ink: `oklch(22% 0.020 135)`; secondary ink `oklch(31% 0.020 132)`.
- Muted / neutral: `oklch(42% 0.022 130)` and `oklch(49% 0.020 125)`; interactive borders `oklch(58% 0.020 125)`, which is the 3:1 line for a UI boundary.
- Rule: `oklch(78% 0.018 100)`; hairline rule `oklch(85% 0.014 96)`.
- Accent: board green, `oklch(42% 0.115 152)`; focus `oklch(44% 0.190 152)`.
- Board (the dark band): `oklch(24% 0.045 150)` with ink `oklch(93% 0.020 92)`.

Dark mode redefines the same tokens; the board inverts to paper so the band still reads as a distinct surface.

## Typography

- Display: Fraunces (variable, optical sizing), fallback Iowan Old Style / Georgia.
- Body: Newsreader, fallback Iowan Old Style / Georgia. Serif throughout — no sans.
- Labels, kickers, tags, chips, and nav: body face, uppercase, tracked `0.1em`–`0.14em`.
- Wordmark: Fraunces 900, centred, `clamp(3rem, 1.6rem + 8vw, 7.5rem)`.
- Article measure: 66ch maximum.

## Spacing

Four-point named scale, defined in `assets/css/site.css`. Templates use tokens rather than one-off values.

## Motion

Quiet. One orchestrated entrance on the homepage (`.rise`, staggered 90ms), colour and underline transitions elsewhere. No scroll reveals, scaling cards, or animation library.

## Navigation and footer

- N6 Newspaper Masthead: top row of "Become a Member" (Phosphor `user-list`) at the left, "Established 1972" (hand-built book mark) centred, theme toggle at the right; centred wordmark and slogan; double-ruled nav row. Icons carry the accent green.
- Nav: native `<details>` disclosure below 60rem. Above it, a centred rule row whose dropdowns open on hover and on keyboard focus, each parent marked with an inline Phosphor `caret-down` that flips when open. Clicking a parent still toggles it, so the markup stays usable without CSS.
- Ft4 Dense Colophon: three-column index (about, Society, PRSt) over a legal row.

## CTA voice

Typographic first: solid underline that thickens on hover, in the display face for the membership call. Rectangular compact fills (`.button`, chips, search) where a control needs a hit area; no rounded corners anywhere.

## What every page shares

Wordmark, palette, type pairing, focus treatment, header/footer, content measure, theme toggle, and one-line interactive labels.

## What pages may vary

Homepage section composition, article imagery, archive density, and whether a page uses the wide or prose layout.

## Content syntax

Markdown runs through `markdown-it-attrs` and `markdown-it-anchor`. The kramdown attribute lists left over from the Jekyll years keep working — `{: .text-right }` on the line after a block, `{: #id }` on a heading — with attributes allow-listed to `id`, `class`, `colspan`, `rowspan`, `start`, `reversed`, and `data-*`. Headings h2 and h3 get slug ids automatically, which is what the table of contents links to.

## Search

Pagefind's component UI, indexed post-build. The nav's "🔎 Search" link points at `/search/`
and opens the modal in place when the bundle is loaded; ⌘K / Ctrl+K opens it from anywhere.
Pagefind's `--pf-*` variables are remapped to the theme tokens in `assets/css/site.css`, so the
modal follows the site's own light/dark switch rather than the OS setting. Only posts and
content pages carry `data-pagefind-body`; listing surfaces and the search page are excluded.

## Machine readability

- JSON-LD `@graph` on every page: `Organization` and `WebSite` (with a `SearchAction`), plus a page node — `BlogPosting` for posts, `Blog` for the listing, `WebPage` otherwise. Override with the `schema` front-matter key.
- Microformats2: `h-entry` on posts, `h-feed` on the homepage rails, blog listing, and archive, `p-author h-card` on bylines, `h-card` for the association in the colophon.
- Zotero and reference managers: `zotero:itemType`, Dublin Core, and `citation_*` tags on every page — `blogPost` for posts, `webpage` elsewhere — alongside the per-post `metadata.json` linked with `rel="describedby"`.

## Where the words live

Site copy lives in `_data`, not in templates: `site.json` (identity, portal, seal, analytics id),
`homepage.json` (rail headings and the standfirst), `publications.json`, `socials.json`,
`navigation.json`, `services.json`, `network.json`, `authors.json`. Templates iterate; they do
not hold sentences. Phosphor icons live in one place, `_includes/icon.liquid`, keyed by name.

## Performance

Fonts are self-hosted in `assets/fonts` (latin and latin-ext, variable, woff2) with the
`@font-face` block folded into `site.css`, so a page load touches no third-party origin before
paint. Pagefind's 217 KB bundle is fetched on the first search interaction rather than on every
page. Analytics loads after `load` on an idle callback. One stylesheet, one script, two preloaded
fonts.

## Data honesty

Homepage counts, dates, and rails come from `collections.posts` and the `pdfFiles` global — no hand-typed totals. Sixteen years of loose front-matter categories are normalised by the `bucket` filter in `eleventy.config.js` into six surfaces (position, call for papers, book, scholarship, meeting, announcement), which drives both the ledger chips and the archive tags.

## Accessibility

Every text and UI pair clears WCAG AA in both themes — measured, not assumed: body 15.1:1,
secondary 11.5:1, labels 7.4:1, meta 5.5:1, accent links 7.0:1, button text 7.0:1, board text
13.2:1 in light; every dark-mode equivalent is higher. Interactive borders carry their own token
at 3.7:1 (light) and 4.6:1 (dark). Skip-to-content is the first tab stop and moves focus to
`#main`. Headings run in order on every template, all landmarks are present, and every image
carries an `alt`.

## Notes

Do not carry forward Foundation, jQuery, Modernizr, generic card grids, `transition: all`, or decorative motion. Hover opens the desktop submenus, but never as the only way in — they are `<details>` elements that also answer to click and keyboard focus.
