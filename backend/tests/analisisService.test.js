// Casos de calibración: se corren con `npm test` (usa el test runner de Node).
// Si tocás pesos o listas en analisisService.js, estos casos avisan si algo se rompe.
import test from "node:test";
import assert from "node:assert/strict";
import { analizar, anonimizar } from "../services/analisisService.js";

// Mensajes legítimos: no deberían asustar al usuario
const CASOS_VERDES = [
  "Hola, mañana nos vemos a las 5",
  "Te dejo el link de la receta: https://www.instagram.com/p/abc123",
  "Buen día, ¿confirmamos la reunión del jueves?",
  "Mirá esta nota https://www.lanacion.com.ar/economia/nota-123",
  "Te transfiero la plata del asado, pasame el alias cuando puedas",
];

// Estafas reales que circulan en Argentina
const CASOS_ROJOS = [
  "URGENTE: su cuenta será bloqueada. Ingrese su clave y token en http://bit.ly/abc123",
  "Felicitaciones ganador! Reclamá tu premio en www.mercad0libre-premios.top",
  "Hola mama, cambie de numero. Necesito que me hagas una transferencia urgente a este alias",
  "Somos del departamento de fraude del banco. Para proteger su cuenta pasame el codigo que te llega por SMS",
  "Su paquete de Correo Argentino está retenido. Abone la tasa aduanera en http://correoargentino-pagos.click/verificar",
  "Trabajo remoto sin experiencia, ingresos extra garantizados. Solo tenés que hacer un deposito previo en usdt",
];

// Sospechosos pero no concluyentes
const CASOS_AMARILLOS = [
  "http://banc0-santander.xyz/login",
  "Hola mama, se me rompio el celular, este es mi nuevo numero",
];

test("mensajes legítimos quedan en verde", () => {
  for (const caso of CASOS_VERDES) {
    const r = analizar(caso);
    assert.equal(r.nivel, "verde", `${caso} -> ${r.puntaje}`);
  }
});

test("estafas conocidas quedan en rojo", () => {
  for (const caso of CASOS_ROJOS) {
    const r = analizar(caso);
    assert.equal(r.nivel, "rojo", `${caso} -> ${r.puntaje}`);
  }
});

test("casos dudosos quedan en amarillo", () => {
  for (const caso of CASOS_AMARILLOS) {
    const r = analizar(caso);
    assert.equal(r.nivel, "amarillo", `${caso} -> ${r.puntaje}`);
  }
});

test("el contrato de la respuesta no cambia", () => {
  const r = analizar("URGENTE: su cuenta será bloqueada, enviá tu clave");
  assert.deepEqual(Object.keys(r).sort(), [
    "consejos",
    "motivos",
    "nivel",
    "puntaje",
    "recomendacion",
    "tipo",
  ]);
  assert.ok(r.puntaje >= 0 && r.puntaje <= 100);
  assert.ok(["mensaje", "url"].includes(r.tipo));
  for (const m of r.motivos) {
    assert.equal(typeof m.categoria, "string");
    assert.equal(typeof m.detalle, "string");
  }
});

test("un link solo se clasifica como url", () => {
  assert.equal(analizar("https://www.mercadolibre.com.ar").tipo, "url");
  assert.equal(analizar("mirá esto https://mercadolibre.com.ar").tipo, "mensaje");
});

test("detecta dominios que imitan marcas y no marca a los oficiales", () => {
  assert.ok(analizar("https://mercado-pago.seguro-cuenta.com").puntaje >= 30);
  assert.equal(analizar("https://www.mercadopago.com.ar/home").nivel, "verde");
});

test("anonimiza datos personales antes de guardar", () => {
  const anon = anonimizar("Escribime a juan@mail.com o al 1122334455");
  assert.ok(!anon.includes("juan@mail.com"));
  assert.ok(!anon.includes("1122334455"));
  assert.ok(anon.includes("[email]") && anon.includes("[numero]"));
});
