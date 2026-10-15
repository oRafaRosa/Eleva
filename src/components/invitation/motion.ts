export const invitation = {
  date: "24 de outubro",
  instagram: "https://www.instagram.com/elevatheclub/",
  title: "Você está convidada",
  subtitle: "para viver algo extraordinário.",
  introduction:
    "No dia 24/10, vamos reunir mulheres que desejam viver, crescer e se conectar em outro nível.",
  closing:
    "Uma experiência pensada para despertar novas possibilidades e te lembrar que existe muito mais para viver.",
} as const;

export function phase(value: number, start: number, end: number) {
  "worklet";
  return Math.min(1, Math.max(0, (value - start) / (end - start)));
}

/** Scroll is the timeline. Reversing it reverses the same physical sequence. */
export function invitationFrame(
  progress: number,
  paperHeight: number,
  envelopeHeight: number,
) {
  "worklet";
  const p = Math.min(1, Math.max(0, progress));
  const release = phase(p, 0.02, 0.17);
  const unfold = phase(p, 0.14, 0.42);
  const extract = phase(p, 0.38, 0.9);
  return {
    sealOpacity: 1 - phase(p, 0.08, 0.18),
    sealY: -release * 42,
    sealRotation: -release * 16,
    flapRotation: -unfold * 180,
    flapBehind: unfold > 0.5,
    paperY: -extract * (paperHeight + 24),
    // Reframe the scene as the letter exits. At the end the letter is centered
    // and its bottom clears the envelope lip by 12px, regardless of viewport.
    cameraY: extract * ((paperHeight + envelopeHeight) / 2 + 12),
    envelopeOpacity: 1 - phase(p, 0.82, 1),
    hintOpacity: 1 - phase(p, 0, 0.08),
    finalOpacity: phase(p, 0.9, 1),
  };
}
