const API_URL = "/api";

async function pedir(ruta, opciones) {
  let res;
  try {
    res = await fetch(`${API_URL}${ruta}`, opciones);
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor. Probá de nuevo en un momento."
    );
  }

  if (res.status === 429) {
    throw new Error("Esperá unos segundos y probá de nuevo.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Ocurrió un error. Probá de nuevo.");
  }
  return data;
}

export function analizarTexto(contenido) {
  return pedir("/analisis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contenido }),
  });
}

export function obtenerReportes(limit = 10) {
  return pedir(`/reportes?limit=${limit}`);
}

export function obtenerEstadisticas() {
  return pedir("/estadisticas");
}

export function analizarArchivo(archivo) {
  return pedir("/archivo", {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "X-Nombre-Archivo": encodeURIComponent(archivo.name),
    },
    body: archivo,
  });
}