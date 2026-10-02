# National Association of Baptist Professors of Religion
[![Deploy Eleventy site](https://github.com/adamdjbrett/nabpr/actions/workflows/pages.yml/badge.svg)](https://github.com/adamdjbrett/nabpr/actions/workflows/pages.yml)

The source for [nabpr.org](https://nabpr.org), built with [Build Awesome](https://build.awesome.me/).

## Local development

```sh
npm install
npm run dev
```

The development site is served at `http://localhost:8080`. The equivalent direct command is:

```sh
npx @awesome.me/buildawesome --serve
```

For a production build and its integrity check:

```sh
npm run build
npm run check
```

`npm run build` runs Eleventy and then [Pagefind](https://pagefind.app/), which indexes `_site/`
and writes the search bundle to `_site/pagefind/`. Site search — the `/search/` page and the
modal opened from the nav or ⌘K — needs that bundle, so it is absent under `npm run dev`
until a full build has run at least once. A full build takes about two seconds, and writes to
`_site/`.

## Deploying

The output in `_site/` is plain static files with no server requirements, so it deploys as-is to
GitHub Pages, Cloudflare Pages, Netlify, or xmit. Build command `npm run build`, publish
directory `_site`.

Three host-specific files ship with the build and are ignored by hosts that don't read them:

- `_headers` — longer cache lifetimes for fonts and images (Netlify, Cloudflare Pages). Nothing
  depends on it; without it the site is correct, just less cacheable.
- `_redirects` — the same redirects Netlify-style, including the Bridgy Fed WebFinger hand-off.
- `.htaccess` — the Apache equivalent, plus the AI-crawler block.

Redirects that must work everywhere are built as HTML stub pages from `redirect_from` front
matter and the `EXTRA_REDIRECTS` list in `eleventy.config.js`, so they survive any host.

## Fediverse

The site is marked up for [Bridgy Fed](https://fed.brid.gy/docs): a representative h-card on the
home page, `h-entry` on every post with a `u-bridgy-fed` opt-in link, and `rel="me"` links to the
association's profiles. Signing up at fed.brid.gy is the remaining step. On a host that cannot
redirect `/.well-known/webfinger` — GitHub Pages — the account is `@nabpr.org@web.brid.gy`; on
Cloudflare, Netlify, or Apache the shipped redirects make it `@nabpr.org@nabpr.org`.

## Design

The current visual direction is documented in [design.md](design.md): a newspaper masthead over a filterable ledger of the association's record, set in Fraunces and Newsreader, with a light and dark theme the reader can toggle. It keeps the editorial character of [Feeling Responsive](https://github.com/Phlow/feeling-responsive) while replacing its Jekyll/Foundation runtime with a small Build Awesome project and native CSS.

To update the header's primary navigation, see [docs/navigation.md](docs/navigation.md).

## License

MIT. See [LICENSE](LICENSE).
