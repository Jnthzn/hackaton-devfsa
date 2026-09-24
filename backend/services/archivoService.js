// Análisis de archivos e imágenes con reglas heurísticas (sin IA de terceros ni
// servicios externos). Mira el nombre, el contenido real (firmas de archivo),
// los metadatos y las marcas de generadores de IA. El archivo se analiza en
// memoria y NO se guarda.

const UMBRAL_AMARILLO = 31;
const UMBRAL_ROJO = 66;

// ---- Listas y pesos (se pueden ajustar sin tocar la lógica) ----
const EXT_EJECUTABLES = new Set([
  "exe", "scr", "bat", "cmd", "com", "pif", "msi", "vbs", "vbe", "js", "jse",
  "wsf", "wsh", "ps1", "jar", "apk", "lnk", "hta", "cpl", "reg", "dll", "sh", "iso",
]);
const EXT_MACROS = new Set(["docm", "xlsm", "pptm", "dotm", "xlam"]);
const EXT_WEB = new Set(["html", "htm", "xhtml", "svg"]);
const EXT_COMPRIMIDOS = new Set(["zip", "rar", "7z"]);
const EXT_COMUNES = new Set([
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf",
  "jpg", "jpeg", "png", "gif", "mp3", "mp4", "zip",
]);

// Formato real que se espera según la extensión
const TIPO_POR_EXT = {
  jpg: "jpeg", jpeg: "jpeg", png: "png", gif: "gif", webp: "webp", pdf: "pdf",
  zip: "zip", docx: "zip", xlsx: "zip", pptx: "zip", docm: "zip", xlsm: "zip",
  pptm: "zip", odt: "zip", ods: "zip",
  doc: ["ole", "rtf", "zip"], xls: ["ole", "zip"], ppt: ["ole", "zip"],
  rar: "rar", "7z": "7z", rtf: "rtf",
};
const TIPOS_IMAGEN = ["png", "jpeg", "gif", "webp"];

const GENERADORES_IA = [
  ["stable diffusion", "Stable Diffusion"],
  ["stablediffusion", "Stable Diffusion"],
  ["midjourney", "Midjourney"],
  ["dall-e", "DALL·E"],
  ["openai", "OpenAI"],
  ["chatgpt", "ChatGPT"],
  ["firefly", "Adobe Firefly"],
  ["comfyui", "ComfyUI"],
  ["novelai", "NovelAI"],
  ["invokeai", "InvokeAI"],
  ["leonardo.ai", "Leonardo.Ai"],
  ["dreamstudio", "DreamStudio"],
  ["trainedalgorithmicmedia", "la etiqueta oficial de contenido generado por IA"],
];

const EDITORES = [
  ["photoshop", "Adobe Photoshop"],
  ["lightroom", "Adobe Lightroom"],
  ["gimp", "GIMP"],
  ["canva", "Canva"],
  ["snapseed", "Snapseed"],
  ["picsart", "PicsArt"],
  ["facetune", "Facetune"],
  ["faceapp", "FaceApp"],
  ["pixlr", "Pixlr"],
  ["paint.net", "Paint.NET"],
  ["fotor", "Fotor"],
  ["affinity photo", "Affinity Photo"],
];

const PESO = {
  ejecutable: 60,
  dobleExtension: 45,
  bidi: 60,
  espacios: 25,
  seHacePasarPorOtro: 80,
  formatoNoCoincide: 35,
  extensionImagenDistinta: 10,
  macros: 35,
  macrosEscondidas: 45,
  web: 30,
  comprimido: 10,
  ejecutableAdentro: 40,
  cifrado: 20,
  pdfJs: 35,
  pdfLaunch: 40,
  pdfAdjunto: 10,
  pdfAccionAuto: 10,
  iaExplicita: 85,
  editada: 35,
  sinCamaraJpeg: 20,
  pngSinDatos: 10,
  medidasIa: 25,
  codigoEnImagen: 60,
};

// ---- Utilidades ----
function limpiarNombre(nombre) {
  return String(nombre || "archivo")
    .replace(/[\u0000-\u001f]/g, "")
    .slice(0, 200);
}

function extension(nombre) {
  const base = nombre.split(/[\\/]/).pop().trim();
  const i = base.lastIndexOf(".");
  return i > 0 ? base.slice(i + 1).trim().toLowerCase() : "";
}

// Detecta el formato real mirando los primeros bytes (no el nombre)
function tipoReal(b) {
  const empieza = (...bytes) => bytes.every((v, i) => b[i] === v);
  const texto = (desde, hasta) => b.toString("latin1", desde, hasta);

  if (empieza(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "png";
  if (empieza(0xff, 0xd8, 0xff)) return "jpeg";
  if (texto(0, 6) === "GIF87a" || texto(0, 6) === "GIF89a") return "gif";
  if (texto(0, 4) === "RIFF" && texto(8, 12) === "WEBP") return "webp";
  if (texto(0, 4) === "%PDF") return "pdf";
  if (empieza(0x50, 0x4b, 0x03, 0x04) || empieza(0x50, 0x4b, 0x05, 0x06)) return "zip";
  if (empieza(0x4d, 0x5a) || empieza(0x7f, 0x45, 0x4c, 0x46)) return "ejecutable";
  if (empieza(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1)) return "ole";
  if (empieza(0x4c, 0x00, 0x00, 0x00, 0x01, 0x14, 0x02, 0x00)) return "acceso-directo";
  if (texto(0, 4) === "Rar!") return "rar";
  if (empieza(0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c)) return "7z";
  if (texto(0, 5) === "{\\rtf") return "rtf";
  return null;
}

// Lista los nombres que hay dentro de un .zip leyendo su directorio central
function listarZip(buf) {
  const nombres = [];
  let cifrado = false;
  try {
    const minimo = Math.max(0, buf.length - 65557);
    let eocd = -1;
    for (let i = buf.length - 22; i >= minimo; i--) {
      if (buf.readUInt32LE(i) === 0x06054b50) {
        eocd = i;
        break;
      }
    }
    if (eocd < 0) return { nombres, cifrado };

    const total = Math.min(buf.readUInt16LE(eocd + 10), 500);
    let o = buf.readUInt32LE(eocd + 16);
    for (let n = 0; n < total; n++) {
      if (o + 46 > buf.length || buf.readUInt32LE(o) !== 0x02014b50) break;
      if (buf.readUInt16LE(o + 8) & 1) cifrado = true;
      const largoNombre = buf.readUInt16LE(o + 28);
      const largoExtra = buf.readUInt16LE(o + 30);
      const largoComentario = buf.readUInt16LE(o + 32);
      nombres.push(buf.toString("utf8", o + 46, o + 46 + largoNombre));
      o += 46 + largoNombre + largoExtra + largoComentario;
    }
  } catch {
    // zip dañado: devolvemos lo que se pudo leer
  }
  return { nombres, cifrado };
}

// ---- Lectura de imágenes (medidas y metadatos EXIF) ----
function leerTiff(buf, ini, fin) {
  fin = Math.min(fin, buf.length);
  if (fin - ini < 8) return null;
  const orden = buf.toString("latin1", ini, ini + 2);
  const le = orden === "II";
  if (!le && orden !== "MM") return null;
  const u16 = (p) => (le ? buf.readUInt16LE(p) : buf.readUInt16BE(p));
  const u32 = (p) => (le ? buf.readUInt32LE(p) : buf.readUInt32BE(p));

  const ifd = ini + u32(ini + 4);
  if (ifd + 2 > fin) return null;
  const cantidad = Math.min(u16(ifd), 100);
  const datos = {};

  for (let i = 0; i < cantidad; i++) {
    const e = ifd + 2 + i * 12;
    if (e + 12 > fin) break;
    const tag = u16(e);
    const tipo = u16(e + 2);
    const cuenta = u32(e + 4);
    if (tipo !== 2 || cuenta > 200) continue; // solo textos
    const pos = cuenta <= 4 ? e + 8 : ini + u32(e + 8);
    if (pos + cuenta > fin) continue;
    const valor = buf
      .toString("latin1", pos, pos + cuenta)
      .replace(/\0[\s\S]*$/, "")
      .trim();
    if (tag === 0x010f) datos.make = valor;
    if (tag === 0x0110) datos.model = valor;
    if (tag === 0x0131) datos.software = valor;
  }
  return datos;
}

function leerPng(buf, r) {
  r.ancho = buf.readUInt32BE(16);
  r.alto = buf.readUInt32BE(20);
  let o = 8;
  while (o + 12 <= buf.length) {
    const largo = buf.readUInt32BE(o);
    const tipo = buf.toString("ascii", o + 4, o + 8);
    if (tipo === "eXIf") {
      r.exif = leerTiff(buf, o + 8, o + 8 + largo);
      r.tieneMetadatos = true;
    }
    if (["tEXt", "iTXt", "zTXt", "caBX"].includes(tipo)) r.tieneMetadatos = true;
    if (tipo === "IEND") break;
    o += 12 + largo;
  }
}

function leerJpeg(buf, r) {
  let o = 2;
  while (o + 4 <= buf.length) {
    if (buf[o] !== 0xff) break;
    const marcador = buf[o + 1];
    if (marcador === 0xd9 || marcador === 0xda) break;
    if (marcador === 0xff) {
      o += 1;
      continue;
    }
    if (marcador === 0x01 || (marcador >= 0xd0 && marcador <= 0xd8)) {
      o += 2;
      continue;
    }
    const largo = buf.readUInt16BE(o + 2);
    if (largo < 2) break;

    if (marcador === 0xe1) {
      const cabecera = buf.toString("latin1", o + 4, o + 32);
      if (cabecera.startsWith("Exif\0\0")) {
        r.exif = leerTiff(buf, o + 10, o + 2 + largo);
        r.tieneMetadatos = true;
      } else if (cabecera.startsWith("http://ns.adobe.com/xap")) {
        r.tieneMetadatos = true;
      }
    }
    if (marcador === 0xed) r.tieneMetadatos = true;
    if (marcador >= 0xc0 && marcador <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marcador)) {
      r.alto = buf.readUInt16BE(o + 5);
      r.ancho = buf.readUInt16BE(o + 7);
    }
    o += 2 + largo;
  }
}

function leerWebp(buf, r) {
  const t = buf.toString("latin1", 12, 16);
  if (t === "VP8X") {
    r.ancho = 1 + buf.readUIntLE(24, 3);
    r.alto = 1 + buf.readUIntLE(27, 3);
  } else if (t === "VP8 ") {
    r.ancho = buf.readUInt16LE(26) & 0x3fff;
    r.alto = buf.readUInt16LE(28) & 0x3fff;
  } else if (t === "VP8L") {
    const b = buf.readUInt32LE(21);
    r.ancho = (b & 0x3fff) + 1;
    r.alto = ((b >> 14) & 0x3fff) + 1;
  }
  let o = 12;
  while (o + 8 <= buf.length) {
    const id = buf.toString("latin1", o, o + 4);
    const largo = buf.readUInt32LE(o + 4);
    if (id === "EXIF") {
      let ini = o + 8;
      if (buf.toString("latin1", ini, ini + 6) === "Exif\0\0") ini += 6;
      r.exif = leerTiff(buf, ini, o + 8 + largo);
      r.tieneMetadatos = true;
    }
    if (id === "XMP ") r.tieneMetadatos = true;
    o += 8 + largo + (largo % 2);
  }
}

function leerImagen(buf, tipo) {
  const r = { ancho: null, alto: null, exif: null, tieneMetadatos: false };
  try {
    if (tipo === "png") leerPng(buf, r);
    else if (tipo === "jpeg") leerJpeg(buf, r);
    else if (tipo === "gif") {
      r.ancho = buf.readUInt16LE(6);
      r.alto = buf.readUInt16LE(8);
    } else if (tipo === "webp") leerWebp(buf, r);
  } catch {
    // imagen dañada: seguimos con lo que se pudo leer
  }
  return r;
}

// ---- Textos de respuesta ----
function textosImagen(nivel, iaExplicita) {
  if (nivel === "verde") {
    return {
      veredicto: "No detectamos señales de manipulación",
      recomendacion:
        "No encontramos señales de edición ni de IA, pero ningún análisis automático es infalible. Si la imagen es importante, verificá quién la compartió primero.",
      consejos: [],
    };
  }
  const consejos = [
    "Subila a Google Imágenes o Google Lens para ver si aparece en otro contexto.",
    "Mirá los detalles: manos, dedos, textos y bordes deformados, o luces y sombras que no coinciden.",
    "Si es una noticia o una promoción, buscá la fuente oficial antes de creerla.",
  ];
  if (nivel === "amarillo") {
    return {
      veredicto: "Podría estar editada o generada",
      recomendacion:
        "Desconfiá: buscá la imagen original y fijate quién la compartió primero antes de reenviarla.",
      consejos,
    };
  }
  return {
    veredicto: iaExplicita
      ? "Creada con inteligencia artificial"
      : "Señales fuertes de que es falsa o peligrosa",
    recomendacion: iaExplicita
      ? "No es una foto real. Si te la mandaron como si fuera un hecho verdadero (una noticia, un producto, una promoción), desconfiá y buscá la fuente oficial."
      : "No la reenvíes ni confíes en ella: tiene señales fuertes de ser falsa, manipulada o de traer algo escondido.",
    consejos,
  };
}

function textosArchivo(nivel) {
  if (nivel === "verde") {
    return {
      veredicto: "No detectamos señales de riesgo",
      recomendacion:
        "No vemos señales de riesgo, pero abrilo solo si lo esperabas y confiás en quien te lo mandó. Esto no reemplaza a un antivirus.",
      consejos: [],
    };
  }
  const consejos = [
    "Los estafadores mandan archivos con nombres de facturas, comprobantes o multas para que los abras sin pensar.",
    "Activá que Windows muestre las extensiones de los archivos: así ves cómo termina realmente el nombre.",
    "Ante la duda, subilo a VirusTotal.com para revisarlo con decenas de antivirus.",
  ];
  if (nivel === "amarillo") {
    return {
      veredicto: "El archivo merece desconfianza",
      recomendacion:
        "No lo abras todavía: confirmá con quien te lo envió, por otro medio (una llamada, por ejemplo), que realmente lo mandó.",
      consejos,
    };
  }
  return {
    veredicto: "Archivo peligroso",
    recomendacion:
      "No lo abras. Eliminalo y avisá a quien te lo mandó. Si ya lo abriste, desconectate de internet y pasá un antivirus.",
    consejos,
  };
}

// ---- Análisis principal ----
export function analizarArchivo(buf, nombreOriginal = "") {
  const nombre = limpiarNombre(nombreOriginal);
  const ext = extension(nombre);
  const real = tipoReal(buf);
  const esImagen = TIPOS_IMAGEN.includes(real);

  const motivos = [];
  const sumar = (categoria, detalle, puntos) =>
    motivos.push({ categoria, detalle, puntos });

  // 1) El nombre
  if (/[\u202a-\u202e\u2066-\u2069]/.test(String(nombreOriginal))) {
    sumar(
      "nombre",
      "El nombre tiene un carácter invisible que da vuelta el final para disfrazar la extensión real",
      PESO.bidi,
    );
  }
  const doble = nombre.toLowerCase().match(/\.([a-z0-9]{2,5})\s*\.([a-z0-9]{2,5})$/);
  if (doble && EXT_COMUNES.has(doble[1]) && EXT_EJECUTABLES.has(doble[2])) {
    sumar(
      "nombre",
      `Tiene doble extensión: parece un .${doble[1]} pero en realidad termina en .${doble[2]}, que es un programa`,
      PESO.dobleExtension,
    );
  }
  if (/\s{4,}\.[a-z0-9]{2,5}$/i.test(nombre)) {
    sumar(
      "nombre",
      "Tiene muchos espacios antes de la extensión para esconder cómo termina realmente el nombre",
      PESO.espacios,
    );
  }

  // 2) La extensión y el contenido real
  if (EXT_EJECUTABLES.has(ext)) {
    sumar(
      "ejecutable",
      `Es un programa o script (.${ext}): al abrirlo puede instalar virus o robar datos`,
      PESO.ejecutable,
    );
  } else if (real === "ejecutable" || real === "acceso-directo") {
    sumar(
      "contenido",
      ext
        ? `Dice ser un .${ext} pero por dentro es un programa ejecutable`
        : "Por dentro es un programa ejecutable",
      PESO.seHacePasarPorOtro,
    );
  } else {
    const esperado = TIPO_POR_EXT[ext];
    if (esperado) {
      const coincide = Array.isArray(esperado) ? esperado.includes(real) : esperado === real;
      if (!coincide) {
        if (esImagen && TIPOS_IMAGEN.includes(esperado)) {
          sumar(
            "contenido",
            `La extensión (.${ext}) no coincide con el formato real de la imagen (${real})`,
            PESO.extensionImagenDistinta,
          );
        } else {
          sumar(
            "contenido",
            real
              ? `Dice ser un .${ext} pero en realidad es otro tipo de archivo (${real})`
              : `Dice ser un .${ext} pero su contenido no tiene ese formato`,
            PESO.formatoNoCoincide,
          );
        }
      }
    }
  }

  if (EXT_MACROS.has(ext)) {
    sumar(
      "macros",
      `Es un documento con macros (.${ext}): las macros son pequeños programas que pueden infectar la computadora`,
      PESO.macros,
    );
  }
  if (EXT_WEB.has(ext)) {
    sumar(
      "contenido",
      `Los archivos .${ext} adjuntos se usan para armar páginas falsas que piden usuario y clave`,
      PESO.web,
    );
  }
  if (EXT_COMPRIMIDOS.has(ext)) {
    sumar(
      "contenido",
      "Los archivos comprimidos suelen usarse para esconder programas peligrosos",
      PESO.comprimido,
    );
  }

  // 3) Dentro de un .zip (también .docx, .xlsx, .apk...)
  if (real === "zip") {
    const { nombres, cifrado } = listarZip(buf);
    const programas = nombres.filter((n) => EXT_EJECUTABLES.has(extension(n)));
    if (programas.length > 0) {
      sumar(
        "ejecutable",
        `Adentro trae programas o scripts: ${programas.slice(0, 3).join(", ")}`,
        PESO.ejecutableAdentro,
      );
    }
    if (!EXT_MACROS.has(ext) && nombres.some((n) => /vbaproject\.bin$/i.test(n))) {
      sumar(
        "macros",
        "Parece un documento común pero trae macros escondidas",
        PESO.macrosEscondidas,
      );
    }
    if (cifrado) {
      sumar(
        "contenido",
        "Está protegido con contraseña: se usa para que el antivirus no pueda revisar lo que trae",
        PESO.cifrado,
      );
    }
  }

  // 4) PDF
  if (real === "pdf") {
    const t = buf.toString("latin1", 0, Math.min(buf.length, 5_000_000));
    if (/\/(JavaScript|JS)\b/.test(t)) {
      sumar("contenido", "El PDF trae código JavaScript adentro: los PDF comunes casi nunca lo necesitan", PESO.pdfJs);
    }
    if (/\/Launch\b/.test(t)) {
      sumar("contenido", "El PDF intenta abrir programas de la computadora", PESO.pdfLaunch);
    }
    if (/\/EmbeddedFile\b/.test(t)) {
      sumar("contenido", "El PDF trae otros archivos escondidos adentro", PESO.pdfAdjunto);
    }
    if (/\/(OpenAction|AA)\b/.test(t)) {
      sumar("contenido", "El PDF ejecuta acciones automáticas al abrirse", PESO.pdfAccionAuto);
    }
  }

  // 5) Imágenes: señales de IA, edición y datos de origen
  let iaExplicita = false;
  if (esImagen) {
    const info = leerImagen(buf, real);
    const inicio = buf.toString("latin1", 0, Math.min(buf.length, 512_000)).toLowerCase();

    const generador = GENERADORES_IA.find(([clave]) => inicio.includes(clave));
    if (generador) {
      iaExplicita = true;
      sumar("ia", `La imagen trae una marca de que fue creada con inteligencia artificial: ${generador[1]}`, PESO.iaExplicita);
    } else if (inicio.includes("steps:") && inicio.includes("sampler:")) {
      iaExplicita = true;
      sumar("ia", "La imagen guarda los parámetros de un generador de IA (Steps, Sampler)", PESO.iaExplicita);
    }

    const editor = EDITORES.find(([clave]) => inicio.includes(clave));
    if (editor) {
      sumar("edicion", `Fue retocada con ${editor[1]}: la imagen pudo haber sido modificada`, PESO.editada);
    }

    const camara = [info.exif?.make, info.exif?.model].filter(Boolean).join(" ");
    if (!iaExplicita) {
      if (real === "jpeg" && !camara) {
        sumar(
          "metadatos",
          "No trae datos de cámara (modelo, fecha). Es normal si llegó por WhatsApp o redes, pero también pasa con imágenes generadas o modificadas",
          PESO.sinCamaraJpeg,
        );
      } else if (real === "png" && !camara && !info.tieneMetadatos) {
        sumar("metadatos", "No trae ningún dato de origen (cámara, programa o fecha)", PESO.pngSinDatos);
      }
      const { ancho, alto } = info;
      if (!camara && ancho && alto && ancho >= 512 && alto >= 512 && ancho % 64 === 0 && alto % 64 === 0) {
        sumar(
          "medidas",
          `Mide ${ancho}×${alto} píxeles: son medidas típicas de imágenes generadas con IA (las fotos reales casi nunca son múltiplos de 64)`,
          PESO.medidasIa,
        );
      }
    }

    const completo = buf.toString("latin1").toLowerCase();
    if (completo.includes("<script") || completo.includes("<?php")) {
      sumar("contenido", "Trae código escondido dentro de la imagen", PESO.codigoEnImagen);
    }
  }

  const puntaje = Math.min(100, motivos.reduce((suma, m) => suma + m.puntos, 0));
  const nivel = puntaje >= UMBRAL_ROJO ? "rojo" : puntaje >= UMBRAL_AMARILLO ? "amarillo" : "verde";
  const textos = esImagen ? textosImagen(nivel, iaExplicita) : textosArchivo(nivel);

  return {
    tipo: esImagen ? "imagen" : "archivo",
    nombre,
    tamano: buf.length,
    puntaje,
    nivel,
    veredicto: textos.veredicto,
    motivos: motivos.map(({ categoria, detalle }) => ({ categoria, detalle })),
    recomendacion: textos.recomendacion,
    consejos: textos.consejos,
  };
}