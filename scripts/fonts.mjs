/**
 * Subsets the original fonts in `assets/fonts` to the Latin character set and writes them to `src/fonts`,
 * this reduces each font from ~100KB to ~16KB. Run `npm run fonts` after adding or changing a font.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

import subsetFont from 'subset-font';

const input = 'assets/fonts';
const output = 'src/fonts';

// Same "latin" unicode-range as Google Fonts uses
const ranges = [
    [0x0000, 0x00ff],
    [0x0131, 0x0131],
    [0x0152, 0x0153],
    [0x02bb, 0x02bc],
    [0x02c6, 0x02c6],
    [0x02da, 0x02da],
    [0x02dc, 0x02dc],
    [0x0304, 0x0304],
    [0x0308, 0x0308],
    [0x0329, 0x0329],
    [0x2000, 0x206f],
    [0x20ac, 0x20ac],
    [0x2122, 0x2122],
    [0x2191, 0x2191],
    [0x2193, 0x2193],
    [0x2212, 0x2212],
    [0x2215, 0x2215],
    [0xfeff, 0xfeff],
    [0xfffd, 0xfffd],
];

let text = '';
for (const [from, to] of ranges) {
    for (let code = from; code <= to; code++) {
        text += String.fromCodePoint(code);
    }
}

await fs.mkdir(output, { recursive: true });

for (const file of (await fs.readdir(input)).filter(file => file.endsWith('.woff2'))) {
    const font = await fs.readFile(path.join(input, file));
    const subset = await subsetFont(font, text, {
        targetFormat: 'woff2',
        // Only keep the default text features, dropping glyphs for small caps, old style figures, etc.
        keepFeatures: ['ccmp', 'locl', 'mark', 'mkmk', 'kern', 'liga', 'calt'],
    });
    await fs.writeFile(path.join(output, file), subset);
    console.log(`${file} ${Math.round(font.length / 1024)}KB -> ${Math.round(subset.length / 1024)}KB`);
}
