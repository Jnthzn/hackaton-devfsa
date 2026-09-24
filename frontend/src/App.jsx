import { useEffect, useState } from "react";
import "./App.css";
import MedidorRiesgo from "./components/MedidorRiesgo";
import Estadisticas from "./components/Estadisticas";
import Historial from "./components/Historial";
import {
  analizarTexto,
  obtenerReportes,
  obtenerEstadisticas,
} from "./services/api";

function App() {
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
    } catch {
      // Si falla el historial no rompemos la pantalla
    }
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

  return (
    <main className="contenedor">
      <header className="encabezado">
        <h1>🛡️ ¿Es una estafa?</h1>
        <p className="subtitulo">
          Pegá el mensaje o link sospechoso y te decimos si es seguro.
        </p>
      </header>

      <Estadisticas stats={stats} />

      <form className="formulario" onSubmit={handleSubmit}>
        <label htmlFor="contenido">Mensaje o enlace a revisar</label>
        <textarea
          id="contenido"
          rows="6"
          placeholder="Pegá acá el mensaje o enlace..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          required
          maxLength={5000}
        />
        <button type="submit" className="btn-analizar" disabled={cargando}>
          {cargando && <span className="spinner" aria-hidden="true" />}
          {cargando ? "Analizando..." : "Analizar"}
        </button>
      </form>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div aria-live="polite">
        <MedidorRiesgo resultado={resultado} />
      </div>

      <Historial reportes={reportes} />
    </main>
  );
}

export default App;
