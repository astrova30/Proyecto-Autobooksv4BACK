const db = require('../../DB/mysql'); // Asegúrate de que esta ruta sea correcta
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Para manejar tokens JWT

const query = (db.query).bind(db); // Convertir las consultas de callback a Promesas

// Función para registrar un usuario
const registrarUsuario = async (req, res) => {
    const { nombre, apellido,documento, correo, telefono, rol, contraseña } = req.body;

    // Validar que todos los campos están completos
    if ([nombre, apellido, documento, correo, telefono, contraseña].some(field => !field || field.trim() === "")) {
        console.log("Error: Alguno de los campos obligatorios está vacío o no definido.");
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }
    
    // Validación de seguridad de la contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(contraseña)) {
        return res.status(400).json({
            mensaje: 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y un carácter especial.'
        });
    }

    try {
        // Verificar si el correo o el documento ya existen en la base de datos
        const [existingUser] = await db.query(
            'SELECT * FROM usuarios WHERE correo = ? OR documento = ?', 
            [correo, documento]
        );
        
        if (existingUser.length > 0) {
            return res.status(400).json({
                mensaje: 'El correo o el número de documento ya están registrados.'
            });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Insertar nuevo usuario en la base de datos
        const [result] = await db.query(
            `INSERT INTO usuarios (nombre, documento, correo, telefono, rol, contraseña) 
            VALUES (?, ?, ?, ?, ?, ?)`, 
            [nombre, documento, correo, telefono, rol, hashedPassword]
        );

        // Obtener el ID del usuario insertado
        const usuarioId = result.insertId;

        console.log("Datos para el perfil:", {
            idUsuario: usuarioId,
            nombre,
            telefono,
            fotoPerfil: ''
        });

        // Crear el perfil automáticamente asociado al usuario recién creado
        await db.query(
            `INSERT INTO perfiles (idUsuario, nombre, telefono, fotoPerfil) 
            VALUES (?, ?, ?, ?)`, 
            [usuarioId, nombre, telefono, ''] // fotoPerfil puede ser un valor vacío o predeterminado
        );

        res.status(201).json({ mensaje: 'Usuario y perfil registrados exitosamente', usuarioId });
    } catch (err) {
        console.error('Error registrando usuario:', err);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};
// Función para iniciar sesión
const iniciarSesion = async (req, res) => {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
        console.error('Falta correo o contraseña en la solicitud');
        return res.status(400).json({ mensaje: 'Correo y contraseña son requeridos' });
    }
    console.log('Datos recibidos en el backend:', req.body);

    try {
        const result = await query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        console.log('Resultado de la consulta:', result);

        if (result.length === 0 || result[0].length === 0) {
            console.error('Usuario no encontrado con el correo proporcionado');
            return res.status(401).json({ mensaje: 'Usuario no encontrado' });
        }

        const user = result[0][0];  // Accede al primer objeto dentro del primer array
        console.log('Usuario encontrado en la base de datos:', user);

        if (!user['contraseña']) {
            console.error('Error: la propiedad `contraseña` del usuario no está definida.');
            return res.status(500).json({ mensaje: 'Error en el servidor: contraseña no definida.' });
        }

        const hashedPassword = user['contraseña'];
        console.log('Contraseña encriptada recuperada de la base de datos:', hashedPassword);

        const isMatch = await bcrypt.compare(contraseña, hashedPassword);
        console.log('Resultado de la comparación de contraseñas:', isMatch);

        if (!isMatch) {
            console.error('Contraseña incorrecta');
            return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: user.idUsuario }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Token JWT generado:', token);

        res.status(200).json({ mensaje: 'Inicio de sesión exitoso', token, usuario: user });
    } catch (err) {
        console.error('Error durante el inicio de sesión:', err);
        return res.status(500).json({ mensaje: 'Error en el servidor', error: err.message });
    }
};

const obtenerPerfil = async (req, res) => {
    const { id } = req.params;

    try {
        const perfil = await query('SELECT * FROM perfiles WHERE idUsuario = ?', [id]);

        if (perfil.length === 0) {
            return res.status(404).json({ mensaje: 'Perfil no encontrado' });
        }

        res.status(200).json(perfil[0]);
    } catch (err) {
        console.error('Error obteniendo el perfil:', err);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extrae el token del encabezado Authorization
    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ mensaje: 'Token no válido' });
        }
        req.userId = decoded.id; // Almacena el ID del usuario en la solicitud para uso posterior
        next();
    });
};



module.exports = { verifyToken ,registrarUsuario, iniciarSesion, obtenerPerfil };
