import test from "node:test";
import assert from "node:assert/strict";
import {
  publicationContent,
  readableValue,
} from "../src/utils/publicationDetails";
test("devocional preserva versículo, aplicação e oração separados do corpo", () => {
  const content = publicationContent({
    type: "devotional",
    summary: "Resumo",
    body: "Reflexão\n\nContinuação",
    details: {
      verse: "Mateus 6:34",
      application: "Ação de hoje",
      prayer: "Oração completa",
    },
  });
  assert.deepEqual(content.paragraphs, ["Reflexão", "Continuação"]);
  assert.deepEqual(
    content.sections.map((section) => [section.key, section.paragraphs]),
    [
      ["verse", ["Mateus 6:34"]],
      ["application", ["Ação de hoje"]],
      ["prayer", ["Oração completa"]],
    ],
  );
});
test("treino editorial em texto mantém exercícios, orientações e metadata", () => {
  const content = publicationContent({
    type: "training",
    summary: "",
    body: "Aquecimento",
    details: {
      objective: "Mobilidade",
      duration_minutes: "12",
      level: "Iniciante",
      equipment: "Sem equipamentos",
      exercises: "Agachamento: 3 séries\nPrancha: 30 segundos",
      instructions: "Interrompa se sentir dor",
      professional: "Profissional responsável",
    },
  });
  assert.deepEqual(
    content.metadata.map((meta) => meta.value),
    ["12 min", "Iniciante", "Sem equipamentos"],
  );
  assert.equal(
    content.sections.find((section) => section.key === "exercises")
      ?.paragraphs[0],
    "Agachamento: 3 séries\nPrancha: 30 segundos",
  );
  assert.ok(content.sections.some((section) => section.key === "objective"));
  assert.ok(content.sections.some((section) => section.key === "instructions"));
});
test("treino legado em arrays mostra todos campos, sem object Object", () => {
  const content = publicationContent({
    type: "training",
    summary: "",
    body: "",
    details: {
      exercises: [
        "Alongamento",
        {
          name: "Agachamento",
          sets: 3,
          reps: 12,
          rest_seconds: 30,
          description: "Sem peso",
          notes: "Movimento controlado",
        },
      ],
    },
  });
  const text = content.sections[0].paragraphs.join("\n");
  for (const expected of [
    "Alongamento",
    "Agachamento",
    "Séries: 3",
    "Repetições: 12",
    "30",
    "Sem peso",
    "Movimento controlado",
  ])
    assert.ok(text.includes(expected));
  assert.ok(!text.includes("[object Object]"));
});
test("campos adicionais e zeros sobrevivem, vazios não criam seções", () => {
  const content = publicationContent({
    type: "post",
    summary: "",
    body: "",
    details: {
      author: "",
      prayer: null,
      extra: { duration: 0, notes: "Detalhe adicional" },
      materials: ["PDF", "Áudio"],
    },
  });
  assert.deepEqual(
    content.sections.map((section) => section.key),
    ["extra", "materials"],
  );
  assert.ok(content.sections[0].paragraphs[0].includes("Duração: 0"));
  assert.equal(readableValue([null, undefined, ""]), "");
});
