"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const argon2 = require("argon2");
const fs = require("fs");
const net = require("net");
const path = require("path");
const sqlite3 = require('sqlite3');
const { Client } = require('pg');
function envOrDefault(key, fallback) {
    return process.env[key]?.trim() || fallback;
}
function getCredentials() {
    return [
        {
            email: envOrDefault('SEED_ADMIN_EMAIL', 'admin@ECOA.app'),
            password: envOrDefault('SEED_ADMIN_PASSWORD', 'ECOAAdmin2026Seguro'),
        },
        {
            email: envOrDefault('SEED_SUPER_ADMIN_EMAIL', 'superadmin@ECOA.app'),
            password: envOrDefault('SEED_SUPER_ADMIN_PASSWORD', 'ECOAAdmin2026Seguro'),
        },
        {
            email: envOrDefault('SEED_CONTRACTOR_EMAIL', 'contractor@ECOA.app'),
            password: envOrDefault('SEED_CONTRACTOR_PASSWORD', 'ECOAContratante2026'),
        },
        {
            email: envOrDefault('SEED_SUPER_CONTRACTOR_EMAIL', 'supercontractor@ECOA.app'),
            password: envOrDefault('SEED_SUPER_CONTRACTOR_PASSWORD', 'ECOAContratante2026'),
        },
    ];
}
function probeConnection(host, port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(2000);
        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        socket.on('error', () => resolve(false));
        socket.connect(port, host);
    });
}
async function updateSqlite(credentials) {
    const databasePath = path.resolve(process.cwd(), 'database.sqlite');
    if (!fs.existsSync(databasePath)) {
        throw new Error(`SQLite database not found: ${databasePath}`);
    }
    const db = new sqlite3.Database(databasePath);
    try {
        for (const credential of credentials) {
            const hash = await argon2.hash(credential.password);
            await new Promise((resolve, reject) => {
                db.run('UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE email = ?', [hash, credential.email], function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (this.changes === 0) {
                        console.warn(`Usuario seed nao encontrado: ${credential.email}`);
                    }
                    else {
                        console.log(`Senha atualizada: ${credential.email}`);
                    }
                    resolve();
                });
            });
        }
    }
    finally {
        db.close();
    }
}
async function updatePostgres(credentials) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'ECOA',
        ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    });
    await client.connect();
    try {
        for (const credential of credentials) {
            const hash = await argon2.hash(credential.password);
            const result = await client.query('UPDATE users SET password = $1, "updatedAt" = NOW() WHERE email = $2', [hash, credential.email]);
            if (result.rowCount === 0) {
                console.warn(`Usuario seed nao encontrado: ${credential.email}`);
            }
            else {
                console.log(`Senha atualizada: ${credential.email}`);
            }
        }
    }
    finally {
        await client.end();
    }
}
async function bootstrap() {
    const credentials = getCredentials();
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
    const postgresOnline = await probeConnection(dbHost, dbPort);
    if (process.env.DATABASE_URL || postgresOnline) {
        await updatePostgres(credentials);
        return;
    }
    await updateSqlite(credentials);
}
bootstrap().catch((err) => {
    console.error('Erro ao atualizar senhas seedadas:', err);
    process.exit(1);
});
//# sourceMappingURL=reset-seed-passwords.js.map