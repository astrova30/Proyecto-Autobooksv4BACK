const express = require('express');
const router = express.Router();
const connection = require('../../db');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); // Para generar el token JWT

const query = (connection.query).bind(connection); // Convertir a Promesas

// Ruta de registro
router.post('/register', async (req, res) => {
    const { nombre, apellido, tipo_documento, documento, correo, telefono, contraseña } = req.body;

    // Verificar que todos los campos requeridos estén presentes
    if (!nombre || !apellido || !tipo_documento || !documento || !correo || !telefono || !contraseña) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        // Verificar duplicados
        const existingUser = await query('SELECT * FROM usuarios WHERE documento = ? OR correo = ?', [documento, correo]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Documento o correo ya registrado.' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Insertar nuevo usuario
        const sql = `INSERT INTO usuarios (nombre, apellido, tipo_documento, documento, correo, telefono, contraseña, rol) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, 'usuario')`;
        await query(sql, [nombre, apellido, tipo_documento, documento, correo, telefono, hashedPassword]);

        res.status(200).json({ mensaje: 'Usuario registrado exitosamente.' });
    } catch (error) {
        console.error('Error inesperado en el registro:', error);
        res.status(500).json({ error: 'Error inesperado en el registro.' });
    }
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
    const { correo, contraseña } = req.body;

    try {
        // Verificar si el usuario existe
        const results = await query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        if (results.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        const user = results[0];

        // Comparar la contraseña
        const match = await bcrypt.compare(contraseña, user.contraseña);
        if (!match) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }
        console.log('Correo recibido:', correo);
        console.log('Contraseña recibida:', contraseña);

        // Generar un token JWT
        const token = jwt.sign({ id: user.idUsuario }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Enviar el token y un mensaje de éxito
        res.status(200).json({ token, mensaje: 'Inicio de sesión exitoso' });
    } catch (error) {
        console.error('Error en la autenticación:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;
