import { assertSameOrigin, readJson } from '@/server/request';
import { requestPasswordReset } from '@/server/reset';
import { failure, success } from '@/server/response';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try { assertSameOrigin(request); const result = await requestPasswordReset(request, await readJson(request)); return success(null, result.message); }
  catch (error) { return failure(error); }
}
