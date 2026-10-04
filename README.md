# Personal website of Ferdi Koomen

Source of [madebyferdi.com](https://madebyferdi.com): a fast, lightweight single-page portfolio.
The production build renders the Handlebars templates, compiles and minifies the TypeScript and
Sass, and inlines everything into a single compact `dist/index.html` — no render-blocking
requests.

## Install

```bash
npm install
```

## Run (dev server with hot reload)

```bash
npm run start
```

## Release (optimized single-file build)

```bash
npm run release
```

Output is written to `dist/` and can be deployed to any static host (S3 + CloudFront).

## Build details

- [Vite](https://vite.dev) build with esbuild minification (fast, compact output)
- Handlebars templates in `src/templates`, rendered and minified at build time
- WOFF2-only web fonts, preloaded in the document head
- Images/videos/fonts are served from `/static/...` with stable URLs for long cache lifetimes
