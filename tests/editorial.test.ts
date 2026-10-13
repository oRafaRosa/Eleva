import test from "node:test";
import assert from "node:assert/strict";
import {
  localDate,
  validDate,
  scheduledInstant,
  scheduleFields,
  validateDraft,
} from "../src/components/admin/editorial";
import type { PublicationDraft } from "../src/types/domain";

const draft = (changes: Partial<PublicationDraft> = {}): PublicationDraft => ({
  title: "Pausa de hoje",
  body: "Texto de demonstração.",
  summary: "",
  type: "post",
  pillar: "mind",
  status: "draft",
  ...changes,
});

test("a data editorial segue São Paulo quando UTC já entrou no dia seguinte", () => {
  assert.equal(localDate(new Date("2026-10-14T01:59:00.000Z")), "2026-10-13");
  assert.equal(localDate(new Date("2026-10-14T03:00:00.000Z")), "2026-10-14");
});

test("calendário rejeita datas inexistentes e aceita ano bissexto", () => {
  for (const value of [
    "2026-02-29",
    "2026-04-31",
    "2026-13-01",
    "13/10/2026",
    "",
  ])
    assert.equal(validDate(value), false, value);
  assert.equal(validDate("2028-02-29"), true);
});

test("agendamento converte o horário de São Paulo sem depender do fuso do dispositivo", () => {
  const iso = scheduledInstant("2026-10-14", "07:00");
  assert.equal(iso, "2026-10-14T10:00:00.000Z");
  assert.deepEqual(scheduleFields(iso), { day: "2026-10-14", time: "07:00" });
  assert.equal(
    scheduledInstant("2026-10-14", "23:30"),
    "2026-10-15T02:30:00.000Z",
  );
});

test("agendamento respeita horário de verão histórico e rejeita horário que não existiu", () => {
  assert.equal(
    scheduledInstant("2018-12-01", "07:00"),
    "2018-12-01T09:00:00.000Z",
  );
  assert.throws(() => scheduledInstant("2018-11-04", "00:30"), /não existe/);
});

test("agendamento rejeita data e hora malformadas", () => {
  for (const [day, time] of [
    ["2026-02-30", "07:00"],
    ["2026-10-14", "24:00"],
    ["2026-10-14", "7:00"],
    ["2026-10-14", "12:60"],
  ]) {
    assert.throws(() => scheduledInstant(day, time));
  }
});

test("publicação exige título e corpo, e devocional exige data válida", () => {
  assert.throws(() => validateDraft(draft({ title: "  " })), /título/);
  assert.throws(() => validateDraft(draft({ body: "  " })), /conteúdo/);
  assert.throws(
    () =>
      validateDraft(
        draft({ type: "devotional", reference_date: "2026-02-30" }),
      ),
    /data válida/,
  );
  assert.doesNotThrow(() =>
    validateDraft(draft({ type: "devotional", reference_date: "2026-10-13" })),
  );
});

test("publicação agendada exige um instante válido no futuro", () => {
  for (const scheduled_at of [null, "inválido", "2020-01-01T00:00:00Z"]) {
    assert.throws(
      () => validateDraft(draft({ status: "scheduled", scheduled_at })),
      /futuros/,
    );
  }
  assert.doesNotThrow(() =>
    validateDraft(
      draft({
        status: "scheduled",
        scheduled_at: new Date(Date.now() + 86_400_000).toISOString(),
      }),
    ),
  );
});

test("treino exige duração positiva e mídia usa HTTPS", () => {
  for (const duration_minutes of [0, -10, "abc"])
    assert.throws(
      () =>
        validateDraft(
          draft({ type: "training", details: { duration_minutes } }),
        ),
      /duração/,
    );
  assert.doesNotThrow(() =>
    validateDraft(
      draft({ type: "training", details: { duration_minutes: 15 } }),
    ),
  );
  assert.throws(
    () => validateDraft(draft({ media_url: "http://example.com/video" })),
    /https/,
  );
});
