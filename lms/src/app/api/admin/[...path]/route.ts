import { handleAdmin } from '@/server/admin';

export const runtime='nodejs';
export const dynamic='force-dynamic';
type Context={params:Promise<{path:string[]}>};

async function handler(request:Request,context:Context) {
  return handleAdmin(request,(await context.params).path);
}
export const GET=handler;
export const POST=handler;
export const PUT=handler;
export const PATCH=handler;
export const DELETE=handler;
