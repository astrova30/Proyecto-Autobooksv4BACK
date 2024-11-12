// server/src/prestamos/rutas.js
const express = require('express');
const router = express.Router();
const PrestamoController = require('./controlador');

router.post('/solicitar', PrestamoController.solicitarPrestamo);

module.exports = router;