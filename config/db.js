const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const user = process.env.POSTGRES_USER;
const password = process.env.POSTGRES_PASSWORD;
const host = process.env.POSTGRES_HOST || 'db'; 
const port = process.env.POSTGRES_PORT || 5432;
const database = process.env.POSTGRES_DATABASE;

const db = new Client({
    user,
    host,
    database,
    password,
    port
});

module.exports = db;