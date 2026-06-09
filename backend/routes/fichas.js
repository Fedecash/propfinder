const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

// Crear ficha para cliente
router.post('/', async (req, res) => {
  try {
    const { cliente_id, propiedades_ids } = req.body;
    const codigo = crypto.randomBytes(6).toString('hex');

    const result = await db.query(
      `INSERT INTO fichas (cliente_id, propiedades_ids, codigo_unico)
       VALUES ($1, $2, $3) RETURNING *`,
      [cliente_id, propiedades_ids, codigo]
    );

    res.json({
      ...result.rows[0],
      link: `https://propfinder-kappa.vercel.app/ficha/${codigo}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando ficha' });
  }
});

// Ver ficha por código (lo que ve el cliente)
router.get('/:codigo', async (req, res) => {
  try {
    const ficha = await db.query(
      'SELECT * FROM fichas WHERE codigo_unico = $1',
      [req.params.codigo]
    );

    if (ficha.rows.length === 0) {
      return res.status(404).json({ error: 'Ficha no encontrada' });
    }

    const f = ficha.rows[0];

    // Marcar como vista
    await db.query(
      'UPDATE fichas SET visto = true WHERE id = $1',
      [f.id]
    );

    // Obtener propiedades
    const props = await db.query(
      `SELECT titulo, precio, moneda, m2, ambientes, 
              banos, cochera, antiguedad, tipo, zona, 
              fotos
       FROM propiedades 
       WHERE id = ANY($1)`,
      [f.propiedades_ids]
    );

    const cliente = await db.query(
      'SELECT nombre FROM clientes WHERE id = $1',
      [f.cliente_id]
    );

    res.json({
      cliente: cliente.rows[0]?.nombre,
      propiedades: props.rows,
      creado_en: f.creado_en
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo ficha' });
  }
});

module.exports = router;
