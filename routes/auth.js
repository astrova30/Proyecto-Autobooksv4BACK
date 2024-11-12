const express = require('express');
const router = express.Router();
const { registrarUsuario, iniciarSesion, obtenerPerfil } = require('../src/modulos/clientes/controladorClientes');

// Imprimir las funciones para verificación en el arranque del servidor
console.log("Funciones importadas desde controladorClientes:", { registrarUsuario, iniciarSesion, obtenerPerfil });

// Ruta para registrar usuarios
router.post('/register', (req, res) => {
    console.log("Solicitud de registro recibida en /api/auth/registro con datos:", req.body);
    console.log("Datos recibidos en el backend:", req.body);

    registrarUsuario(req, res);
});

// Ruta para iniciar sesión
router.post('/login', (req, res) => {
    console.log("Solicitud de inicio de sesión recibida en /api/auth/login con datos:", req.body);
    iniciarSesion(req, res);
});

// Ruta para obtener perfil
router.get('/api/perfil/:id', (req, res, next) => {
    console.log("Ruta /api/perfil/:id accedida con id:", req.params.id);
    next();
}, obtenerPerfil);

module.exports = router;
