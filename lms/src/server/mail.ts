import { integrationSecrets, smtpTransport } from './integrations';
import { ApiError } from './errors';

export async function sendMail(message: { to: string; subject: string; text: string }): Promise<boolean> {
  const settings = await integrationSecrets();
  if (!settings.smtp_enabled) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message.to) || /[\r\n]/.test(message.subject)) throw new ApiError(422, 'Invalid email message.');
  const transport = smtpTransport(settings);
  try {
    await transport.sendMail({ from: { name: settings.smtp_from_name, address: settings.smtp_from_email }, to: message.to, subject: message.subject, text: message.text });
    return true;
  } catch { throw new ApiError(503, 'Email could not be delivered. Please contact the centre.'); }
  finally { transport.close(); }
}
