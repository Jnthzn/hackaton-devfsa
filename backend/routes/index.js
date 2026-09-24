import express from "express";
import mongoose from "mongoose";
import {
  analizarContenido,
  listarReportes,
  verEstadisticas,
} from "../controllers/analisisController.js";
import { analizarArchivoSubido } from "../controllers/archivoController.js";
import limitador from "../middlewares/limitador.js";

const router = express.Router();

const LIMITE_ARCHIVO = "10mb";

// Recibe el archivo tal cual (binario), sin librerías extra
const recibirArchivo = (req, res, next) =>
  express.raw({ type: "*/*", limit: LIMITE_ARCHIVO })(req, res, (err) => {
    if (err?.type === "entity.too.large") {
      return res
        .status(400)
        .json({ error: "El archivo es demasiado grande (máximo 10 MB)" });
    }
    next(err);
  });

router.get("/health", (req, res) =>
  res.json({ ok: true, db: mongoose.connection.readyState === 1 }),
);
router.post("/analisis", limitador, analizarContenido);
router.post("/archivo", limitador, recibirArchivo, analizarArchivoSubido);
router.get("/reportes", listarReportes);
router.get("/estadisticas", verEstadisticas);

export default router;