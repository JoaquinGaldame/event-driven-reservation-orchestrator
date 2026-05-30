import type { FastifyInstance } from "fastify";
import { loginBodySchema } from "../schemas/login.schema.js";
import { LoginUserHandler } from "../../../application/handlers/login-user.handler.js";
import { DrizzleUserRepository } from "../../../infrastructure/db/drizzle-user.repository.js";
import { BcryptPasswordHasher } from "../../../infrastructure/security/bcrypt-password-hasher.js";
import { JwtTokenService } from "../../../infrastructure/security/jwt-token.service.js";

type LoginBody = {
  email: string;
  password: string;
};

export async function authController(server: FastifyInstance) {
  const userRepository = new DrizzleUserRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService();

  const loginUserHandler = new LoginUserHandler(
    userRepository,
    passwordHasher,
    tokenService,
  );

  server.post<{ Body: LoginBody }>(
    "/login",
    {
      schema: {
        body: loginBodySchema,
      },
    },
    async (request, reply) => {
      const result = await loginUserHandler.execute({
        email: request.body.email,
        password: request.body.password,
      });

      return reply.status(200).send(result);
    },
  );
}