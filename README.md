# Analizador de riesgo digital

Pegás un mensaje sospechoso o un link y el sistema devuelve un puntaje de 0 a 100,
un semáforo, los motivos explicados, una recomendación y consejos educativos.
El análisis es 100% local: reglas heurísticas, sin servicios externos.

Semáforo: **verde** 0-30, **amarillo** 31-65, **rojo** 66-100.

## Cómo correr el backend

```bash
cd backend
npm install
cp .env.example .env   # completá MONGO_URI (si no hay base, el historial queda en memoria)
npm run dev            # http://localhost:3000
npm test               # casos de calibración
```

## Cómo correr el frontend

Es una app de React con Vite que consume la API con rutas relativas (`/api/...`).

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173, con proxy a http://localhost:3000/api
```

Para verlo todo desde un solo puerto (así queda en el deploy):

```bash
cd frontend && npm run build   # genera frontend/dist
cd ../backend && npm start     # sirve la app en http://localhost:3000
```

## API

Base: `http://localhost:3000/api` (CORS habilitado).

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/health` | `{ "ok": true, "db": true }` (`db` indica si hay MongoDB conectado) |
| POST | `/analisis` | Analiza `{ "contenido": "texto o link" }` (string, máximo 5000 caracteres) |
| GET | `/reportes?limit=10` | Historial de análisis, del más nuevo al más viejo (máximo 50) |
| GET | `/estadisticas` | Resumen del historial: total, conteo por nivel, puntaje promedio y categorías más frecuentes |

Respuesta de `POST /analisis`:

```json
{
  "tipo": "mensaje",
  "puntaje": 90,
  "nivel": "rojo",
  "motivos": [
    { "categoria": "urgencia", "detalle": "Lenguaje de urgencia o amenaza: urgente" }
  ],
  "recomendacion": "Alto riesgo de estafa. No respondas, no abras enlaces ni compartas datos.",
  "consejos": ["Los estafadores generan presión para que no pienses."]
}
```

- `tipo`: `mensaje` o `url` (url cuando lo enviado es solo un link).
- `nivel`: `verde`, `amarillo` o `rojo`.
- `categoria` de cada motivo: `urgencia`, `datos`, `suplantacion`, `pago`, `oferta`, `url` o `combinacion`.
- `motivos` y `consejos` pueden venir vacíos (caso verde).
- Errores: `400` si falta `contenido`, es muy largo o el JSON es inválido; `429` si se superan 30 análisis por minuto desde la misma IP; `500` ante un error interno.

Respuesta de `GET /estadisticas`:

```json
{
  "total": 12,
  "porNivel": { "verde": 5, "amarillo": 3, "rojo": 4 },
  "puntajePromedio": 41,
  "categoriasFrecuentes": [{ "categoria": "urgencia", "cantidad": 7 }]
}
```

Si existe `frontend/dist`, el backend lo sirve como estático (con fallback a `index.html` para las rutas que no empiezan con `/api/`), así que con un solo deploy la app queda disponible en `http://localhost:3000/`. En Render: build `npm install && npm run build`, start `npm start`, root directory `backend`.

## Qué detecta

- **Urgencia y amenaza**: cuenta bloqueada, último aviso, 24 horas, mayúsculas y signos repetidos.
- **Pedido de datos**: clave, token, CBU, DNI y el pedido del código de verificación por SMS.
- **Suplantación**: "hola mamá / cambié de número", falso soporte del banco, falso agente oficial.
- **Pagos difíciles de recuperar**: cripto, gift cards, tasa aduanera, pago anticipado de envíos.
- **Ofertas increíbles**: trabajo remoto sin experiencia, ganancias garantizadas.
- **URLs**: acortadores, terminaciones raras (.xyz, .top), IP en lugar de dominio, `banc0` con números
  por letras, dominios que imitan marcas argentinas (Mercado Pago, AFIP/ARCA, ANSES, bancos, Correo
  Argentino), punycode, rutas tipo `/login` y `http` sin `s`.
- **Combinaciones**: urgencia + datos, suplantación + datos, suplantación + pago, oferta + pago.

Todos los pesos, listas de palabras y marcas están como constantes al inicio de
`backend/services/analisisService.js` para calibrarlos rápido.

## Privacidad

Antes de guardar un reporte se anonimiza el contenido: los emails pasan a `[email]`, los números
de 6 o más dígitos (CBU, teléfonos, tarjetas) a `[numero]`, y se recorta a 500 caracteres.

## Estructura

```
backend/   config, controllers, models, routes, services, tests
frontend/  assets, css, js, index.html
```
