import jwt from "jsonwebtoken";
import { config } from "../../config.js";
import type {
  TokenPayload,
  TokenService,
  VerifiedTokenPayload,
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

  async verify(accessToken: string): Promise<VerifiedTokenPayload> {
    const decoded = jwt.verify(accessToken, config.jwtSecret, {
      issuer: "gateway-api",
      audience: "reservation-orchestrator",
    });

    if (
      typeof decoded !== "object" ||
      typeof decoded.sub !== "string" ||
      typeof decoded.email !== "string" ||
      !Array.isArray(decoded.roles)
    ) {
      throw new Error("Invalid token payload");
    }

    return {
      sub: decoded.sub,
      email: decoded.email,
      roles: decoded.roles.filter((role): role is string => typeof role === "string"),
    };
  }
}