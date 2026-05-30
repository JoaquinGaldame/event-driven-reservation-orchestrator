import jwt from "jsonwebtoken";
import { config } from "../../config.js";
import type {
  TokenPayload,
  TokenService,
} from "../../application/ports/token.service.js";

export class JwtTokenService implements TokenService {
  async sign(payload: TokenPayload): Promise<{
    accessToken: string;
    expiresInSeconds: number;
  }> {
    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresInSeconds,
      issuer: "gateway-api",
      audience: "reservation-orchestrator",
    });

    return {
      accessToken,
      expiresInSeconds: config.jwtExpiresInSeconds,
    };
  }
}