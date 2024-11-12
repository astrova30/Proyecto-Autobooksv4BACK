const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const clientesRoutes = require('./modulos/clientes/rutas'); 
const prestamosRouter = require('../routes/prestamos');
const authRoutes = require('../routes/auth'); // Ajusta la ruta si es necesario
const bodyParser = require('body-parser');
const loanRoutes = require('../routes/loanRoutes'); // Ajusta la ruta según tu estructura de archivos



const envPath = path.resolve(__dirname, '../.env'); // Ajusta según la ubicación de server.js
dotenv.config({ path: envPath });

dotenv.config();
const app = express();
const PORT = 3001;

// Configuración de CORS para permitir acceso desde el frontend
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());


app.use(express.json());


app.use('/api/loan', loanRoutes); 

// Configura las rutas de autenticación y de clientes
console.log("Montando las rutas de autenticación en /api/auth");
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);

console.log('Montando rutas de préstamos en /api/prestamos');
app.use('/api/prestamos', prestamosRouter);


app.use('/api/loan-requests', loanRoutes);
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    

    console.log("DB_USER:", process.env.DB_USER);
    console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
    console.log("DB_NAME:", process.env.DB_NAME);
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

});


