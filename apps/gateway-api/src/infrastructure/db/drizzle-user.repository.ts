import type {
  UserAuthRecord,
  UserRepository,
} from "../../application/ports/user.repository.js";

export class DrizzleUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<UserAuthRecord | null> {
    // TODO:
    // Reemplazar esto por Drizzle real cuando definas users/backoffice_users.
    //
    // Ejemplo conceptual:
    // const [user] = await db
    //   .select(...)
    //   .from(users)
    //   .where(eq(users.email, email))
    //   .limit(1);

    if (email !== "admin@test.com") {
      return null;
    }

    return {
      id: "user_1",
      email: "admin@test.com",
      name: "Admin User",
      // password: Admin123!
      passwordHash:
        "$2a$10$7EqJtq98hPqEX7fNZaFWoOhiYzdrjzvTShhD6vq2Oe2V0nBRTi3oK",
      roles: ["ADMIN"],
      isActive: true,
    };
  }
}