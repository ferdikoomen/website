/**
 * Responsive image configuration, shared by `scripts/images.mjs` (generates the files)
 * and the Handlebars `srcset` / `src` helpers in `vite.config.ts` (references the files).
 *
 * Every PNG in `input` is resized to each of the `widths` and encoded in each of the `formats`,
 * the result is written to `output` as `<name>-<width>.<format>` and served from `url`.
 */
export const images = {
    // Project galleries, originals are 3520x2200
    gallery: {
        input: 'assets/images',
        output: 'public/static/images',
        url: '/static/images',
        widths: [460, 650, 920, 1170, 1300, 1470, 1760, 2340, 2940, 3520],
        fallback: 1170,
        formats: {
            // 4:4:4 keeps the small (colored) UI text in the screenshots crisp
            avif: { quality: 75, chromaSubsampling: '4:4:4', effort: 4 },
            webp: { quality: 82, effort: 6 },
        },
    },

    // Project previews, originals are 1260x600
    previews: {
        input: 'assets/previews',
        output: 'public/static/gfx',
        url: '/static/gfx',
        widths: [630, 945, 1260],
        fallback: 630,
        formats: {
            avif: { quality: 75, chromaSubsampling: '4:4:4', effort: 4 },
            webp: { quality: 82, effort: 6 },
        },
    },

    // Client logos, originals are 320x320
    logos: {
        input: 'assets/logos',
        output: 'public/static/gfx',
        url: '/static/gfx',
        widths: [320],
        fallback: 320,
        formats: {
            webp: { lossless: true, effort: 6 },
        },
    },
};
