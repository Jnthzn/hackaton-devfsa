import { useEffect, useState } from "react";
import MedidorRiesgo from "./MedidorRiesgo";
import { analizarArchivo } from "../services/api";
import "./AnalizadorArchivo.css";

const MAX_MB = 10;

function formatearTamano(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AnalizadorArchivo() {
  const [archivo, setArchivo] = useState(null);
  const [vista, setVista] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [arrastrando, setArrastrando] = useState(false);

  // Libera la vista previa anterior cuando cambia o al salir de la pestaña
  useEffect(() => {
    return () => {
      if (vista) URL.revokeObjectURL(vista);
    };
  }, [vista]);

  const elegir = (f) => {
    setResultado(null);
    setError("");
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setArchivo(null);
      setVista(null);
      setError(`El archivo pesa más de ${MAX_MB} MB. Elegí uno más chico.`);
      return;
    }
    setArchivo(f);
    setVista(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
  };

  const analizar = async () => {
    if (!archivo) return;
    setCargando(true);
    setError("");
    setResultado(null);
    try {
      setResultado(await analizarArchivo(archivo));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="analizador-archivo">
      <label
        className={`zona ${arrastrando ? "zona-activa" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastrando(false);
          elegir(e.dataTransfer.files[0]);
        }}
      >
        <input type="file" onChange={(e) => elegir(e.target.files[0])} />
        <span className="zona-icono" aria-hidden="true">
          📎
        </span>
        <strong>Tocá para elegir un archivo o una imagen</strong>
        <span>o arrastralo hasta acá (máximo {MAX_MB} MB)</span>
      </label>

      {archivo && (
        <div className="archivo-elegido">
          {vista && (
            <img
              className="vista-previa"
              src={vista}
              alt="Vista previa de la imagen elegida"
            />
          )}
          <p>
            <strong>{archivo.name}</strong>
            <span>{formatearTamano(archivo.size)}</span>
          </p>
        </div>
      )}

      <button
        type="button"
        className="btn-analizar"
        onClick={analizar}
        disabled={!archivo || cargando}
      >
        {cargando && <span className="spinner" aria-hidden="true" />}
        {cargando ? "Analizando..." : "Analizar archivo"}
      </button>

      <p className="nota-privacidad">
        Revisamos señales de riesgo y de manipulación. No guardamos tu archivo y
        esto no reemplaza a un antivirus.
      </p>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div aria-live="polite">
        <MedidorRiesgo resultado={resultado} />
      </div>
    </section>
  );
}

export default AnalizadorArchivo;