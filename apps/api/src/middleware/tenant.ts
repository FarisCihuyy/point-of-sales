import { Elysia } from "elysia";

export type Tenant = {
  id: string;
  slug: string;
};

export const tenantMiddleware = new Elysia({
  name: "tenant-middleware",
}).derive(({ request, set }) => {
  const hostname = new URL(request.url).hostname;

  // Prioritas:
  // 1. X-Tenant-ID header
  // 2. subdomain
  const tenantHeader = request.headers.get("x-tenant-id");

  let tenantId = tenantHeader;

  if (!tenantId) {
    const parts = hostname.split(".");

    // Contoh:
    // tenant1.example.com
    //        ↑
    //      parts[0]
    if (parts.length >= 3) {
      tenantId = parts[0] ?? null;
    }
  }

  if (!tenantId) {
    return {
      tenant: null as Tenant | null,
    };
  }

  return {
    tenant: {
      id: tenantId,
      slug: tenantId,
    } satisfies Tenant,
  };
});
