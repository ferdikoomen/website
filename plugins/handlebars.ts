import fs from 'node:fs';
import path from 'node:path';

import Handlebars from 'handlebars';
import type { Plugin } from 'vite';

type Options = {
    partials: string;
    helpers?: Handlebars.HelperDeclareSpec;
};

/**
 * Renders index.html as a Handlebars template. Every `.hbs` file in the `partials`
 * directory is available as a partial by its filename, e.g. `{{> intro }}`.
 */
export const handlebars = ({ partials, helpers = {} }: Options): Plugin => ({
    name: 'handlebars',

    transformIndexHtml: {
        order: 'pre',
        handler: html => {
            const instance = Handlebars.create();
            instance.registerHelper(helpers);
            for (const file of fs.readdirSync(partials)) {
                if (file.endsWith('.hbs')) {
                    instance.registerPartial(path.basename(file, '.hbs'), fs.readFileSync(path.join(partials, file), 'utf8'));
                }
            }
            return instance.compile(html)({});
        },
    },

    // Partials are not part of the module graph, so reload the page when one changes
    hotUpdate({ file }) {
        if (file.endsWith('.hbs') && this.environment.name === 'client') {
            this.environment.hot.send({ type: 'full-reload' });
            return [];
        }
    },
});
