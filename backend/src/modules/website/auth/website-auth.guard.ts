import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';

export interface SmsJwtPayload {
  sub: string; // SMS user id — this is the identity we trust
  email?: string;
  name?: string;
  iss: string;
  exp: number;
}

/**
 * Verifies the JWT's SIGNATURE against SMS's public key only.
 * Deliberately does NOT read roles/permissions out of the SMS token —
 * this backend has its own authorization model (WebsiteRoleAssignment).
 * There is no shared secret, no shared database, and no call back into
 * SMS on the request path: verification is entirely local using the
 * public key configured via SMS_JWT_PUBLIC_KEY_PATH.
 */
@Injectable()
export class WebsiteAuthGuard implements CanActivate {
  private readonly publicKey: string;
  private readonly expectedIssuer: string;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    const keyPath = this.config.getOrThrow<string>('SMS_JWT_PUBLIC_KEY_PATH');
    this.publicKey = readFileSync(keyPath, 'utf8');
    this.expectedIssuer = this.config.getOrThrow<string>('SMS_JWT_ISSUER');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = authHeader.slice('Bearer '.length);

    let payload: SmsJwtPayload;
    try {
      payload = await this.jwt.verifyAsync<SmsJwtPayload>(token, {
        publicKey: this.publicKey,
        algorithms: ['RS256'],
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (payload.iss !== this.expectedIssuer) {
      throw new UnauthorizedException('Unexpected token issuer');
    }

    request.user = { externalUserId: payload.sub, email: payload.email, name: payload.name };
    return true;
  }
}
