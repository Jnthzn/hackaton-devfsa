import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reporteSchema = new Schema(
  {
    tipo: { type: String, enum: ["mensaje", "url"], required: true },
    contenido: { type: String, required: true, maxlength: 1000 }, // ya anonimizado
    puntaje: { type: Number, min: 0, max: 100, required: true },
    nivel: {
      type: String,
      enum: ["verde", "amarillo", "rojo"],
      required: true,
    },
    motivos: [{ _id: false, categoria: String, detalle: String }],
  },
  { timestamps: true, collection: "reportes" },
);

export default model("Reporte", reporteSchema);
