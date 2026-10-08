import assert from "node:assert/strict";
import test from "node:test";
import { reportQuerySchema } from "./attendance.schema";

test("reportQuerySchema acepta filtros válidos y convierte ids", () => {
  const r = reportQuerySchema.parse({ from: "2025-01-01", to: "2025-01-31", disciplineId: "2" });
  assert.equal(r.disciplineId, 2);
});

test("reportQuerySchema rechaza rango invertido", () => {
  assert.equal(reportQuerySchema.safeParse({ from: "2025-02-01", to: "2025-01-01" }).success, false);
});

test("reportQuerySchema rechaza fechas con formato inválido", () => {
  assert.equal(reportQuerySchema.safeParse({ from: "01/01/2025" }).success, false);
});
