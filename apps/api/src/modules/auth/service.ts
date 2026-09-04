import { eq, and } from "drizzle-orm";
import { status } from "elysia";
import { db } from "../../db";
import { users } from "../../db/schema/template";
import type { LoginEmailBody, LoginPinBody } from "./model";

export class AuthService {
  static async loginWithEmail(data: LoginEmailBody) {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, data.email), eq(users.isActive, true)))
      .limit(1);

    if (!user) {
      return status(401, { message: "Email atau password salah" });
    }

    const isPasswordValid = Bun.password.verifySync(
      data.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return status(401, { message: "Email atau password salah" });
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
      },
      token: "session_token_placeholder",
    };
  }

  static async loginWithPin(data: LoginPinBody) {
    const conditions = [eq(users.pin, data.pin), eq(users.isActive, true)];
    if (data.storeId) {
      conditions.push(eq(users.storeId, data.storeId));
    }

    const [user] = await db
      .select()
      .from(users)
      .where(and(...conditions))
      .limit(1);

    if (!user) {
      return status(401, { message: "PIN kasir tidak valid" });
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
      },
      token: "pin_session_token_placeholder",
    };
  }
}
