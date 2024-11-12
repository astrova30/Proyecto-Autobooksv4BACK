const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Asumiendo que tienes una conexión a la base de datos configurada

// Obtener información de un libro por código de barras
router.get('/:codigo_barras', async (req, res) => {
    const { codigo_barras } = req.params;

    try {
        const [libro] = await db.query('SELECT * FROM Libros WHERE codigo_barras = ?', [codigo_barras]);
        if (!libro.length) return res.status(404).json({ error: 'Libro no encontrado' });

        res.json(libro[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener información del libro' });
    }
});

module.exports = router;
