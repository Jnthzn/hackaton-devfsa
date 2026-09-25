import "./Historial.css";
import { IconShieldCheck, IconAlertTriangle, IconAlertOctagon } from "./icons";

const ETIQUETAS = {
  verde: { texto: "Seguro", Icon: IconShieldCheck },
  amarillo: { texto: "Sospechoso", Icon: IconAlertTriangle },
  rojo: { texto: "Peligro", Icon: IconAlertOctagon },
};

function formatearFecha(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function Historial({ reportes }) {
  return (
    <section className="historial">
      <h2>Últimos análisis de la comunidad</h2>

      {reportes.length === 0 ? (
        <p className="historial-vacio">
          Todavía no hay análisis. ¡Hacé el primero!
        </p>
      ) : (
        <ul>
          {reportes.map((r, i) => {
            const etiqueta = ETIQUETAS[r.nivel] ?? {
              texto: r.nivel,
              Icon: IconAlertTriangle,
            };
            const EtiquetaIcon = etiqueta.Icon;
            return (
              <li
                key={r._id ?? i}
                className={`historial-item historial-${r.nivel}`}
              >
                <div className="historial-top">
                  <span className="historial-etiqueta">
                    <EtiquetaIcon size={14} />
                    {etiqueta.texto}
                  </span>
                  <span className="historial-puntaje">{r.puntaje}/100</span>
                  <time dateTime={r.createdAt}>
                    {formatearFecha(r.createdAt)}
                  </time>
                </div>
                <p className="historial-texto">{r.contenido}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default Historial;
