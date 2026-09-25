import { analizar, anonimizar } from "../services/analisisService.js";
import { obtenerUrlReal } from "../utils/desenmascarar.js";
import { guardar, listar, estadisticas } from "../services/reportesStore.js";

// POST /api/analisis  body: { "contenido": "texto o link a analizar" }
const analizarContenido = async (req, res, next) => {
  try {
    const { contenido } = req.body;

    if (typeof contenido !== "string" || !contenido.trim()) {
      return res.status(400).json({
        error: 'Falta el campo "contenido" con el texto o link a analizar',
      });
    }
    if (contenido.length > 5000) {
      return res.status(400).json({
        error: "El contenido es demasiado largo (máximo 5000 caracteres)",
      });
    }

    // Detectar si hay un link http/https y desenmascararlo
    let urlReal = null;
    const matchUrl = contenido.match(/(https?:\/\/[^\s]+)/i);
    if (matchUrl) {
      urlReal = await obtenerUrlReal(matchUrl[0]);
    }

    const resultado = analizar(contenido);

    // Si la URL redirige a otro sitio, la sumamos al resultado
    if (urlReal && urlReal !== matchUrl[0]) {
      resultado.urlOriginal = matchUrl[0];
      resultado.urlReal = urlReal;
    }

    await guardar({
      tipo: resultado.tipo,
      contenido: anonimizar(contenido),
      puntaje: resultado.puntaje,
      nivel: resultado.nivel,
      motivos: resultado.motivos,
    });

    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

// GET /api/reportes?limit=10  -> historial comunitario (últimos análisis)
const listarReportes = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    res.json(await listar(limit));
  } catch (err) {
    next(err);
  }
};

// GET /api/estadisticas -> resumen para el panel de la demo
const verEstadisticas = async (req, res, next) => {
  try {
    res.json(await estadisticas());
  } catch (err) {
    next(err);
  }
};

export { analizarContenido, listarReportes, verEstadisticas };
