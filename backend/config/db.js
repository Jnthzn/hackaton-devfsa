import mongoose from "mongoose";

// Si Mongo no responde el servidor igual arranca: el historial pasa a memoria
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB conectado");
    return true;
  } catch (err) {
    console.error("Error conectando a MongoDB:", err.message);
    console.warn("Sigo sin base: el historial se guarda solo en memoria");
    return false;
  }
};

export default connectDB;
