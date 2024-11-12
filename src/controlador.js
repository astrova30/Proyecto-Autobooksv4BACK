// src/controlador.js
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const connection = require('./db'); // Asegúrate de que esté configurada la conexión a la base de datos

// Configuración de Nodemailer para el envío de correos
const transporter = nodemailer.createTransport({
    service: 'outlook', // Cambia por el servicio de correo que prefieras
    auth: {
        user: 'mrboltzmann06@outlook.com', // Cambia por tu correo
        pass: 'Ingeniera120306', // Cambia por tu contraseña o contraseña de aplicación
        
    },
});

// Controlador para registrar usuarios
const registrarUsuario = async (req, res) => {
    const { nombre, apellido, tipo_documento, documento, correo, telefono, contraseña } = req.body;

    try {
        // Verificación de duplicados
        const checkUserSql = 'SELECT * FROM usuarios WHERE documento = ? OR correo = ?';
        connection.query(checkUserSql, [documento, correo], async (err, results) => {
            if (err) {
                console.error('Error al verificar duplicados:', err);
                return res.status(500).send('Error en la verificación de duplicados.');
            }

            if (results.length > 0) {
                return res.status(400).send('Documento o correo ya registrado.');
            }

            // Hashear la contraseña y generar el código de verificación
            const hashedPassword = await bcrypt.hash(contraseña, 10);
            const codigoVerificacion = crypto.randomInt(100000, 999999).toString();

            // SQL para insertar el usuario en la base de datos
            const sql = `INSERT INTO usuarios (nombre, apellido, tipo_documento, documento, correo, telefono, contraseña, codigo_verificacion, verificado, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, 'usuario')`;
            
            connection.query(sql, [nombre, apellido, tipo_documento, documento, correo, telefono, hashedPassword, codigoVerificacion], (err, results) => {
                if (err) {
                    console.error('Error al registrar usuario:', err);
                    return res.status(500).send('Error en el registro.');
                }

                // Enviar el código de verificación por correo electrónico
                const mailOptions = {
                    from: 'lvlozano41@soy.sena.edu.co',
                    to: correo,
                    subject: 'Código de verificación de tu cuenta',
                    text: `Tu código de verificación es: ${codigoVerificacion}`,
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Error al enviar el correo:', error);
                        return res.status(500).send('Error al enviar el correo de verificación.');
                    }
                    console.log('Correo enviado:', info.response);
                    res.status(200).send('Usuario registrado exitosamente. Revisa tu correo para el código de verificación.');
                });
            });
        });
    } catch (error) {
        console.error('Error inesperado en el registro:', error);
        res.status(500).send('Error inesperado en el registro.');
    }
};




const iniciarSesion = async (req, res) => {
    const { correo, contraseña } = req.body;

    try {
        // Buscar al usuario por correo
        const sql = 'SELECT * FROM usuarios WHERE correo = ?';
        connection.query(sql, [correo], async (err, results) => {
            if (err) {
                console.error('Error en la consulta de inicio de sesión:', err);
                return res.status(500).send('Error en el servidor.');
            }

            if (results.length === 0) {
                return res.status(400).send('Correo o contraseña incorrectos.');
            }

            const user = results[0];
            // Comparar la contraseña
            const isMatch = await bcrypt.compare(contraseña, user.contraseña);
            if (!isMatch) {
                return res.status(400).send('Correo o contraseña incorrectos.');
            }

            // Si es necesario, aquí puedes generar un token de sesión o JWT para autenticación
            res.status(200).send('Inicio de sesión exitoso.');
        });
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).send('Error inesperado en el inicio de sesión.');
    }
};

module.exports = { registrarUsuario, iniciarSesion };
