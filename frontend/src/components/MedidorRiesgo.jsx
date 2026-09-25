import {
  IconShieldCheck,
  IconAlertTriangle,
  IconAlertOctagon,
  IconAlertCircle,
  ICONOS_MOTIVO,
} from "./icons";
import "./MedidorRiesgo.css";

const NIVELES = {
  verde: {
    Icon: IconShieldCheck,
    titulo: "Seguro",
    frase: "No detectamos señales de riesgo",
  },
  amarillo: {
    Icon: IconAlertTriangle,
    titulo: "Sospechoso",
    frase: "Tené cuidado con este contenido",
  },
  rojo: {
    Icon: IconAlertOctagon,
    titulo: "Peligro",
    frase: "Es muy probable que sea una estafa",
  },
};

function MedidorRiesgo({ resultado }) {
  if (!resultado) {
    return (
      <section className="medidor medidor-vacio">
        <IconShieldCheck size={32} />
        <p>Pegá un mensaje o enlace para ver el resultado acá.</p>
      </section>
    );
  }

  const {
    nivel,
    puntaje,
    motivos = [],
    recomendacion,
    consejos = [],
  } = resultado;
  const info = NIVELES[nivel] ?? NIVELES.amarillo;
  const NivelIcon = info.Icon;

  return (
    <section className={`medidor medidor-${nivel}`}>
      <div className="medidor-cabecera">
        <div className="puntaje-circulo" style={{ "--pct": `${puntaje}%` }}>
          <div className="puntaje-interior">
            <strong>{puntaje}</strong>
            <span>de 100</span>
          </div>
        </div>
        <div className="medidor-veredicto">
          <h2>
            <NivelIcon size={20} />
            {info.titulo}
          </h2>
          <p className="frase">{resultado.veredicto ?? info.frase}</p>
        </div>
      </div>

      <h3>Por qué</h3>
      {motivos.length > 0 ? (
        <ul className="motivos">
          {motivos.map((m, i) => {
            const MotivoIcon = ICONOS_MOTIVO[m.categoria] ?? IconAlertCircle;
            return (
              <li key={i}>
                <span className="motivo-icono" aria-hidden="true">
                  <MotivoIcon size={16} />
                </span>
                <span>{m.detalle}</span>
              </li>
            );
          })}
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
    </section>
  );
}

export default MedidorRiesgo;
