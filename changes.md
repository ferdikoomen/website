# Changes: modern build and loading performance

This document describes the changes made on the `perf/modern-build` branch and how the
improvements were measured and validated.

## Results

Measured with Lighthouse on a local static server that serves the files with Brotli
compression, similar to CloudFront (see [Validation](#validation)).

| Metric                         | Before         | After          |
|--------------------------------|----------------|----------------|
| Performance score (mobile)     | 73             | **100**        |
| Performance score (desktop)    | 92             | **100**        |
| Largest Contentful Paint (mobile)  | 8.0 s      | 1.7 s          |
| Largest Contentful Paint (desktop) | 1.8 s      | 0.4 s          |
| First Contentful Paint (mobile) | 0.9 s         | 0.7 s          |
| Speed Index (mobile)           | 3.7 s          | 0.7 s          |
| Total Blocking Time (mobile)   | 140 ms         | 0 ms           |
| Cumulative Layout Shift        | 0              | 0              |
| Page weight (mobile)           | 1,801 KiB      | 210 KiB        |
| Page weight (desktop)          | 3,033 KiB      | 186 KiB        |
| Requests on page load          | 45             | 10 to 20       |
| Accessibility (mobile/desktop) | 90 / 94        | 96 / 100       |
| SEO                            | 92             | 100            |
| Best practices                 | 100            | 100            |

| Output                         | Before         | After          |
|--------------------------------|----------------|----------------|
| `index.html` (raw)             | 102.7 KB       | 84.5 KB        |
| `index.html` (gzip)            | 15.8 KB        | 15.0 KB        |
| `index.html` (brotli)          | 12.4 KB        | 11.6 KB        |
| Fonts loaded by the page       | 7 files, ~650 KB | 6 files, ~100 KB |
| Gallery images in the repo     | 100 MB (JPEG + WebP) | 49 MB (AVIF + WebP) |
| Files in `dist`                | 854            | 699            |

The compressed HTML (CSS and JavaScript included) is below ~14 KB, so it fits in the
first network round trip.

## What changed

### Build: webpack to Vite

The webpack setup (webpack, Babel, ts-loader, sass-loader, postcss, cssnano, terser,
html-webpack-plugin, copy plugin and ~40 packages in total) is replaced by
[Vite 8](https://vite.dev). Vite compiles the TypeScript and Sass out of the box, so
only two small local plugins are needed:

- `plugins/handlebars.ts` renders `src/index.html` as a Handlebars template. Every file
  in `src/templates` is available as a partial by its name (`{{> intro }}`), and the
  dev server reloads the page when a partial changes.
- `plugins/inline.ts` minifies the HTML (html-minifier-terser) and inlines the bundled
  CSS and JavaScript. The script is moved to the end of the document so the content
  comes first.

Other build details:

- CSS is prefixed and minified by LightningCSS, based on the `browserslist` in
  `package.json`.
- Fonts get a hashed filename (`static/fonts/SourceSansPro-Regular-<hash>.woff2`), so
  they can be cached forever. The preload links in the HTML are rewritten to the same
  hashed URLs.
- The module preload polyfill is disabled, as there is only one script.
- Babel and its polyfills are gone; the JavaScript targets modern browsers.
- `npm run build` (and `npm run release`) first type-checks with `tsc`, as Vite only
  strips types.
- `npm start` runs the Vite dev server with instant style updates.

### Project structure

```
src/        Page source: index.html, templates/, scss/, ts/, fonts/
public/     Deployed as-is: images, previews, logos, favicons, videos, robots.txt, sitemap.xml
assets/     Originals (PNG images, full fonts), not deployed
plugins/    Vite plugins
scripts/    Image and font generation
```

Before, the PNG originals of the previews were copied into `dist` (~1 MB that the page
never used), and all five font formats (eot, otf, ttf, woff, woff2) of all weights were
emitted.

### Fonts

- Only the weights the CSS uses are shipped: 200, 300, 400, 400 italic, 600 and 700.
  Black (900) and the unused Source Code Pro family are removed.
- Only WOFF2, as every supported browser supports it.
- `scripts/fonts.mjs` (`npm run fonts`) subsets the originals in `assets/fonts` to the
  Latin character set (the same range Google Fonts uses) and keeps only the default
  text features (kerning, ligatures). Each font goes from ~100 KB to ~17 KB. Hinting is
  kept for rendering quality on Windows.
- Only the five weights the first render needs (200, 300, 400, 600, 700) are preloaded,
  instead of all seven. Italic is only used further down and loads on demand. The 300
  and 600 weights are requested on the first render anyway (they are in the DOM), so
  preloading them adds no bytes but lets them download in parallel with the others
  instead of after the CSS is parsed. This lowers the mobile FCP and Speed Index from
  1.1 s to 0.7 s.
- A "Source Sans Pro Fallback" font face, Arial with `size-adjust` and ascent/descent
  overrides calculated with [Capsize](https://github.com/seek-oss/capsize), makes the
  fallback text take the same space as the web font. This minimizes the layout shift
  when the font is swapped in.

### Images

`scripts/images.mjs` (`npm run images`) replaces `resize.sh`. It uses
[sharp](https://sharp.pixelplumbing.com) to generate the images from the PNG originals
in `assets/`. The settings are in `scripts/images.config.mjs`, which the Handlebars
`srcset` and `src` helpers also read, so the templates and generated files always match.

- **AVIF + WebP instead of WebP + JPEG.** AVIF is used by all current browsers; WebP is
  the fallback. JPEG is no longer needed.
- **`srcset` with widths instead of media queries per breakpoint.** Each gallery image
  is generated at 10 widths (460 to 3520 px) and the `sizes` attribute describes the
  slide width per breakpoint, so the browser picks the best fit for its screen and
  pixel density. This replaces 12 `<source>` elements per image with 2.
- **AVIF uses 4:4:4 chroma** so the small coloured UI text in the screenshots stays
  sharp.
- **Lazy loading.** Previously every gallery image (~30 images) was downloaded on page
  load, even though all projects start closed. Now:
  - Gallery images have `loading="lazy"`.
  - The content of a closed project is `display: none`. Chrome's lazy loading ignores
    `visibility: hidden` and `overflow: hidden`, which loaded the first slides anyway.
    The open/close animation is kept with `@starting-style` and
    `transition-behavior: allow-discrete`.
  - When a project is opened, the gallery preloads the slides next to the current one,
    so swiping doesn't show empty slides.
  - The previews of the second to fourth project are lazy loaded. The first one is
    loaded right away, as it is the LCP element on desktop.
- **Width and height on all images**, so the browser can reserve the space up front.
- **Client logos** are now lazy loaded `<img>` elements (lossless WebP) instead of CSS
  background images, which were downloaded at high priority during page load.

### JavaScript

- `setPosition` read each element's height right after changing its styles, which
  forced a layout per element. It now reads all heights first.
- Removed the `webkit`-prefixed style assignments, which no supported browser needs.
- The gallery got `enable()` to preload slides when a project opens, and it re-measures
  its width on open, since it isn't laid out while closed.

### HTML, SEO and accessibility

- `robots.txt`: the sitemap URL must be absolute (`https://madebyferdi.com/sitemap.xml`).
- Removed `user-scalable=no` from the viewport meta tag. Lighthouse marks it as an
  accessibility failure because it blocks pinch zoom.
- Removed the `<base href="/">` tag, which isn't needed as all URLs are absolute.
- Inline SVGs use `href` instead of the deprecated `xlink:href`, without `xmlns`.
- Removed unused code: the Twitter icon and button styles, `kbd` styles, `-ms-` rules,
  and logo rules for clients that aren't on the page.

### Layout details kept identical

- The client logos used to be separated by a space character, because the links
  contained (hidden) text. With images inside the links the minifier removes that
  space, so the 3px are now part of the CSS margin. The logo positions were verified
  to be identical to the pixel.
- Each logo link keeps `font-size: 0; line-height: 0` and the image is top aligned,
  which reproduces the previous row height of the logo grid.

## Validation

All measurements compare a build of the original `main` branch with a build of this
branch, served by the same local static server.

### Lighthouse

- Lighthouse (npm) with the Chromium that ships with this environment, using the
  default mobile emulation (slow 4G, 4x CPU slowdown) and the desktop preset.
- The server compressed text files with Brotli and sent long cache headers for assets,
  like CloudFront would.
- The final mobile run was repeated to check the score is stable (100 both times).
- Remaining warnings are small: "font display" estimates 10 ms of savings, and the
  "Read more" button contrast is described under [Open points](#open-points).

### Network requests

A Playwright script loaded both builds at four viewport sizes (390, 800, 1440 and
1920 px wide) and logged every request:

- Before: 45 requests on load, including all gallery images and all 7 fonts.
- After: 10 to 20 requests on load: 5 preloaded fonts, the other used fonts, the
  previews, the client logos (only near the viewport) and a favicon. No gallery images.
- Opening the Capture3 project loaded the first two slides; clicking "next" loaded the
  third slide, confirming the preloading of neighbouring slides.

### Visual comparison

The same Playwright script took full-page screenshots of both builds at the four
viewport sizes, plus screenshots after opening a project and after moving to the next
slide. The screenshots were compared with ImageMagick (`compare -metric AE -fuzz 8%`)
and inspected side by side:

- Page heights are identical at all sizes.
- Text, buttons, spacing and logo positions match exactly (logo positions were also
  compared with `getBoundingClientRect`).
- The only remaining pixel differences are in the preview and gallery images, caused
  by the new encoding (AVIF from the PNG originals instead of WebP). Zoomed in, they
  look the same or slightly sharper.
- The open project and the gallery navigation look and behave the same.

### Image quality

Before generating all images, AVIF and WebP settings were compared against the PNG
originals with SSIM (structural similarity, 1.0 = identical), measured on two
representative images at 1170 px wide:

| Image                       | Old WebP (q95)     | AVIF q65 (4:4:4)   | AVIF q70 (4:4:4)   | AVIF q75 (4:4:4)   |
|-----------------------------|--------------------|--------------------|--------------------|--------------------|
| smartparks-map-details (UI) | 155 KB, SSIM 0.992 | 65 KB, SSIM 0.983  | 76 KB, SSIM 0.987  | 86 KB, SSIM 0.989  |
| mini-physics-2 (3D render)  | 141 KB, SSIM 0.992 | 59 KB, SSIM 0.992  | 71 KB, SSIM 0.995  | not measured       |

Quality 75 was chosen: it is close to the old images on the hardest case (small UI text)
and matches or exceeds them on rendered images, at roughly half the size.

### Font subsetting

The subset fonts were checked for size (each ~17 KB) and the screenshots confirmed
the text renders identically. The Latin range includes characters used on the page,
like the non-breaking hyphen in "multi‑threading" and typographic quotes.

### Code quality

- `tsc` (strict) passes.
- `eslint .` (including Prettier) passes.
- `vite build` passes without warnings.
- The dev server was tested with Playwright: changing a Handlebars partial reloads the
  page with the new content.

## Open points

- **"Read more" button contrast (mobile):** white text on the green `#33CC33` has a
  contrast ratio of about 2:1, below the 4.5:1 that accessibility guidelines require.
  This is the only remaining accessibility finding (score 96). It is a design choice,
  so it has not been changed.
- **CloudFront:** enable "Compress objects automatically" so the HTML is served with
  Brotli or gzip. The README has suggested cache headers: `index.html` revalidated on
  every request, the hashed fonts cached forever.
- **Old image URLs:** the old `.jpg` and `.webp` gallery images no longer exist. This
  only matters if something links to them directly.
- **Browser support:** tested in Chromium only. The open animation of the project
  content uses `@starting-style` (Safari 17.5+, Firefox 129+). Older browsers still
  open projects, but the content appears without the fade in.
- **Unused logos:** the logos of SDL, SVB, SmartParks, TTTO and Demonsters are still
  generated (they are in `assets/logos`) but not shown on the page.
