import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

import { tenantMiddleware } from "./middleware/tenant";
import { authController } from "./modules/auth";
import { userController } from "./modules/user";
import { storeController } from "./modules/store";
import { categoryController } from "./modules/category";
import { productController } from "./modules/product";
import { healthController } from "./modules/health";

const app = new Elysia()
  .use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
      ],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "x-tenant-id"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: "POS SaaS Platform API",
          version: "1.0.0",
          description:
            "API for Multi-Tenant Offline-First Point of Sales System",
        },
      },
    }),
  )
  .use(tenantMiddleware)
  .use(healthController)
  .use(authController)
  .use(userController)
  .use(storeController)
  .use(categoryController)
  .use(productController)
  .listen(3001);

console.log(
  `🦊 API running at http://${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
