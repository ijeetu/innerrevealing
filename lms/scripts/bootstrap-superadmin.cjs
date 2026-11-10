const crypto = require('node:crypto');
const { promisify } = require('node:util');
const mysql = require('mysql2/promise');
require('@next/env').loadEnvConfig(process.cwd());

(async () => {
  const email = (process.env.BOOTSTRAP_EMAIL || '').trim().toLowerCase();
  const name = (process.env.BOOTSTRAP_NAME || '').trim();
  const password = process.env.BOOTSTRAP_PASSWORD || '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !name || name.length > 100 || password.length < 16 || password.length > 128) throw new Error('Set BOOTSTRAP_EMAIL, BOOTSTRAP_NAME and a unique BOOTSTRAP_PASSWORD of 16–128 characters.');
  for (const key of ['DB_NAME','DB_USER','DB_PASSWORD']) if (!process.env[key]) throw new Error(`Missing ${key}`);
  const connection = await mysql.createConnection({ host: process.env.DB_HOST || '127.0.0.1',port: Number(process.env.DB_PORT || 3306),database: process.env.DB_NAME,user: process.env.DB_USER,password: process.env.DB_PASSWORD });
  try {
    await connection.beginTransaction();
    const [existing] = await connection.execute('SELECT id,role,is_active FROM ir_users WHERE email = ? FOR UPDATE', [email]);
    if (existing.length && existing[0].role === 'superadmin' && existing[0].is_active && process.env.BOOTSTRAP_RESET_PASSWORD !== 'true') {
      await connection.commit();
      console.log('An active super administrator with this email already exists. No changes made.');
      return;
    }
    if (existing.length && existing[0].role !== 'superadmin' && process.env.BOOTSTRAP_PROMOTE_EXISTING !== 'true') throw new Error('This email already belongs to another role. Set BOOTSTRAP_PROMOTE_EXISTING=true only when intentionally promoting that existing account.');
    const salt = crypto.randomBytes(32);
    const key = await promisify(crypto.scrypt)(password,salt,64,{ N:32768,r:8,p:1,maxmem:64*1024*1024 });
    const hash = `scrypt$32768$8$1$${salt.toString('hex')}$${key.toString('hex')}`;
    let id;
    if (existing.length) {
      id = existing[0].id;
      await connection.execute("UPDATE ir_users SET name = ?,password_hash = ?,role = 'superadmin',is_active = 1 WHERE id = ?", [name,hash,id]);
      await connection.execute('DELETE FROM ir_sessions WHERE user_id = ?', [id]);
      await connection.execute('DELETE FROM ir_reset_tokens WHERE user_id = ?', [id]);
    } else {
      const [created] = await connection.execute("INSERT INTO ir_users(name,email,password_hash,role,is_active) VALUES(?,?,?,'superadmin',1)", [name,email,hash]);
      id = created.insertId;
    }
    await connection.execute("INSERT INTO ir_audit_log(actor_id,action,entity_type,entity_id,details) VALUES(NULL,'superadmin.bootstrap','user',?,?)", [String(id),JSON.stringify({ source:'explicit-server-cli' })]);
    await connection.commit();
    console.log('Super administrator created or updated. Sign in through the website. No password was printed.');
  } catch (error) { await connection.rollback(); throw error; }
  finally { await connection.end(); }
})().catch(error => { console.error('Bootstrap failed:',error.code || error.message);process.exitCode=1; });
