import type { LoginUserCommand } from "../commands/login-user.command.js";
import type { LoginResultDto } from "../dto/login-result.dto.js";
import type { UserRepository } from "../ports/user.repository.js";
import type { PasswordHasher } from "../ports/password-hasher.js";
import type { TokenService } from "../ports/token.service.js";
import { ApplicationError } from "../errors/application.error.js";

export class LoginUserHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginResultDto> {
    const user = await this.userRepository.findByEmail(
      command.email.toLowerCase().trim(),
    );

    if (!user || !user.isActive) {
      throw new ApplicationError("Invalid credentials", "INVALID_CREDENTIALS", 401);
    }

    const passwordMatches = await this.passwordHasher.compare(
      command.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new ApplicationError("Invalid credentials", "INVALID_CREDENTIALS", 401);
    }

    const token = await this.tokenService.sign({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });

    return {
      accessToken: token.accessToken,
      expiresInSeconds: token.expiresInSeconds,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    };
  }
}