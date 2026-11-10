import { database } from '@/server/db';
import { failure, success } from '@/server/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await database().execute('SELECT 1');
    return success({ status: 'ok', database: 'mysql' });
  } catch (error) { return failure(error); }
}
