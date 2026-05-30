export interface PasswordHasher {
  compare(plainPassword: string, passwordHash: string): Promise<boolean>;
}