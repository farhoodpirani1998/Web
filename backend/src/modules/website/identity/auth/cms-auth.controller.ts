import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CmsAuthService, LoginResult } from './cms-auth.service';
import { CmsRefreshTokenService } from './cms-refresh-token.service';
import { LoginDto } from './dto/login.dto';
import { CmsAuthGuard } from './cms-auth.guard';
import { CurrentAdmin } from './current-admin.decorator';
import { CmsRequestUser } from './cms-jwt-payload.interface';
import { CMS_LOGIN_THROTTLE, CMS_REFRESH_THROTTLE } from './cms-auth-rate-limit.constants';
import {
  readRefreshCookie,
  refreshCookieName,
  refreshCookieOptions,
  refreshTokenTtlMs,
} from './cms-refresh-cookie.util';
import { ConfigService } from '@nestjs/config';

/**
 * CMS Admin's own login surface — entirely separate from any SMS-facing
 * route. Deliberately not under `WebsiteAuthGuard`/`RequireWebsitePermission`
 * (those govern SMS-identified callers); every route here is either
 * unauthenticated (login, refresh) or gated by `CmsAuthGuard` (me).
 *
 * Sprint — Persistent Login: `refresh` and `logout` are new; `login`
 * now also issues a refresh token, delivered as an httpOnly cookie
 * (never in the JSON body — see `setRefreshCookie`) rather than a field
 * the frontend would have to handle and could accidentally end up
 * somewhere JS-readable. Route handlers that touch the cookie take
 * `@Res({ passthrough: true })`, not a bare `@Res()` — passthrough
 * keeps Nest's normal return-value-as-response-body behavior, so these
 * handlers can still just `return` a value like every other route here
 * instead of calling `res.json()` themselves.
 */
@Controller('admin/auth')
export class CmsAuthController {
  constructor(
    private readonly cmsAuth: CmsAuthService,
    private readonly refreshTokens: CmsRefreshTokenService,
    private readonly config: ConfigService,
  ) {}

  // 200, not 201: this isn't creating a resource, it's exchanging
  // credentials for a token — matches how the SMS side of this
  // codebase treats auth as a verb, not a REST resource.
  //
  // @Throttle is applied here only, not on the controller — see
  // CMS_LOGIN_THROTTLE's doc comment (Sprint 2.3B hardening). Every
  // other route on this controller keeps using the app-wide default
  // throttler untouched (except `refresh`, which has its own).
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle(CMS_LOGIN_THROTTLE)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.cmsAuth.login(dto);
    const refreshToken = await this.refreshTokens.issue(result.admin.id, refreshTokenTtlMs(this.config));
    this.setRefreshCookie(res, refreshToken.rawToken);
    return result;
  }

  @Get('me')
  @UseGuards(CmsAuthGuard)
  me(@CurrentAdmin() user: CmsRequestUser) {
    return this.cmsAuth.getCurrentAdmin(user.id);
  }

  /**
   * Exchanges the refresh-token cookie for a new access token, rotating
   * the refresh token in the same call (see
   * `CmsRefreshTokenService.rotate`). Deliberately not behind
   * `CmsAuthGuard`: the whole point of this route is to be callable
   * once the access token has already expired. Rejects with a generic
   * 401 for every failure mode (missing cookie, unknown/expired/revoked
   * token) — same "don't let the caller distinguish why" reasoning as
   * `CmsAuthService.login`.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle(CMS_REFRESH_THROTTLE)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const presentedToken = readRefreshCookie(req, this.config);
    if (!presentedToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const rotated = await this.refreshTokens.rotate(presentedToken, refreshTokenTtlMs(this.config));
    if (!rotated) {
      this.clearRefreshCookie(res);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    let result: LoginResult;
    try {
      result = await this.cmsAuth.issueAccessTokenForAdminId(rotated.adminId);
    } catch (err) {
      // Admin was deactivated since the refresh token was issued — the
      // new token was already persisted by `rotate`, so revoke it too
      // rather than leaving a valid-but-unusable row behind.
      await this.refreshTokens.revoke(rotated.issued.rawToken);
      this.clearRefreshCookie(res);
      throw err;
    }

    this.setRefreshCookie(res, rotated.issued.rawToken);
    return result;
  }

  /**
   * Revokes the current session's refresh token and clears its cookie.
   * No `CmsAuthGuard` here either: an admin whose access token has
   * already expired must still be able to log out (and should — that's
   * exactly the case where only the refresh token is doing any work).
   * A missing/already-invalid cookie is treated as "already logged
   * out", not an error — `revoke` itself is a no-op in that case.
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const presentedToken = readRefreshCookie(req, this.config);
    if (presentedToken) {
      await this.refreshTokens.revoke(presentedToken);
    }
    this.clearRefreshCookie(res);
  }

  private setRefreshCookie(res: Response, rawToken: string): void {
    res.cookie(
      refreshCookieName(this.config),
      rawToken,
      refreshCookieOptions(this.config, refreshTokenTtlMs(this.config)),
    );
  }

  /** `maxAge: 0` — the standard way to tell a browser to drop a cookie immediately; same attributes as when it was set, or some browsers won't match it. */
  private clearRefreshCookie(res: Response): void {
    res.cookie(refreshCookieName(this.config), '', refreshCookieOptions(this.config, 0));
  }
}
