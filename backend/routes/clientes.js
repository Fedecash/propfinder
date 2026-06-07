const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM clientes ORDER BY creado_en DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo clientes' });
  }
});

// Crear cliente nuevo
router.post('/', async (req, res) => {
  try {
    const {
      nombre, telefono, tipo_busqueda,
      presupuesto_max, zonas, tipos_propiedad,
      ambientes_min, m2_min
    } = req.body;

    const result = await db.query(
      `INSERT INTO clientes 
        (nombre, telefono, tipo_busqueda, presupuesto_max, 
         zonas, tipos_propiedad, ambientes_min, m2_min)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [nombre, telefono, tipo_busqueda, presupuesto_max,
       zonas, tipos_propiedad, ambientes_min, m2_min]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando cliente' });
  }
});

// Obtener matches de un cliente
router.get('/:id/matches', async (req, res) => {
  try {
    const cliente = await db.query(
      'SELECT * FROM clientes WHERE id = $1',
      [req.params.id]
    );

    if (cliente.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const c = cliente.rows[0];
    const result = await db.query(
      `SELECT * FROM propiedades 
       WHERE activa = true
       AND ($1::text[] IS NULL OR zona ILIKE ANY(
         SELECT '%' || unnest($1::text[]) || '%'
       ))
       AND ($2::numeric IS NULL OR precio <= $2)
       AND ($3::text IS NULL OR tipo_oportunidad = $3)
       ORDER BY descuento_porcentaje DESC`,
      [c.zonas, c.presupuesto_max, c.tipo_busqueda]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo matches' });
  }
});

module.exports = router;