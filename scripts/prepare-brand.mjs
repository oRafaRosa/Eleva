import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

// Author a code-native SVG from the original embedded PDF image. The source
// pixels stay intact: an sRGB color matrix derives coverage from the two inks.
// No font substitution, tracing, path simplification or generated lettering.
const source = process.argv[2];
if (!source)
  throw new Error("Informe o PNG original extraído da capa institucional.");
const require = createRequire(import.meta.url);
const sharp = require("sharp");
const png = await fs.readFile(source);
const meta = await sharp(png).metadata();
if (meta.width !== 5999 || meta.height !== 3375)
  throw new Error("O arquivo não corresponde à capa institucional conferida.");
const href = `data:image/png;base64,${png.toString("base64")}`;
const output = path.resolve("assets/brand");
await fs.mkdir(output, { recursive: true });
const tones = {
  burgundy: "#4B0B22",
  pink: "#EAD4D9",
  ivory: "#FBF7F3",
  white: "#FFFFFF",
};
for (const [name, hex] of Object.entries(tones)) {
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  // Original background R=71, lettering R=245. Edge pixels keep their coverage.
  const matrix = `0 0 0 0 ${rgb[0]} 0 0 0 0 ${rgb[1]} 0 0 0 0 ${rgb[2]} ${255 / 174} 0 0 0 ${-71 / 174}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1600" height="440" viewBox="1487 1248 3240 891" role="img" aria-label="ELEVA"><title>ELEVA</title><defs><filter id="ink" x="0" y="0" width="5999" height="3375" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${matrix}"/></filter></defs><image width="5999" height="3375" filter="url(#ink)" xlink:href="${href}"/></svg>`;
  await fs.writeFile(path.join(output, `eleva-${name}.svg`), svg);
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(output, `eleva-${name}.png`));
}
console.log(
  "Quatro versões com a mesma silhueta, em SVG e PNG transparente (1600 × 440).",
);
