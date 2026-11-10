import { RowDataPacket } from 'mysql2/promise';
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';
import { database } from './db';
import { ApiError } from './errors';
import { decryptSecret, encryptSecret } from './secrets';

export interface IntegrationSettings {
  manual_enabled: boolean; manual_instructions: string; upi_id: string; bank_account_name: string; bank_account_number: string; bank_ifsc: string;
  razorpay_enabled: boolean; razorpay_key_id: string; razorpay_key_secret: string; razorpay_webhook_secret: string;
  smtp_enabled: boolean; smtp_host: string; smtp_port: number; smtp_secure: boolean; smtp_username: string; smtp_password: string; smtp_from_email: string; smtp_from_name: string;
}
const defaults: IntegrationSettings = {
  manual_enabled: true, manual_instructions: 'Please contact Inner Revealing at innerrevealing@gmail.com or +91 9836147999 for payment instructions. After paying, submit your payment reference for verification.',
  upi_id: '', bank_account_name: '', bank_account_number: '', bank_ifsc: '',
  razorpay_enabled: false, razorpay_key_id: '', razorpay_key_secret: '', razorpay_webhook_secret: '',
  smtp_enabled: false, smtp_host: '', smtp_port: 587, smtp_secure: false, smtp_username: '', smtp_password: '', smtp_from_email: '', smtp_from_name: 'Inner Revealing',
};
const secretKeys = ['razorpay_key_secret', 'razorpay_webhook_secret', 'smtp_password'] as const;
async function stored(): Promise<IntegrationSettings> {
  const [rows] = await database().execute<RowDataPacket[]>("SELECT setting_value FROM ir_settings WHERE setting_key='integrations' LIMIT 1");
  const value = rows[0]?.setting_value;
  return { ...defaults, ...(value ? (typeof value === 'string' ? JSON.parse(value) : value) : {}) };
}
export async function integrationSecrets(): Promise<IntegrationSettings> {
  const value = await stored();
  for (const field of secretKeys) value[field] = decryptSecret(value[field]);
  return value;
}
export async function getIntegrationSettings() {
  const value = await stored();
  return { ...value, razorpay_key_secret: '', razorpay_webhook_secret: '', smtp_password: '',
    razorpay_key_secret_set: Boolean(value.razorpay_key_secret), razorpay_webhook_secret_set: Boolean(value.razorpay_webhook_secret), smtp_password_set: Boolean(value.smtp_password) };
}
export async function requireSuperadmin(actorId: number) {
  const [rows] = await database().execute<RowDataPacket[]>('SELECT id FROM ir_users WHERE id=? AND is_active=1 AND role=?', [actorId, 'superadmin']);
  if (!rows[0]) throw new ApiError(403, 'Only the superadmin can manage integrations.');
}
export async function saveIntegrationSettings(input: Record<string, unknown>, actorId: number) {
  await requireSuperadmin(actorId);
  const value = await stored();
  for (const field of ['manual_enabled', 'razorpay_enabled', 'smtp_enabled', 'smtp_secure'] as const) {
    if (input[field] !== undefined) {
      if (typeof input[field] !== 'boolean') throw new ApiError(422, `Invalid ${field}.`);
      value[field] = input[field] as boolean;
    }
  }
  for (const field of ['manual_instructions', 'upi_id', 'bank_account_name', 'bank_account_number', 'bank_ifsc', 'razorpay_key_id', 'smtp_host', 'smtp_username', 'smtp_from_email', 'smtp_from_name'] as const) {
    if (input[field] !== undefined) {
      if (typeof input[field] !== 'string' || (input[field] as string).length > (field === 'manual_instructions' ? 3000 : 255) || /[\u0000\r\n]/.test(input[field] as string) && field !== 'manual_instructions') throw new ApiError(422, `Invalid ${field}.`);
      value[field] = (input[field] as string).trim();
    }
  }
  if (input.smtp_port !== undefined) {
    const port = Number(input.smtp_port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new ApiError(422, 'Enter a valid SMTP port.');
    value.smtp_port = port;
  }
  for (const field of secretKeys) {
    if (input[field] !== undefined && input[field] !== '') {
      if (typeof input[field] !== 'string' || (input[field] as string).length > 2048 || /[\r\n\u0000]/.test(input[field] as string)) throw new ApiError(422, `Invalid ${field}.`);
      value[field] = encryptSecret(input[field] as string);
    }
    if (input[`clear_${field}`] === true) value[field] = '';
  }
  if (value.razorpay_enabled && (!/^rzp_(?:test|live)_\w+$/.test(value.razorpay_key_id) || !value.razorpay_key_secret)) throw new ApiError(422, 'Add a Razorpay key ID and secret before enabling online payments.');
  if (value.smtp_enabled && (!value.smtp_host || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.smtp_from_email))) throw new ApiError(422, 'Add an SMTP host and valid sender email before enabling email.');
  await database().execute("INSERT INTO ir_settings(setting_key,setting_value) VALUES ('integrations',?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)", [JSON.stringify(value)]);
  await database().execute('INSERT INTO ir_audit_log(actor_id,action,entity_type,entity_id,details) VALUES (?,?,?,?,?)', [actorId, 'integrations.update', 'settings', 'integrations', JSON.stringify({ fields: Object.keys(input).filter(k => !secretKeys.some(s => k.includes(s))) })]);
  return getIntegrationSettings();
}
export function smtpTransport(settings: IntegrationSettings) {
  return nodemailer.createTransport({ host: settings.smtp_host, port: settings.smtp_port, secure: settings.smtp_secure,
    requireTLS: !settings.smtp_secure, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
    ...(settings.smtp_username ? { auth: { user: settings.smtp_username, pass: settings.smtp_password } } : {}), tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true } });
}
export function razorpayClient(settings: IntegrationSettings) {
  if (!settings.razorpay_enabled || !settings.razorpay_key_id || !settings.razorpay_key_secret) throw new ApiError(503, 'Online payments are not configured. Choose the manual payment option.');
  return new Razorpay({ key_id: settings.razorpay_key_id, key_secret: settings.razorpay_key_secret });
}
export async function testIntegration(service: string, actorId: number) {
  await requireSuperadmin(actorId);
  const value = await integrationSecrets();
  try {
    if (service === 'smtp') {
      if (!value.smtp_enabled) throw new ApiError(422, 'Enable and save SMTP settings first.');
      const transport = smtpTransport(value);
      try { await transport.verify(); } finally { transport.close(); }
      return { ok: true, message: 'SMTP connection verified. No email was sent.' };
    }
    if (service === 'razorpay') {
      await razorpayClient(value).orders.all({ count: 1 });
      return { ok: true, message: 'Razorpay credentials verified. No payment was created.' };
    }
    throw new ApiError(422, 'Choose SMTP or Razorpay.');
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(422, 'The connection could not be verified. Check the saved credentials and server settings.');
  }
}
export async function publicPaymentConfig() {
  const value = await stored();
  return { methods: [...(value.manual_enabled ? ['manual'] : []), ...(value.razorpay_enabled && value.razorpay_key_id && value.razorpay_key_secret ? ['razorpay'] : [])],
    manual_instructions: value.manual_instructions, upi_id: value.upi_id, bank_account_name: value.bank_account_name, bank_account_number: value.bank_account_number, bank_ifsc: value.bank_ifsc,
    razorpay_key_id: value.razorpay_enabled ? value.razorpay_key_id : '' };
}
