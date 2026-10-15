import test from "node:test";
import assert from "node:assert/strict";
import {
  displayDateInput,
  normalizeDateInput,
} from "../src/components/admin/dateInput";
import { validDate, scheduledInstant } from "../src/components/admin/editorial";
test("datas nativas convertem DD/MM/AAAA para ISO sem trocar o dia", () => {
  assert.equal(displayDateInput("2026-10-14", "date"), "14/10/2026");
  assert.equal(normalizeDateInput("14/10/2026", "date"), "2026-10-14");
  assert.equal(
    scheduledInstant(normalizeDateInput("14/10/2026", "date"), "07:00"),
    "2026-10-14T10:00:00.000Z",
  );
});
test("mês usa MM/AAAA e entrada incompleta continua editável", () => {
  assert.equal(displayDateInput("2026-10", "month"), "10/2026");
  assert.equal(normalizeDateInput("10/2026", "month"), "2026-10");
  assert.equal(normalizeDateInput("14/10/20", "date"), "14/10/20");
  assert.equal(normalizeDateInput("07:00", "time"), "07:00");
  assert.equal(validDate(normalizeDateInput("31/02/2026", "date")), false);
});
