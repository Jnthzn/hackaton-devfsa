import express from "express";
import mongoose from "mongoose";
import {
  analizarContenido,
  listarReportes,
} from "../controllers/analisisController.js";

const router = express.Router();

router.get("/health", (req, res) =>
  res.json({ ok: true, db: mongoose.connection.readyState === 1 }),
);
router.post("/analisis", analizarContenido);
router.get("/reportes", listarReportes);

export default router;
