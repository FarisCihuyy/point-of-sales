import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema/template";

export const db = drizzle({
  connection: {
    url: process.env.TURSO_DATABASE_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
  schema,
});

export type DB = typeof db;
