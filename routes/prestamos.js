const express = require('express');
const router = express.Router();
const db = require('../../server/src/DB/mysql'); // Ajusta esta ruta si es necesario

// Solicitar préstamo
router.post('/solicitar', async (req, res) => {
    const { documento, codigoBarras } = req.body;

    try {
        // Verificar si el usuario está registrado
        const [usuario] = await db.query('SELECT id FROM usuarios WHERE documento = ?', [documento]);
        if (usuario.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar si el libro está disponible
        const [libro] = await db.query('SELECT id, ejemplares FROM Libros WHERE codigoBarras = ?', [codigoBarras]);
        if (libro.length === 0) {
            return res.status(404).json({ error: 'Libro no encontrado' });
        }
        if (libro[0].ejemplares < 1) {
            return res.status(400).json({ error: 'No hay ejemplares disponibles' });
        }

        // Crear el préstamo con la fecha actual
        await db.query(
            'INSERT INTO prestamos (idUsuario, idLibro, estado, fechaPrestamo) VALUES (?, ?, "solicitado", CURRENT_TIMESTAMP)',
            [usuario[0].id, libro[0].id]
        );
        
        // Reducir la cantidad de ejemplares disponibles
        await db.query('UPDATE Libros SET ejemplares = ejemplares - 1 WHERE id = ?', [libro[0].id]);

        res.json({ message: 'Préstamo solicitado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al solicitar préstamo' });
    }
});

// Devolver libro
router.put('/devolver', async (req, res) => {
    const { documento, codigoBarras } = req.body;

    try {
        // Obtener el usuario y el libro
        const [usuario] = await db.query('SELECT id FROM Usuarios WHERE documento = ?', [documento]);
        const [libro] = await db.query('SELECT id FROM Libros WHERE codigoBarras = ?', [codigoBarras]);

        if (usuario.length === 0 || libro.length === 0) {
            return res.status(404).json({ error: 'Usuario o libro no encontrado' });
        }

        // Actualizar el préstamo a "devuelto" y registrar la fecha de devolución
        const [result] = await db.query(
            'UPDATE Prestamos SET estado = "devuelto", fecha_devolucion = CURRENT_TIMESTAMP WHERE idUsuario = ? AND idLibro = ? AND estado = "aprobado"',
            [usuario[0].id, libro[0].id]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Préstamo no encontrado o ya devuelto' });
        }

        // Incrementar la cantidad de ejemplares disponibles
        await db.query('UPDATE Libros SET cantidad = cantidad + 1 WHERE id = ?', [libro[0].id]);

        res.json({ message: 'Devolución registrada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar la devolución' });
    }
});

module.exports = router;
