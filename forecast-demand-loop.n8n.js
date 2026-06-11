// ============================================================
//  Nodo Code (n8n): Pronóstico de demanda POR SKU (dentro del loop)
//  Entrada: movimientos de historial_inventario (nodo Postgres previo)
//  Contexto: producto_sku y stock_actual desde "Loop Over Items"
//  Salida: 1 fila lista para UPSERT en pronosticos_demanda
// ============================================================

// Movimientos del SKU actual (vienen del nodo Postgres anterior)
const rows = $input.all().map(i => i.json);

// SKU y stock del item que reparte el loop
const sku         = $('Loop Over Items').first().json.producto_sku;
const stockActual = Number($('Loop Over Items').first().json.stock_actual ?? 0);

const ventas = rows
  .filter(r => Number(r.diferencia) < 0)
  .map(r => ({ fecha: new Date(r.fecha_movimiento), unidades: -Number(r.diferencia) }))
  .sort((a, b) => a.fecha - b.fecha);

// Sin datos suficientes -> guardamos un registro "SIN_DATOS" (no rompe el loop)
if (ventas.length < 3) {
  return [{ json: {
    producto_sku: sku,
    demanda_diaria: null,
    dias_quiebre_pronostico: null,
    tendencia: "SIN_DATOS",
    mape: null
  }}];
}

// Serie de ventas semanales
const t0 = ventas[0].fecha.getTime();
const SEMANA = 7 * 24 * 3600 * 1000;
const acum = {};
for (const v of ventas) {
  const w = Math.floor((v.fecha.getTime() - t0) / SEMANA);
  acum[w] = (acum[w] || 0) + v.unidades;
}
const serie = Object.keys(acum).map(w => ({ x: Number(w), y: acum[w] })).sort((a, b) => a.x - b.x);

// Regresión lineal (mínimos cuadrados)
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
const demDiaria = Math.max(0, intercept + slope * proxX) / 7;

// Días de quiebre proyectado (acumulando el pronóstico)
let stock = stockActual, dias = 0;
while (stock > 0 && dias < 365) {
  const x = proxX + Math.floor(dias / 7);
  stock -= Math.max(0, intercept + slope * x) / 7;
  dias++;
}

// Backtest (MAPE)
let mape = null;
if (serie.length >= 4) {
  const train = serie.slice(0, -1);
  const test = serie[serie.length - 1];
  const r = regresion(train);
  const pred = Math.max(0, r.intercept + r.slope * test.x);
  mape = test.y === 0 ? null : Math.round(Math.abs(pred - test.y) / test.y * 100);
}

const tendencia = slope > 0.3 ? "CRECIENTE" : slope < -0.3 ? "DECRECIENTE" : "ESTABLE";

return [{ json: {
  producto_sku: sku,
  demanda_diaria: Number(demDiaria.toFixed(2)),
  dias_quiebre_pronostico: dias,
  tendencia,
  mape
}}];
