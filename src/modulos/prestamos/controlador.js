// server/src/prestamos/controlador.js
const Prestamo = require('./modeloPrestamo');
const Notificacion = require('../notificaciones/modeloNotificacion');
const Libro = require('../libros/libros');

async function solicitarPrestamo(req, res) {
    const { userId, bookId } = req.body;

    try {
        // Verificar disponibilidad del libro
        const libro = await Libro.findOne({ where: { idLibro: bookId } });
        if (!libro || libro.ejemplares <= 0) {
            return res.status(400).json({ success: false, message: 'Libro no disponible' });
        }

        // Crear solicitud de préstamo
        const prestamo = await Prestamo.create({
            idUsuario: userId,
            idLibro: bookId,
            fechaEstimadaDevolucion: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 días después de hoy
        });

        // Enviar notificación a bibliotecarios
        const mensaje = `El usuario con ID ${userId} solicitó el préstamo del libro con ID ${bookId}.`;
        await Notificacion.create({ idUsuario: userId, mensaje });

        // Reducir la cantidad de ejemplares del libro
        await Libro.update(
            { ejemplares: libro.ejemplares - 1 },
            { where: { idLibro: bookId } }
        );

        res.json({ success: true, message: 'Solicitud de préstamo enviada' });
    } catch (error) {
        console.error('Error al solicitar préstamo:', error);
        res.status(500).json({ success: false, message: 'Error al solicitar préstamo' });
    }
}

module.exports = {
    solicitarPrestamo,
};
