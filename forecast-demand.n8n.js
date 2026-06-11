// ============================================================
//  Nodo Code (n8n): Pronóstico de demanda
//  Convierte el historial de movimientos en una PREDICCIÓN real
//  mediante regresión lineal de tendencia + backtest (MAPE).
//  Corre ya mismo con datos de prueba inline.
// ============================================================

// --- 1. ENTRADA ---
// Real: conecta antes un nodo Postgres con:
//   SELECT fecha_movimiento, diferencia FROM historial_inventario
//   WHERE producto_sku = 'RAD-AVE-345' AND diferencia < 0 ORDER BY fecha_movimiento;
// Y usa: const rows = $input.all().map(i => i.json);
// Prueba YA: si no llega historial, usamos datos de prueba (ventas crecientes).
const entrada = $input.all().map(i => i.json);
const hayHistorial = entrada.length && entrada[0].diferencia !== undefined;

const rows = hayHistorial ? entrada : [
  { fecha_movimiento: "2026-05-13", diferencia: -3 },
  { fecha_movimiento: "2026-05-16", diferencia: -3 },
  { fecha_movimiento: "2026-05-20", diferencia: -3 },
  { fecha_movimiento: "2026-05-25", diferencia: -4 },
  { fecha_movimiento: "2026-05-29", diferencia: -4 },
  { fecha_movimiento: "2026-06-02", diferencia: -5 },
  { fecha_movimiento: "2026-06-06", diferencia: -5 },
  { fecha_movimiento: "2026-06-09", diferencia: -6 },
];

const stockActual = Number(entrada[0]?.stock_actual ?? 15);

// --- 2. Serie de ventas semanales (suaviza el ruido) ---
const ventas = rows
  .filter(r => Number(r.diferencia) < 0)
  .map(r => ({ fecha: new Date(r.fecha_movimiento), unidades: -Number(r.diferencia) }))
  .sort((a, b) => a.fecha - b.fecha);

if (ventas.length < 3) {
  return [{ json: { error: "Datos insuficientes para pronosticar (>= 3 ventas)" } }];
}

const t0 = ventas[0].fecha.getTime();
const SEMANA = 7 * 24 * 3600 * 1000;
const acum = {};
for (const v of ventas) {
  const w = Math.floor((v.fecha.getTime() - t0) / SEMANA);
  acum[w] = (acum[w] || 0) + v.unidades;
}
const serie = Object.keys(acum)
  .map(w => ({ x: Number(w), y: acum[w] }))
  .sort((a, b) => a.x - b.x);

// --- 3. Regresión lineal (mínimos cuadrados) ---
function regresion(pts) {
  const n = pts.length;
  const sx = pts.reduce((s, p) => s + p.x, 0);
  const sy = pts.reduce((s, p) => s + p.y, 0);
  const sxy = pts.reduce((s, p) => s + p.x * p.y, 0);
  const sxx = pts.reduce((s, p) => s + p.x * p.x, 0);
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx || 1);
  const intercept = (sy - slope * sx) / n;
  return { slope, intercept };
}
const { slope, intercept } = regresion(serie);

const proxX = serie[serie.length - 1].x + 1;
const demSemanal = Math.max(0, intercept + slope * proxX);
const demDiaria = demSemanal / 7;

// --- 4. Días de quiebre PROYECTADO (acumulando el pronóstico, no dividiendo) ---
let stock = stockActual, dias = 0;
while (stock > 0 && dias < 365) {
  const x = proxX + Math.floor(dias / 7);
  stock -= Math.max(0, intercept + slope * x) / 7;
  dias++;
}

// --- 5. Backtest: error del modelo (MAPE) ---
let mape = null;
if (serie.length >= 4) {
  const train = serie.slice(0, -1);
  const test = serie[serie.length - 1];
  const r = regresion(train);
  const pred = Math.max(0, r.intercept + r.slope * test.x);
  mape = test.y === 0 ? null : Math.round(Math.abs(pred - test.y) / test.y * 100);
}

const tendencia = slope > 0.3 ? "CRECIENTE" : slope < -0.3 ? "DECRECIENTE" : "ESTABLE";

return [{
  json: {
    stock_actual: stockActual,
    demanda_diaria_pronosticada: Number(demDiaria.toFixed(2)),
    demanda_semanal_pronosticada: Number(demSemanal.toFixed(2)),
    tendencia_demanda: tendencia,                       // CRECIENTE / ESTABLE / DECRECIENTE
    pendiente_semanal: Number(slope.toFixed(3)),        // cuánto crece/cae por semana
    dias_estimados_quiebre_pronosticado: dias,          // proyección real (vs stock/promedio)
    error_pronostico_mape: mape,                        // % de error en backtest
    semanas_analizadas: serie.length,
    fuente_datos: hayHistorial ? "historial_inventario" : "datos_de_prueba"
  }
}];
