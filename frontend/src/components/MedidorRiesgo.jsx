import { useState } from "react";
import "./MedidorRiesgo.css";

const NIVELES = {
  verde: {
    emoji: "✅",
    titulo: "Seguro",
    frase: "No detectamos señales de riesgo",
  },
  amarillo: {
    emoji: "⚠️",
    titulo: "Sospechoso",
    frase: "Tené cuidado con este contenido",
  },
  rojo: {
    emoji: "🚨",
    titulo: "Peligro",
    frase: "Es muy probable que sea una estafa",
  },
};

const ICONOS = {
  urgencia: "⏰",
  datos: "🔑",
  suplantacion: "🎭",
  pago: "💸",
  oferta: "🎁",
  url: "🔗",
  combinacion: "⚠️",
};

function armarResumen({ nivel, puntaje, motivos = [], recomendacion }) {
  const lineas = [
    `⚠️ Alerta de posible estafa (riesgo ${nivel.toUpperCase()}, ${puntaje}/100)`,
  ];
  if (motivos.length > 0) {
    lineas.push("");
    motivos.forEach((m) => lineas.push(`• ${m.detalle}`));
  }
  lineas.push("", recomendacion);
  return lineas.join("\n");
}

function MedidorRiesgo({ resultado }) {
  const [copiado, setCopiado] = useState(false);

  if (!resultado) return null;

  const { nivel, puntaje, motivos = [], recomendacion, consejos = [] } =
    resultado;
  const info = NIVELES[nivel] ?? NIVELES.amarillo;

  const compartir = () => {
    const resumen = armarResumen(resultado);
    window.open(
      `https://wa.me/?text=${encodeURIComponent(resumen)}`,
      "_blank",
      "noopener"
    );
    navigator.clipboard
      ?.writeText(resumen)
      .then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
      })
      .catch(() => {});
  };

  return (
    <section className={`medidor medidor-${nivel}`}>
      <div className="medidor-cabecera">
        <div className="puntaje-circulo" style={{ "--pct": `${puntaje}%` }}>
          <div className="puntaje-interior">
            <strong>{puntaje}</strong>
            <span>de 100</span>
          </div>
        </div>
        <div>
          <h2>
            {info.emoji} {info.titulo}
          </h2>
          <p className="frase">{info.frase}</p>
        </div>
      </div>

      <h3>¿Por qué?</h3>
      {motivos.length > 0 ? (
        <ul className="motivos">
          {motivos.map((m, i) => (
            <li key={i}>
              <span className="motivo-icono" aria-hidden="true">
                {ICONOS[m.categoria] ?? "❗"}
              </span>
              <span>{m.detalle}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="sin-motivos">
          No detectamos señales de riesgo en este contenido.
        </p>
      )}

      <div className="recomendacion">
        <strong>Qué hacer</strong>
        <p>{recomendacion}</p>
      </div>

      {consejos.length > 0 && (
        <div className="consejos">
          <h3>Consejos para cuidarte</h3>
          <ul>
            {consejos.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {nivel !== "verde" && (
        <>
          <button type="button" className="btn-compartir" onClick={compartir}>
            📲 Compartir alerta por WhatsApp
          </button>
          {copiado && (
            <p className="copiado">¡Resumen copiado al portapapeles!</p>
          )}
        </>
      )}
    </section>
  );
}

export default MedidorRiesgo;