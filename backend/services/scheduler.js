const cron = require('node-cron');
const { scrapearZonaprop } = require('../scrapers/zonaprop');

// Corre cada 15 minutos
cron.schedule('*/15 * * * *', async () => {
  console.log('Iniciando ciclo de scraping:', new Date().toLocaleString());
  try {
    await scrapearZonaprop();
    console.log('Ciclo completado correctamente');
  } catch (err) {
    console.error('Error en ciclo de scraping:', err.message);
  }
});

// Correr inmediatamente al iniciar
async function iniciarScraping() {
  console.log('Primera ejecución del scraper...');
  try {
    await scrapearZonaprop();
  } catch (err) {
    console.error('Error en primera ejecución:', err.message);
  }
}

module.exports = { iniciarScraping };