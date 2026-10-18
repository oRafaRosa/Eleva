import assert from "node:assert/strict";
import test from "node:test";
import {
  availableCompletions,
  continuablePublications,
  filterPublications,
  splitUpcomingEvents,
} from "../src/utils/memberExperience";
import type { ElevaEvent, Publication } from "../src/types/domain";

function publication(
  id: string,
  changes: Partial<Publication> = {},
): Publication {
  return {
    id,
    title: `Conteúdo ${id}`,
    summary: "Resumo",
    body: "Texto",
    type: "lesson",
    pillar: "mind",
    status: "published",
    cover_path: null,
    media_url: null,
    details: {},
    reference_date: null,
    scheduled_at: null,
    published_at: null,
    created_by: null,
    created_at: "2026-10-01T12:00:00Z",
    updated_at: "2026-10-01T12:00:00Z",
    ...changes,
  };
}

function event(
  id: string,
  starts_at: string,
  status: ElevaEvent["status"] = "published",
): ElevaEvent {
  return {
    id,
    title: id,
    description: "Encontro",
    location: "Online",
    starts_at,
    ends_at: starts_at,
    capacity: 20,
    status,
  };
}

test("retomada mostra só salvos disponíveis e não concluídos, até dois", () => {
  const items = [
    publication("a"),
    publication("b"),
    publication("c"),
    publication("d"),
  ];
  assert.deepEqual(
    continuablePublications(items, ["a", "b", "c", "sumiu"], ["b"]).map(
      (item) => item.id,
    ),
    ["a", "c"],
  );
  assert.deepEqual(
    continuablePublications(items, ["a", "c"], [], 1).map((item) => item.id),
    ["a"],
  );
  assert.deepEqual(
    availableCompletions(items, ["b", "sumiu"]).map((item) => item.id),
    ["b"],
  );
});

test("busca combina texto sem acentos, pilar e formato", () => {
  const items = [
    publication("a", {
      title: "Meditação breve",
      pillar: "spirit",
      type: "devotional",
    }),
    publication("b", {
      title: "Meditacao guiada",
      pillar: "mind",
      type: "lesson",
    }),
    publication("c", {
      title: "Meditação em vídeo",
      pillar: "spirit",
      type: "lesson",
    }),
  ];
  assert.deepEqual(
    filterPublications(items, "meditacao", "spirit", "lesson").map(
      (item) => item.id,
    ),
    ["c"],
  );
  assert.deepEqual(filterPublications(items, "não existe", "all", "all"), []);
});

test("agenda separa futuros confirmados sem repetir nem mostrar eventos vencidos", () => {
  const now = new Date("2026-10-17T12:00:00Z");
  const events = [
    event("later", "2026-10-19T12:00:00Z"),
    event("past", "2026-10-16T12:00:00Z"),
    event("now", "2026-10-17T12:00:00Z"),
    event("soon", "2026-10-18T12:00:00Z"),
    event("draft", "2026-10-20T12:00:00Z", "draft"),
    event("other", "2026-10-21T12:00:00Z"),
  ];
  const result = splitUpcomingEvents(
    events,
    ["later", "soon", "past", "draft", "missing"],
    now,
  );
  assert.deepEqual(
    result.registered.map((item) => item.id),
    ["soon", "later"],
  );
  assert.deepEqual(
    result.others.map((item) => item.id),
    ["other"],
  );
});
