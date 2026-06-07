const axios = require('axios');
const db = require('../db');
require('dotenv').config();

const SCRAPER_KEY = process.env.SCRAPER_API_KEY;

const BUSQUEDAS = [
  { tipo: 'departamentos', zona: 'palermo' },
  { tipo: 'departamentos', zona: 'villa-crespo' },
  { tipo: 'departamentos', zona: 'chacarita' },
  { tipo: 'departamentos', zona: 'belgrano' },
  { tipo: 'ph', zona: 'palermo' },
  { tipo: 'ph', zona: 'villa-crespo' },
  { tipo: 'casas', zona: 'san-isidro' },
  { tipo: 'casas', zona: 'tigre' },
  { tipo: 'departamentos', zona: 'nordelta' },
  { tipo: 'departamentos', zona: 'vicente-lopez' },
];

function scraperUrl(url) {
  return `http://api.scraperapi.com?api_key=${SCRAPER_KEY}&url=${encodeURIComponent(url)}&render=true`;
}

async function scrapearZonaprop() {
  console.log('Iniciando scraping Zonaprop via ScraperAPI...');

  for (const b of BUSQUEDAS) {
    try {
      const targetUrl = `https://www.zonaprop.com.ar/${b.tipo}-venta-${b.zona}.html`;
      console.log(`Scrapeando: ${targetUrl}`);

      const response = await axios.get(scraperUrl(targetUrl), {
        timeout: 60000
      });

      const html = response.data;

      // Extraer __PRELOADED_STATE__
      const match = html.match(/window\.__PRELOADED_STATE__\s*=\s*(\{.+?\});\s*window/s);

      if (!match) {
        console.log(`Sin datos en ${b.zona} ${b.tipo}`);
        continue;
      }

      const data = JSON.parse(match[1]);
      const listado = data?.listStore?.listPostings || [];

      console.log(`Encontradas: ${listado.length} propiedades en ${b.zona}`);

      for (const item of listado) {
        await guardarPropiedad(item, b.zona, b.tipo);
      }

      await new Promise(r => setTimeout(r, 2000));

    } catch (err) {
      console.error(`Error en ${b.zona} ${b.tipo}:`, err.message);
    }
  }

  console.log('Scraping Zonaprop completado');
}

async function guardarPropiedad(item, zona, tipo) {
  try {
    const precio = item.priceOperationTypes?.[0]?.prices?.[0]?.amount;
    const moneda = item.priceOperationTypes?.[0]?.prices?.[0]?.currency || 'USD';
    if (!precio || moneda !== 'USD') return;

    const url = `https://www.zonaprop.com.ar${item.url || ''}`;

    const existe = await db.query(
      'SELECT id FROM propiedades WHERE url_original = $1',
      [url]
    );
    if (existe.rows.length > 0) return;

    const features = item.mainFeatures || {};
    const m2 = parseFloat(features['CFT100']?.value || features['CFT101']?.value || 0) || null;
    const ambientes = parseInt(features['CFT1']?.value || 0) || null;
    const banos = parseInt(features['CFT3']?.value || 0) || null;
    const cochera = parseInt(features['CFT7']?.value || 0) > 0;
    const antiguedad = parseInt(features['CFT5']?.value || 0) || null;
    const titulo = item.title || item.generatedTitle || `${tipo} en ${zona}`;
    if (item.visiblePictures) console.log('visiblePictures:', JSON.stringify(item.visiblePictures).substring(0, 200));
    const postingId = item.postingId;
    const fotos = item.visiblePictures?.pictures?.map(f => f.url730x532).filter(Boolean) || [];
      
      console.log('Keys del item:', Object.keys(item).join(', '));
    const direccion = item.address || zona;

    const { descuento, tipoOportunidad } = calcularOportunidad(
      precio, m2, zona, tipo, antiguedad
    );

    if (!tipoOportunidad) return;

    await db.query(
      `INSERT INTO propiedades
        (titulo, precio, moneda, m2, ambientes, banos, cochera,
         antiguedad, tipo, zona, direccion, fotos, fuente,
         url_original, descuento_porcentaje, tipo_oportunidad)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [
        titulo, precio, moneda, m2, ambientes, banos, cochera,
        antiguedad, tipo.replace('s',''), zona, direccion,
        fotos, 'zonaprop', url, descuento, tipoOportunidad
      ]
    );

    console.log(`✓ ${titulo} - ${tipoOportunidad} - USD ${precio}`);

  } catch (err) {
    console.error('Error guardando:', err.message);
  }
}

function calcularOportunidad(precio, m2, zona, tipo, antiguedad) {
  const referenciasPorZona = {
    'palermo': 2800, 'belgrano': 2600, 'nunez': 2400,
    'villa-crespo': 2200, 'chacarita': 2000,
    'san-isidro': 2500, 'vicente-lopez': 2300,
    'olivos': 2200, 'tigre': 1800,
    'nordelta': 2200, 'escobar': 1500
  };

  const refM2 = referenciasPorZona[zona] || 2000;
  const precioM2 = m2 ? precio / m2 : null;

  if (!precioM2) return { descuento: null, tipoOportunidad: null };

  const descuento = ((refM2 - precioM2) / refM2) * 100;
  if (descuento < 10) return { descuento, tipoOportunidad: null };

  const esFlip = antiguedad && antiguedad >= 30;

  return {
    descuento: Math.round(descuento),
    tipoOportunidad: esFlip ? 'FLIP' : 'OPO'
  };
}

module.exports = { scrapearZonaprop };