import bcrypt from "bcryptjs";
import type { PasswordHasher } from "../../application/ports/password-hasher.js";

export class BcryptPasswordHasher implements PasswordHasher {
  async compare(plainPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, passwordHash);
  }
}