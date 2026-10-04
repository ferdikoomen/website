/**
 * Generates the responsive images from the originals in `assets/` (see `images.config.mjs`).
 * Existing files are skipped, use `npm run images -- --force` to regenerate everything.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

import { images } from './images.config.mjs';

const force = process.argv.includes('--force');

const exists = async file => {
    try {
        await fs.access(file);
        return true;
    } catch {
        return false;
    }
};

for (const { input, output, widths, formats } of Object.values(images)) {
    const files = (await fs.readdir(input)).filter(file => file.endsWith('.png')).sort();
    await fs.mkdir(output, { recursive: true });

    for (const file of files) {
        const name = path.basename(file, '.png');
        const jobs = [];

        for (const width of widths) {
            for (const [format, options] of Object.entries(formats)) {
                const target = path.join(output, `${name}-${width}.${format}`);
                if (force || !(await exists(target))) {
                    jobs.push(
                        sharp(path.join(input, file))
                            .resize({ width, withoutEnlargement: true })
                            .toColourspace('srgb')
                            .toFormat(format, options)
                            .toFile(target)
                            .then(({ size }) => console.log(`${target} ${Math.round(size / 1024)}KB`))
                    );
                }
            }
        }

        await Promise.all(jobs);
    }
}
