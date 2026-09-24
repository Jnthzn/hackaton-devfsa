import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";

const app = express();
const frontend = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "frontend",
);

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "10kb" }));

app.use("/api", routes);

// El frontend se sirve desde el mismo dominio: un solo deploy y sin CORS.
app.use(express.static(frontend));

app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo enviado no es JSON válido" });
  }
  if (err.type === "entity.too.large") {
    return res.status(400).json({ error: "El contenido es demasiado largo" });
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`Servidor corriendo en http://localhost:${PORT}`),
  );
});
