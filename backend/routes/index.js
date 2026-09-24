import express from "express";
import mongoose from "mongoose";
import {
  analizarContenido,
  listarReportes,
  verEstadisticas,
} from "../controllers/analisisController.js";
import limitador from "../middlewares/limitador.js";

const router = express.Router();

router.get("/health", (req, res) =>
  res.json({ ok: true, db: mongoose.connection.readyState === 1 }),
);
router.post("/analisis", limitador, analizarContenido);
router.get("/reportes", listarReportes);
router.get("/estadisticas", verEstadisticas);

export default router;
