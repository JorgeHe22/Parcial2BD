const { Pool } = require('pg');

const pool = new Pool({
    host: 'aws-0-us-east-1.pooler.supabase.com',
    port: 5432,
    user: 'postgres.vqbruznrftmztfikjlcm',
    password: 'Nqp43L6MwgSKur1j',
    database: 'postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect((error) => {
    if (error) {
        console.log('Error conectando con la base de datos', error);
        return;
    } else {
        console.log('Conectado a la base de datos PostgreSQL');
    }
});

module.exports = pool;