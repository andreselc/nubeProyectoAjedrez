const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/db');
const e = require('express');

dotenv.config();

const app = express();

db.connect((err) => {
    if (err) {
        console.error('Error de conexión:', err.stack);
        process.exit(1);
    }
    console.log('Conectado a la base de datos Postgres');
});

app.get('/', (req, res) => {
    res.send('Hola Mundo actalizado!');
});

const PORT = process.env.PORT || 5000	;

app.listen(PORT, () => console.log(`El servidor está corriendo en http://localhost:${PORT}`));
