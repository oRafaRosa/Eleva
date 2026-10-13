import test from "node:test";
import assert from "node:assert/strict";
import { dailyDevotional, editorialDay } from "../src/utils/editorialDay";
import type { Publication } from "../src/types/domain";

test("início mostra apenas o devocional publicado do dia em São Paulo", () => {
  const date = new Date("2026-10-14T01:00:00Z");
  const publications = [
    {
      id: "ontem",
      type: "devotional",
      status: "published",
      reference_date: "2026-10-12",
    },
    {
      id: "rascunho",
      type: "devotional",
      status: "draft",
      reference_date: "2026-10-13",
    },
    {
      id: "hoje",
      type: "devotional",
      status: "published",
      reference_date: "2026-10-13",
    },
    {
      id: "amanha",
      type: "devotional",
      status: "published",
      reference_date: "2026-10-14",
    },
  ] as Publication[];
  assert.equal(editorialDay(date), "2026-10-13");
  assert.equal(dailyDevotional(publications, date)?.id, "hoje");
  assert.equal(
    dailyDevotional(
      publications.filter((item) => item.id !== "hoje"),
      date,
    ),
    undefined,
  );
});
