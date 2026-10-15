import test from "node:test";
import assert from "node:assert/strict";
import {
  invitationFrame,
  phase,
  invitation,
} from "../src/components/invitation/motion";

test("convite começa fechado, com lacre e carta dentro do envelope", () => {
  const f = invitationFrame(0, 480, 240);
  assert.equal(f.sealOpacity, 1);
  assert.ok(f.flapRotation === 0);
  assert.ok(f.paperY === 0);
  assert.equal(f.cameraY, 0);
  assert.equal(f.finalOpacity, 0);
});
test("lacre sai antes da aba e carta espera a aba abrir", () => {
  assert.equal(invitationFrame(0.2, 480, 240).sealOpacity, 0);
  assert.ok(invitationFrame(0.3, 480, 240).paperY === 0);
  assert.ok(invitationFrame(0.38, 480, 240).flapRotation < -150);
  assert.ok(invitationFrame(0.6, 480, 240).paperY < 0);
});
test("a carta termina centralizada e fora do envelope em diferentes medidas", () => {
  for (const paper of [360, 480, 620])
    for (const envelope of [180, 240, 300]) {
      const f = invitationFrame(1, paper, envelope);
      const viewport = 800;
      const envelopeTop = viewport / 2 - envelope / 2 + f.cameraY;
      const letterTop = envelopeTop + 12 + f.paperY;
      assert.equal(letterTop, (viewport - paper) / 2);
      assert.equal(envelopeTop - (letterTop + paper), 12);
      assert.equal(f.finalOpacity, 1);
    }
});
test("rolagem reversa é determinística e limites ignoram overshoot da mola", () => {
  assert.deepEqual(
    invitationFrame(-0.2, 480, 240),
    invitationFrame(0, 480, 240),
  );
  assert.deepEqual(
    invitationFrame(1.2, 480, 240),
    invitationFrame(1, 480, 240),
  );
  assert.deepEqual(
    invitationFrame(0.4, 480, 240),
    invitationFrame(0.4, 480, 240),
  );
  assert.equal(phase(0.5, 0.6, 0.8), 0);
  assert.equal(phase(1, 0.6, 0.8), 1);
});
test("convite público não inventa inscrição ou local", () => {
  assert.equal(invitation.instagram, "https://www.instagram.com/elevatheclub/");
  assert.equal(invitation.date, "24 de outubro");
});
