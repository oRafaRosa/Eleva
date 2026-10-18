import assert from "node:assert/strict";
import test from "node:test";
import { sealCenter, sealDuration } from "../src/utils/tabSeal";

test("carimbo encontra os cinco centros e limita índices", () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((index) => sealCenter(320, index, 5)),
    [32, 96, 160, 224, 288],
  );
  assert.equal(sealCenter(320, -2, 5), 32);
  assert.equal(sealCenter(320, 10, 5), 288);
  assert.equal(sealCenter(0, 2, 5), 0);
  assert.equal(sealCenter(Number.NaN, 2, 5), 0);
});

test("travessia é curta e desaparece com redução de movimento", () => {
  assert.equal(sealDuration(0, false), 180);
  assert.equal(sealDuration(100, false), 215);
  assert.equal(sealDuration(1000, false), 320);
  assert.equal(sealDuration(100, true), 0);
});
