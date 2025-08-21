import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EncryptHelpers } from 'src/common/utils/encrypt-helpers';
import { ISessionService } from 'src/session/session.interface';
import { TokenPayload } from '../types/auth';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @Inject('ISessionService')
    private readonly sessionService: ISessionService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly encryptHelpers: EncryptHelpers,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'super-secret-key',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: TokenPayload): Promise<TokenPayload> {
    const authHeader = req.headers['authorization'] as string;
    const token =
      typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined;

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    if (payload.type !== 'access_token') {
      throw new UnauthorizedException('Invalid token type');
    }

    const jti = payload.jti;
    const cacheToken = await this.cacheManager.get<string>(`auth:token:${jti}`);

    const hashToken = this.encryptHelpers.hashToken(token);

    if (cacheToken && cacheToken === hashToken) {
      return {
        sub: payload.sub,
        username: payload.username,
        full_name: payload.full_name,
        role: payload.role,
        jti: payload.jti,
      };
    }

    const session = await this.sessionService.findOne(jti);

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    const accessToken = session.token;

    const isMatch = hashToken === accessToken;

    if (!isMatch) {
      throw new UnauthorizedException('Invalid token');
    }

    await this.cacheManager.set<string>(
      `auth:token:${jti}`,
      accessToken,
      15 * 60 * 1000,
    );

    return {
      sub: payload.sub,
      username: payload.username,
      full_name: payload.full_name,
      role: payload.role,
      jti: payload.jti,
    };
  }
}
