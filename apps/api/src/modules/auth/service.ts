import { eq, and, isNotNull } from "drizzle-orm";
import { status } from "elysia";
import { db } from "../../db";
import { users } from "../../db/schema/template";
import type { LoginEmailBody, LoginPinBody, AuthUser } from "./model";

export class AuthService {
  static async hashSecret(secret: string): Promise<string> {
    return await Bun.password.hash(secret, {
      algorithm: "argon2id",
      memoryCost: 65536,
      timeCost: 2,
    });
  }

  static async verifySecret(secret: string, hash: string): Promise<boolean> {
    try {
      return await Bun.password.verify(secret, hash);
    } catch {
      return false;
    }
  }

  static sanitizeUser(user: typeof users.$inferSelect): AuthUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    };
  }

  static async loginWithEmail(data: LoginEmailBody) {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, data.email), eq(users.isActive, true)))
      .limit(1);

    if (!user) {
      return status(401, { message: "Email atau password salah" });
    }

    const isPasswordValid = await this.verifySecret(
      data.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return status(401, { message: "Email atau password salah" });
    }

    return {
      user: this.sanitizeUser(user),
    };
  }

  static async loginWithPin(data: LoginPinBody) {
    const conditions = [isNotNull(users.pin), eq(users.isActive, true)];
    if (data.storeId) {
      conditions.push(eq(users.storeId, data.storeId));
    }

    const activeUsers = await db
      .select()
      .from(users)
      .where(and(...conditions));

    let authenticatedUser: typeof users.$inferSelect | null = null;

    for (const candidate of activeUsers) {
      if (candidate.pin) {
        const isPinValid = await this.verifySecret(data.pin, candidate.pin);
        if (isPinValid) {
          authenticatedUser = candidate;
          break;
        }
      }
    }

    if (!authenticatedUser) {
      return status(401, { message: "PIN kasir tidak valid" });
    }

    return {
      user: this.sanitizeUser(authenticatedUser),
    };
  }

  static async getMe(userId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), eq(users.isActive, true)))
      .limit(1);

    if (!user) {
      return status(401, { message: "Sesi tidak valid atau pengguna tidak ditemukan" });
    }

    return {
      user: this.sanitizeUser(user),
    };
  }
}
