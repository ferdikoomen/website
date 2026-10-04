import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';
import { defineConfig } from 'vite';

import { handlebars } from './plugins/handlebars.ts';
import { inline } from './plugins/inline.ts';
import { images } from './scripts/images.config.mjs';

type ImageGroup = keyof typeof images;

export default defineConfig({
    root: 'src',
    publicDir: '../public',

    server: {
        port: 8080,
        host: true,
        open: true,
    },

    css: {
        // Transpiles and prefixes the CSS for the browsers in the "browserslist" (package.json)
        transformer: 'lightningcss',
        lightningcss: {
            targets: browserslistToTargets(browserslist()),
        },
    },

    build: {
        outDir: '../dist',
        emptyOutDir: true,
        assetsInlineLimit: 0,
        cssMinify: 'lightningcss',
        // There is only one chunk, so the module preload polyfill is not needed
        modulePreload: false,
        rolldownOptions: {
            output: {
                assetFileNames: ({ names }) => (names.some(name => name.endsWith('.woff2')) ? 'static/fonts/[name]-[hash][extname]' : 'static/[name]-[hash][extname]'),
            },
        },
    },

    plugins: [
        handlebars({
            partials: 'src/templates',
            helpers: {
                // Responsive image URLs, see scripts/images.config.mjs
                // Usage: {{srcset "gallery" "mini-mobile-1" "avif"}} or {{src "gallery" "mini-mobile-1"}}
                srcset: (group: ImageGroup, name: string, format: string) => {
                    const { url, widths } = images[group];
                    return widths.map(width => `${url}/${name}-${width}.${format} ${width}w`).join(', ');
                },
                src: (group: ImageGroup, name: string) => {
                    const { url, fallback } = images[group];
                    return `${url}/${name}-${fallback}.webp`;
                },
            },
        }),
        inline(),
    ],
});
