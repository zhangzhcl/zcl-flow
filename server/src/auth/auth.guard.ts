import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService, JwtPayload } from './auth.service';

/** Marks a route as reachable without a token (login endpoint). */
export const PUBLIC_KEY = 'sf:public';
export const Public = () => SetMetadata(PUBLIC_KEY, true);

/** Restricts a route to administrators. */
export const ADMIN_KEY = 'sf:admin';
export const AdminOnly = () => SetMetadata(ADMIN_KEY, true);

/** Injects the authenticated user payload into a handler parameter. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload =>
    context.switchToHttp().getRequest().user,
);

/**
 * Reads the JWT from the `Authorization: Bearer` header, falling back to the
 * `access_token` query parameter. The fallback exists because the browser
 * `EventSource` API used by the SSE progress stream cannot send headers.
 */
function extractToken(request: any): string | null {
  const header: string = request?.headers?.authorization ?? '';
  const [scheme, headerToken] = header.split(' ');
  if (scheme === 'Bearer' && headerToken) return headerToken;

  const queryToken = request?.query?.access_token;
  return typeof queryToken === 'string' && queryToken ? queryToken : null;
}

/**
 * Global guard: validates the bearer token, loads the account state and
 * enforces the admin-only metadata.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const payload = await this.auth.verifyToken(token);
    const user = await this.auth.findById(payload.sub);
    if (!user || !user.enabled) {
      throw new UnauthorizedException('Account is disabled or removed');
    }
    // Always trust the persisted role over the token claim.
    request.user = { sub: user.id, username: user.username, role: user.role };

    const adminOnly = this.reflector.getAllAndOverride<boolean>(ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (adminOnly && user.role !== 'admin') {
      throw new ForbiddenException('Administrator privileges required');
    }
    return true;
  }
}
