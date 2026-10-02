# National Association of Baptist Professors of Religion

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

Every build — `build` and `dev` alike — ends by running [Pagefind](https://pagefind.app/) from
`eleventy.config.js`, which indexes `_site/` into `_site/pagefind/`, so site search works locally
too. A full build takes about two seconds.

## Layout

- `src/` — everything Eleventy builds: `posts/`, `pages/`, `blog/`, root templates (feeds,
  sitemap, robots), `_includes/layouts/` and `_includes/partials/`, and the passthrough
  `assets/`, `images/`, `pdfs/`, `wp-content/`.
- `_data/` — site data (navigation, footer columns, socials, authors, bots).
- `scripts/` — `check-build.mjs`, the post-build integrity check.
- `docs/` — design system and how-tos.

New posts go in `src/posts/` as `YYYY-MM-DD-slug.md`; the URL is `/slug/`.

## Deploying

GitHub Actions (`.github/workflows/pages.yml`) builds, checks, and deploys `_site/` to GitHub
Pages on every push to `master`. The custom domain is set in the repository's Pages settings.

Redirects are built as HTML stub pages from `redirect_from` front matter and the
`EXTRA_REDIRECTS` list in `eleventy.config.js`, so they work on any static host.

## Fediverse

The site is marked up for [Bridgy Fed](https://fed.brid.gy/docs): a representative h-card on the
home page, `h-entry` on every post with a `u-bridgy-fed` opt-in link, and `rel="me"` links to the
association's profiles. Signing up at fed.brid.gy is the remaining step. GitHub Pages cannot redirect
`/.well-known/webfinger`, so the account is `@nabpr.org@web.brid.gy`.

## Design

The current visual direction is documented in [docs/design.md](docs/design.md): a newspaper masthead over a filterable ledger of the association's record, set in Fraunces and Newsreader, with a light and dark theme the reader can toggle. It keeps the editorial character of [Feeling Responsive](https://github.com/Phlow/feeling-responsive) while replacing its Jekyll/Foundation runtime with a small Build Awesome project and native CSS.

To update the header's primary navigation, see [docs/navigation.md](docs/navigation.md).

## License

MIT. See [LICENSE](LICENSE).
