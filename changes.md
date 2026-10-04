# Changes

This document describes the modernization of the build process and the performance
optimizations applied to the site, plus how each change was validated.

## 1. Build migration: webpack → Vite

**Before:** webpack 5 + babel + ts-loader + postcss/cssnano + a pinned `html-webpack-plugin`
(see the old README issue: versions > 5.6.0 broke the build), with `html-webpack-inline-source-plugin`
to inline JS/CSS into the HTML.

**After:** a single [`vite.config.mts`](vite.config.mts) using Vite (rolldown + esbuild):

- TypeScript is compiled and minified by esbuild directly (no babel, no ts-loader)
- Sass is compiled by the bundled `sass` and minified by esbuild
- Handlebars templates in `src/templates` are registered and rendered at build time by a
  small custom plugin (`inlineHtmlPlugin`)
- The minified JS and CSS are inlined into the rendered HTML, which is then minified with
  `html-minifier-terser` — the site remains a **single `dist/index.html`** with zero
  render-blocking requests
- Static assets (`static/gfx`, `static/images`, `static/videos`, `static/fonts`) are copied
  to `dist/static/...` with **stable, non-hashed URLs**, so S3/CloudFront cache lifetimes
  can be long and old deployments never break references
- Dev server (`npm start`) serves the rendered template and transforms TS/SCSS on the fly
  with hot reload

~30 devDependencies were removed; the production build went from ~4.4s to ~1s.
The `dist/` output layout is unchanged, so the existing S3 + CloudFront deployment
works without changes.

**Validation:** `npm run release` output inspected (JS/CSS inlined, asset URLs intact,
fonts/gfx/images/videos copied, `favicon.ico` at root); dev server smoke test (`/`,
`/static/*`, `/src/static/ts/main.ts` all 200 with correct transforms).

## 2. Compact output

- `dist/index.html`: **100.8 KB / 15.8 KB gzip** (webpack baseline: 102.7 KB)
- esbuild minification with `drop: ['console', 'debugger']` and no legal comments
- HTML minified with `html-minifier-terser` (collapse whitespace, minify inline JS/CSS)
- Non-web files (`.ai`, `resize.sh`, source TS/SCSS) are no longer published to `dist/`

## 3. Fonts (biggest performance win)

- Dropped `.eot/.woff/.otf/.ttf` legacy formats and the unused Source Code Pro family
  and Black (900) weight: **133 font files → 6 woff2 faces**
- Subset the remaining faces to latin + basic punctuation/quotes with `pyftsubset`:
  **~600 KB → 87 KB total (~85% smaller)**, each face ~14 KB
- `font-display: swap` and `preload` for all six faces — text renders in its final
  face immediately, no late font swap
- Removed the old 7-face preload list (Bold/Black/It were never above the fold)

**Validation:** file sizes before/after subsetting; Lighthouse network payload showed
fonts dropping out of the top transfers; LCP improved 7.6s → 2.4s.

## 4. Rendering and preloading fixes

- **Bug fix:** the production HTML still referenced `/static/ts/main.ts` (404) from the
  dev entry tag; the build now strips the dev script tag from production output
- Preview and gallery images get `loading="lazy"` + `decoding="async"`, so the ~1 MB of
  collapsed-project gallery imagery no longer competes with first render
- Added `<meta name="theme-color">`
- Existing `srcset`/WebP responsive images were already good — left untouched

## 5. Accessibility and SEO

- `robots.txt`: relative `Sitemap: sitemap.xml` → absolute
  `https://madebyferdi.com/sitemap.xml` (failed the SEO audit)
- Removed `user-scalable=no` from the viewport meta so pinch-zoom works
- Green `.btn-more` (mobile) and button hover states use dark `#111111` text on
  `#33CC33` (contrast 8.8:1) instead of white (2.1:1), passing WCAG AA — brand color
  unchanged

## 6. Maintenance

- `tsconfig.json` modernized to `moduleResolution: bundler`
- Removed obsolete `browserslist` (esbuild targets by build target: `es2020`)
- README updated to describe the new build

## Validation summary

All checks run against the production build (`npm run release`):

| Check                 | Result                                              |
| --------------------- | --------------------------------------------------- |
| `npx tsc --noEmit`    | OK                                                  |
| `npm run eslint`      | OK                                                  |
| Production build      | ~1s, single inlined `index.html`, no console errors |
| Dev server smoke test | `/`, `/static/*`, `/src/static/ts/main.ts` → 200    |

### Lighthouse (mobile emulation, throttled 4G, local production build)

| Category                 | Before | After     |
| ------------------------ | ------ | --------- |
| Performance              | 73     | **98**    |
| Accessibility            | 90     | **100**   |
| Best Practices           | 96     | **100**   |
| SEO                      | 92     | **100**   |
| First Contentful Paint   | 2.4 s  | **1.2 s** |
| Largest Contentful Paint | 7.6 s  | **2.4 s** |
| Total Blocking Time      | 0 ms   | 0 ms      |
| Cumulative Layout Shift  | 0      | 0         |

Zero failing audits remain. The residual LCP is dominated by simulated 4G throttling of
the ~100 KB HTML document; with CloudFront compression (brotli/gzip) on a real connection
it should land well below a second.

## Deployment notes (S3 + CloudFront)

The `dist/` layout is unchanged, so deployment keeps working as-is, but the following
CloudFront/S3 settings are recommended to get the most out of this build.

### 1. Enable compression on the distribution

CloudFront does **not** compress responses by default. The inlined `index.html` shrinks
from ~100 KB to ~16 KB gzip (and less with brotli), so this is the single highest-impact
setting:

- Distribution → Settings → Edit -> **Compress objects automatically: Yes**
- Or use a cache policy with **Gzip and Brotli** compression enabled
- Compression only applies to compressible `Content-Type`s (`text/html`, `text/css`,
  `application/javascript`, `image/svg+xml`, ...); fonts and media are never compressed

### 2. Cache policy: long TTL for `static/`, short for `index.html`

Because asset URLs are stable (`/static/...`, no content hashes), the cache split matters:

- `/static/gfx/*`, `/static/images/*`, `/static/videos/*`, `/static/fonts/*` -> **long TTL**
  (e.g. 1 year). These files never change name; when you replace an image you keep the
  same filename, so include changed assets in the deploy-time invalidation
- `/index.html` and the root path -> short TTL (e.g. 60s) so deploys go live quickly

Avoid caching `index.html` for a long time; everything else can ride the 1-year TTL
because unchanged files are byte-identical between deploys.

### 3. Correct headers for fonts and media

- Serve `woff2` with `Content-Type: font/woff2` (S3 infers this from the extension; keep
  extension mapping intact if you upload with a custom script)
- The font preload tags use `crossorigin`, which matches the CORS-anonymous fetch the
  browser always uses for fonts - this works fine same-origin and needs no extra
  `Access-Control-Allow-Origin` header
- `mp4` videos: keep `Content-Type: video/mp4` and a long cache TTL; they are only
  fetched when a project is opened

### 4. HTTP/2 or HTTP/3

Modern viewers automatically get HTTP/2/3 from CloudFront. Because the preloaded fonts
are now tiny (~14 KB each), all six requests multiplex in parallel without hurting
first paint.

### 5. Deploy script shape (unchanged)

```bash
npm run release
aws s3 sync dist/ s3://<bucket> --delete --cache-control "public, max-age=31536000" --exclude "index.html"
aws s3 cp dist/index.html s3://<bucket>/index.html --cache-control "public, max-age=60"
aws cloudfront create-invalidation --distribution-id <id> --paths "/index.html"
```

Invalidate `index.html` (and any changed `/static/...` files) on each deploy.
