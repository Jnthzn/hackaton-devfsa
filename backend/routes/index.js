import express from "express";
import {
  analizarContenido,
  listarReportes,
} from "../controllers/analisisController.js";

const router = express.Router();

router.get("/health", (req, res) => res.json({ ok: true }));
router.post("/analisis", analizarContenido);
router.get("/reportes", listarReportes);

export default router;
