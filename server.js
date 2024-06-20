const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.get('/', (req, res) => {
    res.send('Hola Mundo actalizado!');
});

const PORT = process.env.PORT || 5000	;

app.listen(PORT, () => console.log(`El servidor está corriendo en http://localhost:${PORT}`));
