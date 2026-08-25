import { Elysia } from "elysia";

export const healthRoute = new Elysia({
  prefix: "/health",
}).get("/", () => ({
  status: "ok",
  message: "API is healthy",
  timestamp: new Date().toISOString(),
}));
