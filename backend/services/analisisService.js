// ----- Reglas de texto (se comparan sin tildes y en minúsculas) -----
const URGENCIA = [
  "cuenta suspendida",
  "cuenta bloqueada",
  "sera bloqueada",
  "sera suspendida",
  "urgente",
  "embargo",
  "bloqueo inmediato",
  "ganador",
  "premio",
  "ultimo aviso",
  "ultima oportunidad",
  "24 horas",
  "actua ahora",
];

const DATOS_SENSIBLES = [
  "cbu",
  "alias",
  "clave",
  "token",
  "transferencia",
  "verificacion de cuenta",
  "contrasena",
  "codigo de seguridad",
  "tarjeta",
  "dni",
  "pin",
];

// ----- Reglas de URLs -----
const ACORTADORES = [
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "cutt.ly",
  "is.gd",
  "rebrand.ly",
  "shorturl.at",
];
const TLDS_SOSPECHOSOS = [
  "xyz",
  "top",
  "click",
  "work",
  "site",
  "online",
  "icu",
  "tk",
  "ml",
  "ga",
  "cf",
  "gq",
  "buzz",
];
// Marcas frecuentes en estafas y sus dominios oficiales. Agregá las que quieras.
const MARCAS = {
  mercadolibre: ["mercadolibre.com", "mercadolibre.com.ar"],
  mercadopago: ["mercadopago.com", "mercadopago.com.ar"],
  afip: ["afip.gob.ar"],
  anses: ["anses.gob.ar"],
  santander: ["santander.com.ar"],
  correoargentino: ["correoargentino.com.ar"],
};

// ----- Pesos y límites (el total final se topa en 100) -----
const PESO = {
  urgencia: 10,
  dato: 15,
  acortador: 20,
  tld: 15,
  leet: 20,
  marca: 30,
  http: 10,
  ip: 20,
};
const TOPE = { urgencia: 30, dato: 45, url: 60 };
const BONUS_COMBINACION = 10; // urgencia + pedido de datos = patrón clásico de estafa

const CONSEJOS = {
  urgencia:
    "Los estafadores generan presión para que no pienses. Frená y verificá antes de actuar.",
  datos:
    "Ningún banco ni servicio serio te pedirá clave, token o CBU por mensaje.",
  url: "No toques enlaces sospechosos: escribí vos la dirección oficial en el navegador.",
};

const RECOMENDACION = {
  verde:
    "No detectamos señales claras de estafa, pero ante cualquier duda verificá por el canal oficial.",
  amarillo:
    "Hay señales sospechosas. No hagas clic ni compartas datos; confirmá por los canales oficiales.",
  rojo: "Alto riesgo de estafa. No respondas, no abras enlaces ni compartas datos. Bloqueá y reportá al remitente.",
};

// ----- Utilidades -----
const normalizar = (t) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const deLeet = (s) =>
  s
    .replace(/0/g, "o")
    .replace(/1/g, "l")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t");

const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buscarTerminos = (texto, lista) =>
  lista.filter((t) => new RegExp(`\\b${escapar(t)}(?:s|es)?\\b`).test(texto));

const TLDS_BUSCADOS = [
  ...TLDS_SOSPECHOSOS,
  "com",
  "net",
  "org",
  "info",
  "ar",
  "co",
  "io",
  "me",
  "ly",
  "gl",
  "gd",
  "at",
];
const URL_REGEX = new RegExp(
  `\\b(?:https?:\\/\\/|www\\.)[^\\s<>"']+|\\b[a-z0-9-]+(?:\\.[a-z0-9-]+)*\\.(?:${TLDS_BUSCADOS.join("|")})\\b(?:\\/[^\\s<>"']*)?`,
  "gi",
);

const extraerUrls = (texto) =>
  (texto.match(URL_REGEX) || []).map((u) => u.replace(/[.,;:!?)\]]+$/, ""));

// ----- Análisis de una URL -----
function analizarUrl(raw) {
  const hallazgos = []; // { detalle, puntos }
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return hallazgos;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const partes = host.split(".");
  const tld = partes[partes.length - 1];
  const etiqueta = partes[0];

  if (ACORTADORES.includes(host)) {
    hallazgos.push({
      detalle: `Usa un acortador de enlaces (${host}) que oculta el destino real`,
      puntos: PESO.acortador,
    });
  }
  if (TLDS_SOSPECHOSOS.includes(tld)) {
    hallazgos.push({
      detalle: `Dominio con terminación poco confiable (.${tld})`,
      puntos: PESO.tld,
    });
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    hallazgos.push({
      detalle: "El enlace usa una dirección IP en lugar de un dominio",
      puntos: PESO.ip,
    });
  }
  if (/[a-z][013457](?![0-9])/.test(etiqueta)) {
    hallazgos.push({
      detalle: `El dominio mezcla números y letras como para imitar otro nombre (${host})`,
      puntos: PESO.leet,
    });
  }

  const hostLeet = deLeet(host);
  for (const [marca, oficiales] of Object.entries(MARCAS)) {
    const esOficial = oficiales.some(
      (d) => host === d || host.endsWith(`.${d}`),
    );
    if (hostLeet.includes(marca) && !esOficial) {
      hallazgos.push({
        detalle: `El dominio parece imitar a "${marca}" pero no es el sitio oficial`,
        puntos: PESO.marca,
      });
      break;
    }
  }

  if (/^http:\/\//i.test(raw)) {
    hallazgos.push({
      detalle: "El enlace no usa conexión segura (http en lugar de https)",
      puntos: PESO.http,
    });
  }
  return hallazgos;
}

const nivelPorPuntaje = (p) =>
  p <= 30 ? "verde" : p <= 65 ? "amarillo" : "rojo";

// ----- Función principal -----
function analizar(contenido) {
  const texto = normalizar(contenido);
  const motivos = [];
  const categorias = new Set();

  // 1) Urgencia y amenaza
  const urg = buscarTerminos(texto, URGENCIA);
  const ptsUrgencia = Math.min(urg.length * PESO.urgencia, TOPE.urgencia);
  if (urg.length) {
    categorias.add("urgencia");
    motivos.push({
      categoria: "urgencia",
      detalle: `Lenguaje de urgencia o amenaza: ${urg.join(", ")}`,
    });
  }

  // 2) Datos sensibles
  const datos = buscarTerminos(texto, DATOS_SENSIBLES);
  const ptsDatos = Math.min(datos.length * PESO.dato, TOPE.dato);
  if (datos.length) {
    categorias.add("datos");
    motivos.push({
      categoria: "datos",
      detalle: `Menciona datos sensibles: ${datos.join(", ")}`,
    });
  }

  // 3) URLs
  const urls = extraerUrls(contenido);
  let ptsUrl = 0;
  for (const u of urls) {
    for (const h of analizarUrl(u)) {
      ptsUrl += h.puntos;
      categorias.add("url");
      motivos.push({ categoria: "url", detalle: h.detalle });
    }
  }
  ptsUrl = Math.min(ptsUrl, TOPE.url);

  // 4) Combinación clásica
  let bonus = 0;
  if (urg.length && datos.length) {
    bonus = BONUS_COMBINACION;
    motivos.push({
      categoria: "combinacion",
      detalle:
        "Combina presión de tiempo con pedido de datos: patrón típico de estafa",
    });
  }

  const puntaje = Math.min(100, ptsUrgencia + ptsDatos + ptsUrl + bonus);
  const nivel = nivelPorPuntaje(puntaje);
  const esSoloUrl =
    urls.length === 1 && contenido.trim().split(/\s+/).length === 1;

  return {
    tipo: esSoloUrl ? "url" : "mensaje",
    puntaje,
    nivel,
    motivos,
    recomendacion: RECOMENDACION[nivel],
    consejos: [...categorias]
      .filter((c) => CONSEJOS[c])
      .map((c) => CONSEJOS[c]),
  };
}

// Oculta emails y números largos (CBU, teléfonos, tarjetas) antes de guardar
const anonimizar = (t) =>
  t
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
    .replace(/\d{6,}/g, "[numero]")
    .slice(0, 500);

export { analizar, anonimizar };
