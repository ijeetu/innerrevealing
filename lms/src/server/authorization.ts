import { getSessionUser, SessionUser } from './auth';
import { ApiError } from './errors';

export async function requireUser(request: Request): Promise<SessionUser> {
  const user = await getSessionUser(request);
  if (!user) throw new ApiError(401, 'Please sign in to continue.');
  return user;
}

export async function requireAdmin(request: Request): Promise<SessionUser> {
  const user = await requireUser(request);
  if (user.role !== 'admin' && user.role !== 'superadmin') throw new ApiError(403, 'Administrator access is required.');
  return user;
}

export async function requireSuperadmin(request: Request): Promise<SessionUser> {
  const user = await requireAdmin(request);
  if (user.role !== 'superadmin') throw new ApiError(403, 'Super administrator access is required.');
  return user;
}
