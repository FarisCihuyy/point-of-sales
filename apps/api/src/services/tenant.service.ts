import type { Tenant } from "../middleware/tenant";

export async function resolveTenant(tenantId: string): Promise<Tenant | null> {
  // TODO:
  // Query tenant dari database menggunakan Drizzle + Turso.

  return {
    id: tenantId,
    slug: tenantId,
  };
}
