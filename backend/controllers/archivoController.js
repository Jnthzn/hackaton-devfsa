import { analizarArchivo } from "../services/archivoService.js";

function leerNombre(cabecera) {
  try {
    return decodeURIComponent(cabecera || "");
  } catch {
    return cabecera || "";
  }
}

export const analizarArchivoSubido = (req, res) => {
  const archivo = req.body;

  if (!Buffer.isBuffer(archivo) || archivo.length === 0) {
    return res.status(400).json({ error: "Falta el archivo a analizar" });
  }

  try {
    const nombre = leerNombre(req.get("x-nombre-archivo"));
    res.json(analizarArchivo(archivo, nombre));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo analizar el archivo" });
  }
};