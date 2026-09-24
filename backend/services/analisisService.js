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
  "home banking",
  "validar identidad",
  "confirmar identidad",
  "actualizar tus datos",
  "actualizar sus datos",
  "foto del dni",
  "selfie con el dni",
];

// Suplantación de identidad: "hola mamá", falso soporte, falso agente oficial
const SUPLANTACION = [
  "hola mama",
  "hola papa",
  "soy tu hijo",
  "soy tu hija",
  "cambie de numero",
  "cambie el numero",
  "este es mi nuevo numero",
  "mi nuevo numero",
  "se me rompio el celular",
  "perdi el celular",
  "soporte tecnico",
  "servicio tecnico",
  "soy del banco",
  "personal del banco",
  "asesor del banco",
  "agente oficial",
  "atencion al cliente",
  "mesa de ayuda",
  "area de seguridad",
  "departamento de fraude",
];

// Medios de pago difíciles de recuperar o excusas para cobrar por adelantado
const PAGO_IRREVERSIBLE = [
  "western union",
  "gift card",
  "tarjeta de regalo",
  "criptomoneda",
  "bitcoin",
  "usdt",
  "tasa aduanera",
  "pago de aduana",
  "costo de envio",
  "abonar el envio",
  "reprogramar la entrega",
  "paquete retenido",
  "envio retenido",
  "deposito previo",
  "pago anticipado",
];

// Falsos trabajos e inversiones milagrosas
const OFERTA_INCREIBLE = [
  "trabajo remoto",
  "ingresos extra",
  "dinero facil",
  "ganancia garantizada",
  "inversion garantizada",
  "duplica tu dinero",
  "sin experiencia",
  "cupos limitados",
  "solo por hoy",
  "trabaja desde casa",
];

// Patrones que no dependen de una palabra suelta
const PEDIDO_DE_CODIGO =
  /\b(pasa(me|nos)?|envia(me|nos)?|manda(me|nos)?|deci(me|nos)?|comparti(me|nos)?|reenvia(me)?|confirma(me)?)\b[^.!?]{0,40}\bcodigo\b/;
const CODIGO_NUMERICO = /\bcodigo\b[^.!?]{0,20}\b\d{4,8}\b/;

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
  "shop",
  "store",
  "live",
  "fun",
  "cyou",
  "lol",
  "sbs",
  "quest",
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
  arca: ["arca.gob.ar"],
  miargentina: ["argentina.gob.ar"],
  santander: ["santander.com.ar"],
  galicia: ["galicia.ar", "bancogalicia.com"],
  bbva: ["bbva.com.ar", "bbva.com"],
  macro: ["macro.com.ar"],
  bna: ["bna.com.ar"],
  bancoprovincia: ["bancoprovincia.com.ar"],
  brubank: ["brubank.com"],
  uala: ["uala.com.ar"],
  naranjax: ["naranjax.com"],
  correoargentino: ["correoargentino.com.ar"],
  andreani: ["andreani.com"],
  oca: ["oca.com.ar"],
  whatsapp: ["whatsapp.com"],
  instagram: ["instagram.com"],
  netflix: ["netflix.com"],
};

// Rutas típicas de páginas falsas de login
const RUTAS_SOSPECHOSAS = [
  "login",
  "ingresar",
  "acceso",
  "verificar",
  "verificacion",
  "validar",
  "actualizar-datos",
  "seguridad",
  "premio",
  "sorteo",
];

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
  punycode: 25,
  guiones: 10,
  ruta: 10,
  credenciales: 20,
  suplantacion: 25,
  pago: 15,
  oferta: 10,
  codigo: 35, // pedir el código de verificación es de las señales más fuertes
  estilo: 5,
};
const TOPE = {
  urgencia: 30,
  dato: 45,
  url: 60,
  suplantacion: 50,
  pago: 30,
  oferta: 30,
  estilo: 10,
};

// Combinaciones que, juntas, arman el guion clásico de una estafa
const BONUS_COMBINACION = 10;
const TOPE_BONUS = 20;
const COMBINACIONES = [
  {
    partes: ["urgencia", "datos"],
    detalle:
      "Combina presión de tiempo con pedido de datos: patrón típico de estafa",
  },
  {
    partes: ["suplantacion", "datos"],
    detalle:
      "Dice ser alguien conocido u oficial y además pide datos privados",
  },
  {
    partes: ["suplantacion", "pago"],
    detalle:
      "Dice ser alguien conocido u oficial y pide un pago difícil de recuperar",
  },
  {
    partes: ["oferta", "pago"],
    detalle: "Promete una ganancia fácil pero primero te pide pagar",
  },
];

const CONSEJOS = {
  urgencia:
    "Los estafadores generan presión para que no pienses. Frená y verificá antes de actuar.",
  datos:
    "Ningún banco ni servicio serio te pedirá clave, token o CBU por mensaje.",
  url: "No toques enlaces sospechosos: escribí vos la dirección oficial en el navegador.",
  suplantacion:
    "Si alguien dice ser un familiar o el banco, cortá y llamá vos al número que ya tenías guardado.",
  pago: "Desconfiá de pagos por cripto, gift cards o transferencias urgentes: no se pueden recuperar.",
  oferta:
    "Si la ganancia parece demasiado buena para ser cierta, casi siempre es una estafa.",
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

  // Se quitan guiones y puntos para que "mercado-pago.seguro.com" también coincida
  const hostLeet = deLeet(host).replace(/[^a-z0-9]/g, "");
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

  if (host.includes("xn--")) {
    hallazgos.push({
      detalle:
        "El dominio usa caracteres especiales para parecerse a otro (ataque homógrafo)",
      puntos: PESO.punycode,
    });
  }
  if ((etiqueta.match(/-/g) || []).length >= 3) {
    hallazgos.push({
      detalle: `El dominio encadena muchas palabras con guiones (${host})`,
      puntos: PESO.guiones,
    });
  }
  if (url.username) {
    hallazgos.push({
      detalle: "El enlace esconde el destino real usando el símbolo @",
      puntos: PESO.credenciales,
    });
  }
  const ruta = url.pathname.toLowerCase();
  const rutaSospechosa = RUTAS_SOSPECHOSAS.find((r) => ruta.includes(r));
  if (rutaSospechosa) {
    hallazgos.push({
      detalle: `La dirección apunta a una página de "${rutaSospechosa}", típica de sitios falsos`,
      puntos: PESO.ruta,
    });
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
  let ptsDatos = Math.min(datos.length * PESO.dato, TOPE.dato);
  if (datos.length) {
    categorias.add("datos");
    motivos.push({
      categoria: "datos",
      detalle: `Menciona datos sensibles: ${datos.join(", ")}`,
    });
  }
  // Pedido del código de verificación: no siempre aparece una palabra de la lista
  if (PEDIDO_DE_CODIGO.test(texto) || CODIGO_NUMERICO.test(texto)) {
    ptsDatos = Math.min(ptsDatos + PESO.codigo, TOPE.dato);
    categorias.add("datos");
    motivos.push({
      categoria: "datos",
      detalle:
        "Pide que compartas un código de verificación: ese código es la llave de tu cuenta",
    });
  }

  // 3) Suplantación de identidad (familiar, banco, soporte)
  const supl = buscarTerminos(texto, SUPLANTACION);
  const ptsSuplantacion = Math.min(
    supl.length * PESO.suplantacion,
    TOPE.suplantacion,
  );
  if (supl.length) {
    categorias.add("suplantacion");
    motivos.push({
      categoria: "suplantacion",
      detalle: `Dice ser alguien de confianza o una entidad oficial: ${supl.join(", ")}`,
    });
  }

  // 4) Pagos difíciles de recuperar
  const pagos = buscarTerminos(texto, PAGO_IRREVERSIBLE);
  const ptsPago = Math.min(pagos.length * PESO.pago, TOPE.pago);
  if (pagos.length) {
    categorias.add("pago");
    motivos.push({
      categoria: "pago",
      detalle: `Pide un pago por una vía difícil de recuperar: ${pagos.join(", ")}`,
    });
  }

  // 5) Ofertas demasiado buenas
  const ofertas = buscarTerminos(texto, OFERTA_INCREIBLE);
  const ptsOferta = Math.min(ofertas.length * PESO.oferta, TOPE.oferta);
  if (ofertas.length) {
    categorias.add("oferta");
    motivos.push({
      categoria: "oferta",
      detalle: `Promete ganancias fáciles o poco realistas: ${ofertas.join(", ")}`,
    });
  }

  // 6) URLs
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

  // 7) Señales de estilo: gritos y signos repetidos para meter presión
  let ptsEstilo = 0;
  const letras = contenido.replace(/[^a-zA-ZÀ-ÿ]/g, "");
  const mayusculas = contenido.replace(/[^A-ZÁÉÍÓÚÑ]/g, "");
  if (letras.length >= 25 && mayusculas.length / letras.length > 0.6) {
    ptsEstilo += PESO.estilo;
    categorias.add("urgencia");
    motivos.push({
      categoria: "urgencia",
      detalle: "Está escrito casi todo en mayúsculas, como para meter presión",
    });
  }
  if (/[!?¡¿]{3,}/.test(contenido)) {
    ptsEstilo += PESO.estilo;
    categorias.add("urgencia");
    motivos.push({
      categoria: "urgencia",
      detalle: "Abusa de signos de exclamación o pregunta para llamar la atención",
    });
  }
  ptsEstilo = Math.min(ptsEstilo, TOPE.estilo);

  // 8) Combinaciones clásicas
  let bonus = 0;
  for (const combo of COMBINACIONES) {
    if (bonus >= TOPE_BONUS) break;
    if (combo.partes.every((p) => categorias.has(p))) {
      bonus += BONUS_COMBINACION;
      motivos.push({ categoria: "combinacion", detalle: combo.detalle });
    }
  }
  bonus = Math.min(bonus, TOPE_BONUS);

  const puntaje = Math.min(
    100,
    ptsUrgencia +
      ptsDatos +
      ptsSuplantacion +
      ptsPago +
      ptsOferta +
      ptsUrl +
      ptsEstilo +
      bonus,
  );
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
