const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;

app.listen(PORT, () => {
    console.log('Servidor corriendo en el puerto', PORT);
});