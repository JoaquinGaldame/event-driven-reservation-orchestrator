export type LoginResultDto = {
  accessToken: string;
  expiresInSeconds: number;
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  };
};