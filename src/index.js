const express = require('express');
const app = express();
const clientesRoutes = require('./modulos/clientes/rutas'); // Importa el archivo de rutas de clientes

app.use(express.json()); // Middleware para manejar JSON

// Rutas para el módulo de clientes
app.use('/clientes', clientesRoutes);

// Puerto y servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
