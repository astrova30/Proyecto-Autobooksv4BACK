const express = require('express');
const router = express.Router();
const db = require('../DB/mysql');

// Registrar préstamo
router.post('/prestamo', (req, res) => {
  const { usuarioId, libroId, fechaPrestamo, fechaDevolucion } = req.body;
  const query = 'INSERT INTO prestamos (usuarioId, libroId, fechaPrestamo, fechaDevolucion) VALUES (?, ?, ?, ?)';
  db.query(query, [usuarioId, libroId, fechaPrestamo, fechaDevolucion], (err, result) => {
    if (err) {
      res.status(500).send({ error: 'Error al registrar préstamo' });
    } else {
      res.status(200).send({ message: 'Préstamo registrado con éxito' });
    }
  });
});

// Registrar devolución
router.post('/devolucion', (req, res) => {
  const { prestamoId } = req.body;
  const query = 'DELETE FROM prestamos WHERE id = ?';
  db.query(query, [prestamoId], (err, result) => {
    if (err) {
      res.status(500).send({ error: 'Error al registrar devolución' });
    } else {
      res.status(200).send({ message: 'Devolución registrada con éxito' });
    }
  });
});

module.exports = router;
