import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

import { tenantMiddleware } from "./middleware/tenant";
import { healthRoute } from "./routes/health";
import { storesRoute } from "./routes/stores";
import { usersRoute } from "./routes/users";
import { categoriesRoute } from "./routes/categories";
import { productsRoute } from "./routes/products";

const app = new Elysia()
  .use(
    cors({
      origin: true,
    }),
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: "POS SaaS Platform API",
          version: "1.0.0",
          description: "API for Multi-Tenant Offline-First Point of Sales System",
        },
      },
    }),
  )
  .use(tenantMiddleware)
  .use(healthRoute)
  .use(storesRoute)
  .use(usersRoute)
  .use(categoriesRoute)
  .use(productsRoute)
  .listen(3001);

console.log(`🦊 API running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
