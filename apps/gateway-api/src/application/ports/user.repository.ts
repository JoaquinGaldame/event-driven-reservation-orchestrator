export type UserAuthRecord = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  roles: string[];
  isActive: boolean;
};

export interface UserRepository {
  findByEmail(email: string): Promise<UserAuthRecord | null>;
}