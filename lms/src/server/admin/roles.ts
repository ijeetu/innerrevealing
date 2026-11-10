import type { UserRole } from '../auth';
import { ApiError } from '../errors';

export function assertUserManagement(actorRole: UserRole, targetRole: UserRole, nextRole: UserRole, targetActive: boolean, nextActive: boolean, activeSuperadmins: number): void {
  if (actorRole !== 'admin' && actorRole !== 'superadmin') throw new ApiError(403, 'Administrator access is required.');
  if (actorRole === 'admin' && (targetRole === 'superadmin' || nextRole === 'superadmin')) throw new ApiError(403, 'Only a super administrator can manage super administrators.');
  if (targetRole === 'superadmin' && targetActive && (nextRole !== 'superadmin' || !nextActive) && activeSuperadmins <= 1) throw new ApiError(409, 'Keep at least one active super administrator.');
}
