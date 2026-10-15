import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const tones = ["burgundy", "pink", "ivory", "white"];

test("versões da marca preservam a mesma imagem original e o enquadramento", () => {
  for (const tone of tones) {
    const svg = readFileSync(`assets/brand/eleva-${tone}.svg`, "utf8");
    const source = svg.match(/data:image\/png;base64,([^"\s]+)/)?.[1];
    assert.ok(source);
    assert.equal(
      createHash("sha256").update(Buffer.from(source, "base64")).digest("hex"),
      "d1be11f9f3086f708fc2524d5e672181cc4a7dff0761888d69c04fe5173f0e6f",
    );
    assert.ok(svg.includes('viewBox="1487 1248 3240 891"'));
    assert.ok(svg.includes('color-interpolation-filters="sRGB"'));
    assert.ok(!svg.includes("<text"));
  }
});

test("PNGs têm dimensões iguais e canal de transparência RGBA", () => {
  for (const tone of tones) {
    const png = readFileSync(`assets/brand/eleva-${tone}.png`);
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.equal(png.readUInt32BE(16), 1600);
    assert.equal(png.readUInt32BE(20), 440);
    assert.equal(png[25], 6);
  }
});

test("marca substitui apenas assinaturas visuais, preservando rótulos de navegação", () => {
  for (const file of [
    "app/index.tsx",
    "app/admin.tsx",
    "src/components/ui.tsx",
  ]) {
    const source = readFileSync(file, "utf8");
    assert.ok(source.includes("<BrandLogo"));
    assert.ok(!/>ELEVA<\/Text>/.test(source));
  }
  const component = readFileSync("src/components/BrandLogo.tsx", "utf8");
  assert.ok(
    component.includes('accessibilityLabel={decorative ? undefined : "ELEVA"}'),
  );
});
