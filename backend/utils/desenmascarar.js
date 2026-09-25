export async function obtenerUrlReal(urlOriginal) {
  try {
    const respuesta = await fetch(urlOriginal, {
      method: "HEAD",
      redirect: "follow",
    });
    return respuesta.url;
  } catch (error) {
    return urlOriginal;
  }
}
