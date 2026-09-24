// Límite simple por IP en memoria, sin dependencias: evita que alguien
// spamee el endpoint durante la demo pública.
const VENTANA_MS = 60_000;
const MAX_PETICIONES = 30;

const visitas = new Map();

const limitador = (req, res, next) => {
  const ahora = Date.now();
  const ip = req.ip || "desconocida";
  const previo = visitas.get(ip);

  if (!previo || ahora - previo.desde > VENTANA_MS) {
    visitas.set(ip, { desde: ahora, cantidad: 1 });
    return next();
  }

  previo.cantidad += 1;
  if (previo.cantidad > MAX_PETICIONES) {
    const esperar = Math.ceil((VENTANA_MS - (ahora - previo.desde)) / 1000);
    res.set("Retry-After", String(esperar));
    return res.status(429).json({
      error: `Demasiadas consultas seguidas. Probá de nuevo en ${esperar} segundos.`,
    });
  }

  next();
};

export default limitador;
