const argon2 = require('argon2');
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST || 'postgres',
  port: 5432,
  user: process.env.DB_USERNAME || 'ecoa_user',
  password: process.env.DB_PASSWORD || 'ecoa_password',
  database: process.env.DB_NAME || 'ecoa_db',
});

const candidates = [
  'VERDEVIAAdmin2026Seguro',
  'EcoaAdmin2026Seguro',
  'VerdeviaAdmin2026Seguro',
  'VERDEVIAAdmin2026',
  'password123',
];

const email = 'superadmin@verdevia.app';

client.connect()
  .then(async () => {
    const res = await client.query('SELECT email, password FROM users WHERE email = $1', [email]);
    if (!res.rows.length) {
      console.log('USER NOT FOUND IN DB');
      await client.end();
      return;
    }
    const hash = res.rows[0].password;
    console.log('Found user:', res.rows[0].email);
    console.log('Hash prefix:', hash.substring(0, 40));
    for (const pwd of candidates) {
      const ok = await argon2.verify(hash, pwd);
      console.log((ok ? '[VALID]  ' : '[INVALID]'), pwd);
    }
    await client.end();
  })
  .catch((e) => {
    console.error('ERROR:', e.message);
    process.exit(1);
  });
