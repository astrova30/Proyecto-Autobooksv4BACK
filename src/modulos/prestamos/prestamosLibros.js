const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Solicitar préstamo
router.post('/solicitar', async (req, res) => {
    const { usuarioDocumento, libroCodigo } = req.body;

    try {
        // Verificar si el usuario está registrado
        const [usuario] = await db.query('SELECT id FROM Usuarios WHERE numero_documento = ?', [usuarioDocumento]);
        if (!usuario.length) return res.status(404).json({ error: 'Usuario no encontrado' });

        // Verificar si el libro está disponible
        const [libro] = await db.query('SELECT id, cantidad FROM Libros WHERE codigo_barras = ?', [libroCodigo]);
        if (!libro.length) return res.status(404).json({ error: 'Libro no encontrado' });
        if (libro[0].cantidad < 1) return res.status(400).json({ error: 'No hay ejemplares disponibles' });

        // Crear el préstamo
        await db.query('INSERT INTO Prestamos (usuario_id, libro_id, estado) VALUES (?, ?, "solicitado")', [usuario[0].id, libro[0].id]);
        
        // Reducir cantidad de ejemplares disponibles
        await db.query('UPDATE Libros SET cantidad = cantidad - 1 WHERE id = ?', [libro[0].id]);

        res.json({ message: 'Préstamo solicitado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al solicitar préstamo' });
    }
});

// Devolver libro
router.put('/devolver', async (req, res) => {
    const { usuarioDocumento, libroCodigo } = req.body;

    try {
        // Obtener el usuario y el libro
        const [usuario] = await db.query('SELECT id FROM Usuarios WHERE numero_documento = ?', [usuarioDocumento]);
        const [libro] = await db.query('SELECT id FROM Libros WHERE codigo_barras = ?', [libroCodigo]);

        if (!usuario.length || !libro.length) return res.status(404).json({ error: 'Usuario o libro no encontrado' });

        // Actualizar el préstamo a "devuelto"
        const [prestamo] = await db.query(
            'UPDATE Prestamos SET estado = "devuelto", fecha_devolucion = CURRENT_DATE WHERE usuario_id = ? AND libro_id = ? AND estado = "aprobado"',
            [usuario[0].id, libro[0].id]
        );

        if (prestamo.affectedRows === 0) return res.status(400).json({ error: 'Préstamo no encontrado o ya devuelto' });

        // Incrementar cantidad de ejemplares disponibles
        await db.query('UPDATE Libros SET cantidad = cantidad + 1 WHERE id = ?', [libro[0].id]);

        res.json({ message: 'Devolución registrada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar la devolución' });
    }
});

module.exports = router;
