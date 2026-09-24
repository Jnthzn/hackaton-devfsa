import "dotenv/config";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";

const app = express();
// El frontend es una app de Vite: se sirve la carpeta que genera `npm run build`.
const frontend = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "frontend",
  "dist",
);
const hayBuild = existsSync(path.join(frontend, "index.html"));

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "10kb" }));

app.use("/api", routes);

// El frontend se sirve desde el mismo dominio: un solo deploy y sin CORS.
if (hayBuild) {
  app.use(express.static(frontend));
  app.get(/^(?!\/api\/).*/, (req, res) =>
    res.sendFile(path.join(frontend, "index.html")),
  );
}

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
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    if (!hayBuild) {
      console.warn(
        "Sin build del frontend: corré `cd frontend && npm run build` o usá `npm run dev` en frontend/",
      );
    }
  });
});
