// ============================================================
//  n8n Code node: "markdown -> json"
//  Campos reales del loop: sku_buscado, marca, modelo, sitio_evaluado
// ============================================================

// 1. Markdown de Firecrawl
const markdown = $input.first().json.data?.markdown || $('/scrape').first().json?.data?.markdown || "";

// 2. Contexto del loop (seguro) — nombres REALES confirmados
let ctx = {};
try { ctx = $('Loop Over Items').first().json || {}; } catch (e) { ctx = {}; }

const sitioOrigen   = ctx.sitio_evaluado || "Made in China";
const skuReferencia = ctx.sku_buscado || "N/A";
const marca         = (ctx.marca  || "").toLowerCase();   // "chevrolet"
const modelo        = (ctx.modelo || "").toLowerCase();   // "aveo"

const tipoMercado = ["AliExpress", "MercadoLibre Venezuela", "Amazon"].includes(sitioOrigen) ? "B2C" : "B2B";

// 2b. Validación de relevancia
const PIEZAS_INCORRECTAS = /ventilador|manguera|bomba|soporte|enfriador|cable|tubo|sensor|tanque|tapa|limpiaparabrisas|dep[oó]sito|espejo|faro|parachoques|encendido|interruptor/i;

const tokensModelo = modelo.split(/\s+/).filter(p => p.length > 2); // ["aveo"]

function esRelevante(titulo) {
  const t = titulo.toLowerCase();
  if (PIEZAS_INCORRECTAS.test(t)) return false;             // fuera accesorios
  const esRadiador  = /radiador|radiator/.test(t);          // debe ser radiador
  const tieneMarca  = marca && t.includes(marca);           // "chevrolet"
  const tieneModelo = tokensModelo.some(p => t.includes(p)); // "aveo"
  return esRadiador && (tieneMarca || tieneModelo);
}

// 3. RegEx por sitio
let regexTituloUrl = /^(.*?)]\((.*?)\)/;
let regexPrecio, regexMoq;
if (sitioOrigen === "Alibaba") {
  regexPrecio = /\$([\d,.-]+)/;
  regexMoq = /Min\. order:\s*([\d,.]+)/i;
} else {
  regexPrecio = /\*\*(US\$[\s\d,.-]+)\*\*/;
  regexMoq = /([\d,.]+)\s*[A-Za-z-áéíóúüñ]+\s*\(MOQ\)/i;
}

// 4. Extracción + filtro
const productosExtraidos = [];
const bloques = markdown.split('## [');

for (let i = 1; i < bloques.length; i++) {
  const bloque = bloques[i];
  const tituloUrlMatch = bloque.match(regexTituloUrl);
  const precioMatch = bloque.match(regexPrecio);
  const moqMatch = bloque.match(regexMoq);

  if (tituloUrlMatch && precioMatch) {
    const tituloLimpio = tituloUrlMatch[1].replace(/\*\*/g, '').trim();
    if (!esRelevante(tituloLimpio)) continue;

    const moqLimpio = moqMatch ? moqMatch[1].trim() : "1";
    const prefijoPrecio = (sitioOrigen === "Alibaba") ? "US$" : "";
    const precioLimpio = prefijoPrecio + precioMatch[1].trim();
    const moqNumerico = parseInt(moqLimpio.replace(/[^\d]/g, ''), 10) || 1;

    productosExtraidos.push({
      json: {
        texto_semantico: `Producto: ${tituloLimpio}. El precio mínimo es de ${precioLimpio} y exigen una compra mínima de ${moqLimpio} unidades.`,
        sitio_origen: sitioOrigen,
        tipo_mercado: tipoMercado,
        precio_usd: precioLimpio,
        moq: moqNumerico,
        sku_referencia: skuReferencia
      }
    });
    if (productosExtraidos.length === 3) break;
  }
}

// 5. Log
console.log("Bloques:", bloques.length - 1, "| Relevantes:", productosExtraidos.length, "| marca:", marca, "| modelo:", modelo);

// 6. Return: SIEMPRE devolvemos al menos 1 item para que el Loop Over Items
//    no se quede sin datos y siga con el siguiente producto.
//    - Si hay radiadores -> los productos (tienen `texto_semantico`).
//    - Si NO hay -> un item "marcado" (relevante:false, SIN `texto_semantico`)
//      que un nodo IF/Filter posterior desviará para que NO entre al PGVector.
if (productosExtraidos.length === 0) {
  return [{
    json: {
      relevante: false,
      sku_referencia: skuReferencia,
      motivo: `Sin radiadores relevantes para ${skuReferencia} (${marca} ${modelo}) en ${sitioOrigen}`
    }
  }];
}
return productosExtraidos;
