const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const propiedadesRouter = require('./routes/propiedades');
const clientesRouter = require('./routes/clientes');
const fichasRouter = require('./routes/fichas');
const { iniciarScraping } = require('./services/scheduler');

app.use('/api/propiedades', propiedadesRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/fichas', fichasRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mensaje: 'PropFinder funcionando' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`PropFinder backend corriendo en puerto ${PORT}`);
  // Iniciar scraping al arrancar
  await iniciarScraping();
});