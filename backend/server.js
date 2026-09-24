import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10kb" }));

app.use("/api", routes);

app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`Servidor corriendo en http://localhost:${PORT}`),
  );
});
