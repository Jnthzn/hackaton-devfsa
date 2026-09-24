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

export { guardar, listar };
