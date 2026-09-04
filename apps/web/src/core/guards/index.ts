// App-level route guards & permission helpers
import type { UserRole } from "@repo/shared";

export function hasPermission(
  userRole: UserRole,
  allowedRoles: UserRole[]
): boolean {
  return allowedRoles.includes(userRole);
}
