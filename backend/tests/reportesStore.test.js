// Resumen que alimenta GET /api/estadisticas.
import test from "node:test";
import assert from "node:assert/strict";
import { resumir } from "../services/reportesStore.js";

test("resumir cuenta niveles, promedio y categorías más frecuentes", () => {
  const resumen = resumir([
    { nivel: "rojo", puntaje: 90, motivos: [{ categoria: "urgencia" }, { categoria: "datos" }] },
    { nivel: "rojo", puntaje: 70, motivos: [{ categoria: "urgencia" }] },
    { nivel: "verde", puntaje: 0, motivos: [] },
  ]);

  assert.equal(resumen.total, 3);
  assert.deepEqual(resumen.porNivel, { verde: 1, amarillo: 0, rojo: 2 });
  assert.equal(resumen.puntajePromedio, 53);
  assert.deepEqual(resumen.categoriasFrecuentes[0], {
    categoria: "urgencia",
    cantidad: 2,
  });
});

test("resumir tolera un historial vacío", () => {
  const resumen = resumir([]);

  assert.equal(resumen.total, 0);
  assert.equal(resumen.puntajePromedio, 0);
  assert.deepEqual(resumen.categoriasFrecuentes, []);
});
