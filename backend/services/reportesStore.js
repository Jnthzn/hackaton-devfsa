import mongoose from "mongoose";
import Reporte from "../models/reporte.js";

// Respaldo en memoria: si MongoDB no está disponible la demo sigue funcionando
// (se pierde al reiniciar el servidor, es solo una red de seguridad).
const MAX_EN_MEMORIA = 50;
const enMemoria = [];

const hayMongo = () => mongoose.connection.readyState === 1;

const guardar = async (reporte) => {
  if (hayMongo()) {
    await Reporte.create(reporte);
    return;
  }
  const ahora = new Date().toISOString();
  enMemoria.unshift({
    _id: `mem-${Date.now()}`,
    ...reporte,
    createdAt: ahora,
    updatedAt: ahora,
  });
  enMemoria.length = Math.min(enMemoria.length, MAX_EN_MEMORIA);
};

const listar = async (limit) => {
  if (hayMongo()) {
    return Reporte.find().sort({ createdAt: -1 }).limit(limit).select("-__v");
  }
  return enMemoria.slice(0, limit);
};

const resumir = (reportes) => {
  const porNivel = { verde: 0, amarillo: 0, rojo: 0 };
  const porCategoria = {};
  let sumaPuntajes = 0;

  for (const reporte of reportes) {
    porNivel[reporte.nivel] = (porNivel[reporte.nivel] || 0) + 1;
    sumaPuntajes += reporte.puntaje;
    for (const motivo of reporte.motivos || []) {
      porCategoria[motivo.categoria] = (porCategoria[motivo.categoria] || 0) + 1;
    }
  }

  const total = reportes.length;
  return {
    total,
    porNivel,
    puntajePromedio: total ? Math.round(sumaPuntajes / total) : 0,
    categoriasFrecuentes: Object.entries(porCategoria)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([categoria, cantidad]) => ({ categoria, cantidad })),
  };
};

const estadisticas = async () => {
  const reportes = hayMongo()
    ? await Reporte.find().select("nivel puntaje motivos").lean()
    : enMemoria;
  return resumir(reportes);
};

export { guardar, listar, estadisticas, resumir };
