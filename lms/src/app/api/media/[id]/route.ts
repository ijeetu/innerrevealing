import { serveMedia } from '@/server/admin/media';
import { idValue } from '@/server/admin/core';
import { failure } from '@/server/response';

export const runtime='nodejs';
export const dynamic='force-dynamic';
type Context={params:Promise<{id:string}>};

export async function GET(request:Request,context:Context) {
  try {return serveMedia(request,idValue((await context.params).id));}
  catch(error){return failure(error);}
}
export const HEAD=GET;
