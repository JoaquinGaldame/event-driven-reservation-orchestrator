export type TokenPayload = {
  sub: string;
  email: string;
  roles: string[];
};

export interface TokenService {
  sign(payload: TokenPayload): Promise<{
    accessToken: string;
    expiresInSeconds: number;
  }>;
}