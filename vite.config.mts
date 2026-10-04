import { existsSync } from 'node:fs';
import { cp, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import handlebars from 'handlebars';
import { minify } from 'html-minifier-terser';
import sirv from 'sirv';
import { defineConfig, type Plugin } from 'vite';

const projectRoot = path.resolve('.');
const srcDir = path.resolve('src');
const templateFile = path.resolve('src/index.hbs');
const templateDir = path.resolve('src/templates');
const staticDir = path.resolve('src/static');
const outDir = path.resolve('dist');

const assetExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico', '.woff2', '.mp4'];

const renderTemplate = async () => {
    const instance = handlebars.create();
    for (const file of await readdir(templateDir)) {
        if (file.endsWith('.hbs')) {
            const name = path.basename(file, '.hbs');
            const source = await readFile(path.join(templateDir, file), 'utf-8');
            instance.registerPartial(name, source);
            instance.registerPartial(`templates/${name}`, source);
        }
    }
    return instance.compile(await readFile(templateFile, 'utf-8'))({});
};

const inlineHtmlPlugin = (): Plugin => ({
    name: 'inline-html',
    async generateBundle(_, bundle) {
        let script = '';
        let style = '';
        for (const file of Object.values(bundle)) {
            if (file.type === 'chunk' && file.isEntry) {
                script = file.code;
            } else if (file.fileName?.endsWith('.css')) {
                style = file.source.toString();
            }
        }
        const html = await renderTemplate();
        const withoutDevScript = html.replace(/\s*<script type="module" src="[^"]*main\.ts"><\/script>/, '');
        const inlined = withoutDevScript.replace('</body>', `<style>${style}</style><script>${script}</script></body>`);
        const minified = await minify(inlined, {
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: true,
            keepClosingSlash: true,
        });
        for (const [name, file] of Object.entries(bundle)) {
            if (file.type === 'chunk' || name.endsWith('.css')) {
                delete bundle[name];
            }
        }
        this.emitFile({ type: 'asset', fileName: 'index.html', source: minified });
        this.emitFile({ type: 'asset', fileName: 'favicon.ico', source: await readFile(path.join(staticDir, 'gfx', 'favicon.ico')) });
        for (const entry of ['robots.txt', 'sitemap.xml']) {
            this.emitFile({ type: 'asset', fileName: entry, source: await readFile(path.join(srcDir, entry), 'utf-8') });
        }
    },
    async writeBundle() {
        for (const dir of ['fonts', 'gfx', 'images', 'videos']) {
            const from = path.join(staticDir, dir);
            if (!existsSync(from)) {
                continue;
            }
            await cp(from, path.join(outDir, 'static', dir), {
                recursive: true,
                filter: source => path.extname(source) === '' || assetExtensions.includes(path.extname(source)),
            });
        }
    },
    configureServer(server) {
        const serveStatic = sirv(staticDir, { dev: true });
        server.middlewares.use((req, res, next) => {
            if (req.url === '/' || req.url === '/index.html') {
                res.setHeader('Content-Type', 'text/html');
                renderTemplate()
                    .then(html => res.end(html.replace('src="/static/ts/main.ts"', 'src="/src/static/ts/main.ts"')))
                    .catch(next);
                return;
            }
            if (req.url?.startsWith('/static/')) {
                req.url = req.url.slice('/static'.length);
                serveStatic(req, res, next);
                return;
            }
            next();
        });
    },
});

export default defineConfig({
    root: projectRoot,
    publicDir: false,
    base: '/',

    build: {
        outDir,
        emptyOutDir: true,
        target: 'es2020',
        cssMinify: 'esbuild',
        modulePreload: false,
        assetsInlineLimit: 0,
        rollupOptions: {
            input: path.resolve('src/static/ts/main.ts'),
            output: {
                codeSplitting: false,
                entryFileNames: 'static/js/main.js',
                assetFileNames: 'static/css/[name][extname]',
            },
        },
    },

    esbuild: {
        legalComments: 'none',
        drop: ['console', 'debugger'],
    },

    plugins: [inlineHtmlPlugin()],

    server: {
        port: 8080,
    },
});
