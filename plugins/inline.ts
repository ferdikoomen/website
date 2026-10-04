import { minify } from 'html-minifier-terser';
import type { Plugin } from 'vite';

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Minifies the HTML and inlines the bundled CSS and JavaScript into it, so the page
 * can render from a single request. Fonts and images remain separate files.
 */
export const inline = (): Plugin => ({
    name: 'inline',
    apply: 'build',
    enforce: 'post',

    async generateBundle(_, bundle) {
        for (const page of Object.values(bundle)) {
            if (page.type !== 'asset' || !page.fileName.endsWith('.html')) {
                continue;
            }

            let html = await minify(String(page.source), {
                collapseBooleanAttributes: true,
                collapseWhitespace: true,
                decodeEntities: true,
                minifyCSS: true,
                minifyJS: true,
                removeAttributeQuotes: true,
                removeComments: true,
                removeOptionalTags: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                sortAttributes: true,
                sortClassName: true,
                useShortDoctype: true,
            });

            for (const file of Object.values(bundle)) {
                const url = escape(`/${file.fileName}`);
                const script = new RegExp(`<script[^>]*src=["']?${url}["']?[^>]*></script>`);
                const style = new RegExp(`<link[^>]*href=["']?${url}["']?[^>]*>`);

                if (file.type === 'chunk' && script.test(html)) {
                    const code = file.code.trim().replace(/<\/script/gi, '<\\/script');
                    // Vite places the entry script in the head, move it to the end so the content comes first
                    html = html.replace(script, '') + `<script type=module>${code}</script>`;
                    delete bundle[file.fileName];
                }

                if (file.type === 'asset' && file.fileName.endsWith('.css') && style.test(html)) {
                    const code = String(file.source)
                        .trim()
                        .replace(/<\/style/gi, '<\\/style');
                    html = html.replace(style, () => `<style>${code}</style>`);
                    delete bundle[file.fileName];
                }
            }

            page.source = html;
        }
    },
});
