const axios = require('axios');
const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todas las oportunidades
router.get('/', async (req, res) => {
  try {
    const { tipo, zona, tipo_propiedad } = req.query;
    
    let query = `
      SELECT * FROM propiedades 
      WHERE activa = true
    `;
    const params = [];

    if (tipo) {
      params.push(tipo);
      query += ` AND tipo_oportunidad = $${params.length}`;
    }
    if (zona) {
      params.push(`%${zona}%`);
      query += ` AND zona ILIKE $${params.length}`;
    }
    if (tipo_propiedad) {
      params.push(tipo_propiedad);
      query += ` AND tipo = $${params.length}`;
    }

    query += ` ORDER BY fecha_deteccion DESC LIMIT 50`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo propiedades' });
  }
});
// Proxy de fotos para evitar bloqueo CORS
router.get('/foto', async (req, res) => {
    try {
      const { url } = req.query;
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'Referer': 'https://www.zonaprop.com.ar/',
          'User-Agent': 'Mozilla/5.0'
        }
      });
      res.set('Content-Type', response.headers['content-type']);
      res.send(response.data);
    } catch (err) {
      res.status(404).send('Foto no disponible');
    }
  });

module.exports = router;

