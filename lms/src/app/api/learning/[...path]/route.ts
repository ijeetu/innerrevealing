import { courseOverview, getLesson, getLibrary, getWishlist, positiveId, saveProgress, updateWishlist } from '@/server/learning';
import { ApiError } from '@/server/errors';
import { assertSameOrigin, readJson } from '@/server/request';
import { failure, success } from '@/server/response';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ path: string[] }> };
export async function GET(request: Request, context: Context) {
  try {
    const path = (await context.params).path;
    if (path[0] === 'course' && path.length === 2) return success(await courseOverview(request, path[1]));
    if (path[0] === 'lesson' && path.length === 2) return success(await getLesson(request, positiveId(path[1])));
    if (path[0] === 'library' && path.length === 1) return success(await getLibrary(request));
    if (path[0] === 'wishlist' && path.length === 1) return success(await getWishlist(request));
    throw new ApiError(404, 'This learning resource was not found.');
  } catch (error) { return failure(error); }
}
export async function POST(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const path = (await context.params).path;
    const body = await readJson(request);
    if (path[0] === 'progress' && path.length === 2) return success(await saveProgress(request, positiveId(path[1]), body), 'Progress saved.');
    if (path[0] === 'wishlist' && path.length === 2) {
      if (typeof body.saved !== 'boolean') throw new ApiError(422, 'Choose whether to save the course.');
      return success(await updateWishlist(request, positiveId(path[1]), body.saved));
    }
    throw new ApiError(404, 'This learning action was not found.');
  } catch (error) { return failure(error); }
}
