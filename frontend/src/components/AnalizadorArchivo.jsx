import { useEffect, useState } from "react";
import jsQR from "jsqr";
import MedidorRiesgo from "./MedidorRiesgo";
import { analizarArchivo, analizarTexto } from "../services/api";
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
  const [qrDetectado, setQrDetectado] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [arrastrando, setArrastrando] = useState(false);

  useEffect(() => {
    return () => {
      if (vista) URL.revokeObjectURL(vista);
    };
  }, [vista]);

  // Función para procesar la imagen y extraer el código QR
  const procesarQR = (f) => {
    if (!f.type.startsWith("image/")) {
      setQrDetectado(null);
      return;
    }

    const img = new Image();
    const urlTemp = URL.createObjectURL(f);
    img.src = urlTemp;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const codigo = jsQR(imageData.data, imageData.width, imageData.height);

      if (codigo && codigo.data) {
        setQrDetectado(codigo.data);
      } else {
        setQrDetectado(null);
      }
      URL.revokeObjectURL(urlTemp);
    };
  };

  const elegir = (f) => {
    setResultado(null);
    setError("");
    setQrDetectado(null);

    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setArchivo(null);
      setVista(null);
      setError(`El archivo pesa más de ${MAX_MB} MB. Elegí uno más chico.`);
      return;
    }

    setArchivo(f);
    setVista(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
    procesarQR(f);
  };

  const analizar = async () => {
    if (!archivo) return;
    setCargando(true);
    setError("");
    setResultado(null);

    try {
      // Si la imagen tiene un QR con link, analizamos el contenido/link del QR
      if (qrDetectado) {
        const data = await analizarTexto(qrDetectado);
        setResultado(data);
      } else {
        setResultado(await analizarArchivo(archivo));
      }
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
          📷
        </span>
        <strong>Tocá para elegir un archivo o una imagen con QR</strong>
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

      {/* Cartel avisando que se detectó un código QR */}
      {qrDetectado && (
        <div
          style={{
            margin: "10px 0",
            padding: "10px",
            borderRadius: "6px",
            background: "#e3f2fd",
            border: "1px solid #90caf9",
            color: "#0d47a1",
          }}
        >
          📲 <strong>Código QR detectado:</strong>{" "}
          <span style={{ wordBreak: "break-all" }}>{qrDetectado}</span>
        </div>
      )}

      <button
        type="button"
        className="btn-analizar"
        onClick={analizar}
        disabled={!archivo || cargando}
      >
        {cargando && <span className="spinner" aria-hidden="true" />}
        {cargando ? "Analizando..." : "Analizar imagen / QR"}
      </button>

      <p className="nota-privacidad">
        Revisamos señales de riesgo, códigos QR y manipulación. No guardamos tu
        archivo.
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
