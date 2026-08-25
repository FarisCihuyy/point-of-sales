import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

import { tenantMiddleware } from "./middleware/tenant";
import { healthRoute } from "./routes/health";

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
          title: "Travel Platform API",
          version: "1.0.0",
          description: "API for the travel platform",
        },
      },
    }),
  )
  .use(tenantMiddleware)
  .use(healthRoute)
  .listen(3001);

console.log(`🦊 API running at ${app.server?.hostname}:${app.server?.port}`);
