import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserSession } from '@prisma/client';
import { Cache } from 'cache-manager';
import { randomUUID } from 'crypto';
import { EncryptHelpers } from 'src/common/utils/encrypt-helpers';
import { JwtHelpers } from 'src/common/utils/jwt-helpers';
import { ISessionService } from 'src/session/session.interface';
import { IUsersService } from 'src/users/users.interface';
import { IAuthService } from './auth.interface';
import { LoginDto, RegisterDto } from './dto/req-auth.dto';
import { ResponseRegisterDto } from './dto/resp-auth.dto';
import { TokenPayload } from './types/auth';

@Injectable()
export class AuthService implements IAuthService {
  private readonly jwtSecret: string;
  private readonly access_token_expires: string;
  private readonly refresh_token_expires: string;

  constructor(
    @Inject('IUsersService')
    private readonly usersService: IUsersService,
    @Inject('ISessionService')
    private readonly sessionService: ISessionService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly jwtHelpers: JwtHelpers,
    private readonly encryptHelpers: EncryptHelpers,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') || 'JWT_SECRET';
    this.access_token_expires =
      this.configService.get<string>('ACCESS_TOKEN_EXP') || '15m';
    this.refresh_token_expires =
      this.configService.get<string>('REFRESH_TOKEN_EXP') || '7d';
  }

  async register(dto: RegisterDto): Promise<ResponseRegisterDto> {
    const hash = await this.encryptHelpers.hashPassword(dto.password);

    dto.password = hash;
    dto.role_id = 0;

    const data = await this.usersService.create(dto);

    return data;
  }

  async login(dto: LoginDto): Promise<any> {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (!existingUser) {
      throw new NotFoundException('email not found');
    }

    const plaintextPassword = dto.password;
    const hashFromDb = existingUser.password;

    const isPasswordMatching = await this.encryptHelpers.comparePassword(
      plaintextPassword,
      hashFromDb,
    );

    if (!isPasswordMatching) {
      throw new BadRequestException('username or password is invalid.');
    }

    const uuid = randomUUID();

    const [access_token, refresh_token] = await Promise.all([
      this.jwtHelpers.generate(
        existingUser.id,
        existingUser.full_name,
        existingUser.role.name,
        this.access_token_expires,
        uuid,
        'access_token',
      ),
      this.jwtHelpers.generate(
        existingUser.id,
        existingUser.full_name,
        existingUser.role.name,
        this.refresh_token_expires,
        uuid,
        'refresh_token',
      ),
    ]);

    const hash_token = this.encryptHelpers.hashToken(access_token);
    const hash_refresh_token = this.encryptHelpers.hashToken(refresh_token);

    await this.cacheManager.set<string>(
      `auth:token:${uuid}`,
      hash_token,
      15 * 60 * 1000,
    );

    await this.sessionService.create({
      user_id: existingUser.id,
      jti: uuid,
      token: hash_token,
      refresh_token: hash_refresh_token,
      token_expired: new Date(Date.now() + 15 * 60 * 1000),
      refresh_token_expired: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      ...existingUser,
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }

  async refreshToken(data: TokenPayload): Promise<string> {
    const { sub, full_name, role, jti } = data;

    await this.cacheManager.del(`auth:token:${jti}`);

    const access_token = await this.jwtHelpers.generate(
      sub,
      full_name,
      role,
      this.access_token_expires,
      jti,
      'access_token',
    );

    const hashToken = this.encryptHelpers.hashToken(access_token);

    const updateSession = await this.sessionService.updateToken(jti, hashToken);

    if (!updateSession) {
      throw new InternalServerErrorException('Failed to update access token');
    }

    await this.cacheManager.set<string>(
      `auth:token:${jti}`,
      hashToken,
      15 * 60 * 1000,
    );

    return access_token;
  }

  async revokeToken(jti: string): Promise<UserSession> {
    await this.cacheManager.del(`auth:token:${jti}`);
    return await this.sessionService.revokeToken(jti);
  }
}
