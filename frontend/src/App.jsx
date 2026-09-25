import { useEffect, useState } from "react";
import "./App.css";
import MedidorRiesgo from "./components/MedidorRiesgo";
import Estadisticas from "./components/Estadisticas";
import Historial from "./components/Historial";
import AnalizadorArchivo from "./components/AnalizadorArchivo";
import {
  IconShieldCheck,
  IconMessageCircle,
  IconQrcode,
  IconVolume2,
  IconLink,
} from "./components/icons";
import {
  analizarTexto,
  obtenerReportes,
  obtenerEstadisticas,
} from "./services/api";

function App() {
  const [modo, setModo] = useState("texto");
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [reportes, setReportes] = useState([]);
  const [stats, setStats] = useState(null);

  const cargarPanel = async () => {
    try {
      const [r, s] = await Promise.all([
        obtenerReportes(10),
        obtenerEstadisticas(),
      ]);
      setReportes(r);
      setStats(s);
    } catch {}
  };

  useEffect(() => {
    let activo = true;
    Promise.all([obtenerReportes(10), obtenerEstadisticas()])
      .then(([r, s]) => {
        if (activo) {
          setReportes(r);
          setStats(s);
        }
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;

    setCargando(true);
    setError("");
    setResultado(null);

    try {
      const data = await analizarTexto(texto);
      setResultado(data);
      cargarPanel();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEscucharAlerta = () => {
    if (!resultado) return;
    if (!("speechSynthesis" in window)) {
      alert("Tu navegador no soporta lectura por voz");
      return;
    }

    window.speechSynthesis.cancel();

    let listaMotivos = [];
    if (Array.isArray(resultado.motivos)) {
      listaMotivos = resultado.motivos.map((m) =>
        typeof m === "object"
          ? m.descripcion || m.motivo || m.texto || JSON.stringify(m)
          : m,
      );
    } else if (typeof resultado.motivos === "string") {
      listaMotivos = [resultado.motivos];
    }

    const motivosTexto = listaMotivos
      .join(". ")
      .replace(/https?:\/\/[^\s]+/gi, "un enlace sospechoso")
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.]/g, "");

    const mensaje = `Resultado del análisis: Nivel de riesgo ${resultado.nivel || ""}. ${motivosTexto}`;

    const locucion = new SpeechSynthesisUtterance(mensaje);
    locucion.lang = "es-AR";
    locucion.rate = 0.9;

    const voces = window.speechSynthesis.getVoices();
    const vozEspanol = voces.find((v) => v.lang.startsWith("es"));
    if (vozEspanol) locucion.voice = vozEspanol;

    window.speechSynthesis.speak(locucion);
  };

  return (
    <div className="layout-app">
      <div className="contenedor-ancho">
        <header className="hero-section">
          <span className="hero-badge">
            <IconShieldCheck size={15} />
            Hackathon 2026 · Ciberseguridad familiar
          </span>
          <h1 className="hero-titulo">
            Detectá estafas y phishing al instante
          </h1>
          <p className="hero-subtitulo">
            Protegé a tu familia analizando mensajes, enlaces acortados y
            códigos QR sospechosos antes de hacer clic.
          </p>
        </header>

        <div className="panel-dos-columnas">
          <div className="columna-izquierda">
            <div className="pestanas" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={modo === "texto"}
                className={`pestana ${modo === "texto" ? "activa" : ""}`}
                onClick={() => setModo("texto")}
              >
                <IconMessageCircle size={16} />
                Mensaje o link
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={modo === "archivo"}
                className={`pestana ${modo === "archivo" ? "activa" : ""}`}
                onClick={() => setModo("archivo")}
              >
                <IconQrcode size={16} />
                Código QR o archivo
              </button>
            </div>

            <div className="card-input-principal">
              {modo === "texto" ? (
                <form className="formulario" onSubmit={handleSubmit}>
                  <label htmlFor="contenido">Mensaje o enlace a analizar</label>
                  <textarea
                    id="contenido"
                    rows="5"
                    placeholder="Pegá acá el texto, SMS, mail o enlace sospechoso..."
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    required
                    maxLength={5000}
                  />
                  <button
                    type="submit"
                    className="btn-analizar"
                    disabled={cargando}
                  >
                    {cargando && (
                      <span className="spinner" aria-hidden="true" />
                    )}
                    {cargando ? "Analizando..." : "Analizar riesgo"}
                  </button>
                </form>
              ) : (
                <AnalizadorArchivo />
              )}
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
            </div>

            <div className="contenedor-stats-2x2">
              <Estadisticas stats={stats} />
            </div>
          </div>

          <div className="columna-derecha">
            <div className="card-resultado-gauge">
              <MedidorRiesgo resultado={resultado} />

              {resultado?.urlReal && (
                <div className="alerta-desenmascarar">
                  <IconLink size={16} />
                  <span>
                    <strong>Link real:</strong>{" "}
                    <span className="url-destilada">{resultado.urlReal}</span>
                  </span>
                </div>
              )}

              {resultado && (
                <div className="acciones-resultado">
                  <button
                    type="button"
                    className="btn-audio"
                    onClick={handleEscucharAlerta}
                  >
                    <IconVolume2 size={16} />
                    Modo Senior (Audio)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card-historial">
          <Historial reportes={reportes} />
        </div>
      </div>
    </div>
  );
}

export default App;
