import "./Estadisticas.css";
import {
  IconActivity,
  IconAlertOctagon,
  IconAlertTriangle,
  IconShieldCheck,
} from "./icons";

const NOMBRES = {
  urgencia: "Urgencia",
  datos: "Pedido de datos",
  suplantacion: "Suplantación",
  pago: "Pagos riesgosos",
  oferta: "Ofertas falsas",
  url: "Enlaces sospechosos",
  combinacion: "Combinaciones",
};

function Estadisticas({ stats }) {
  if (!stats) return null;

  const total = stats.total ?? 0;
  const porNivel = stats.porNivel ?? {};
  const top = (stats.categoriasFrecuentes ?? []).slice(0, 3);

  return (
    <section className="estadisticas" aria-label="Estadísticas de la comunidad">
      <div className="stat stat-total">
        <IconActivity size={18} />
        <strong>{total}</strong>
        <span>análisis realizados</span>
      </div>
      <div className="stat stat-rojo">
        <IconAlertOctagon size={18} />
        <strong>{porNivel.rojo ?? 0}</strong>
        <span>peligrosos</span>
      </div>
      <div className="stat stat-amarillo">
        <IconAlertTriangle size={18} />
        <strong>{porNivel.amarillo ?? 0}</strong>
        <span>sospechosos</span>
      </div>
      <div className="stat stat-verde">
        <IconShieldCheck size={18} />
        <strong>{porNivel.verde ?? 0}</strong>
        <span>seguros</span>
      </div>

      {top.length > 0 && (
        <p className="stat-top">
          Engaños más comunes:{" "}
          {top
            .map(
              (c) => `${NOMBRES[c.categoria] ?? c.categoria} (${c.cantidad})`,
            )
            .join(", ")}
        </p>
      )}
    </section>
  );
}

export default Estadisticas;
