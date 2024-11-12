// routes/loanRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../src/DB/mysql'); // Asegúrate de que la ruta sea correcta
const { verifyToken } = require('../src/modulos/clientes/controladorClientes'); // Middleware para verificar el token

// Ruta protegida para solicitar préstamo de libro
router.post('/request', verifyToken, async (req, res) => {
    const { bookId } = req.body;
    const userId = req.userId; // Obtenemos el ID del usuario autenticado

    try {
        // Registrar la solicitud en la base de datos
        const [result] = await db.query(
            `INSERT INTO prestamos (idUsuario, idLibro, estado) VALUES (?, ?, 'pendiente')`,
            [userId, bookId]
        );
        res.status(201).json({ mensaje: 'Solicitud de préstamo enviada' });
    } catch (error) {
        console.error('Error al registrar la solicitud de préstamo:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

router.get('/pending', verifyToken, async (req, res) => {
  // Solo los administradores pueden acceder
  if (req.userRole !== 'administrador') {
    return res.status(403).json({ mensaje: 'Acceso denegado' });
  }

  try {
    const [result] = await db.query(
      'SELECT * FROM prestamos WHERE estado = "pendiente"'
    );
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener solicitudes pendientes:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

module.exports = router;
