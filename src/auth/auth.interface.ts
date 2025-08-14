import { UserSession } from '@prisma/client';
import { LoginDto, RegisterDto } from './dto/req-auth.dto';
import { ResponseLoginDto, ResponseRegisterDto } from './dto/resp-auth.dto';
import { TokenPayload } from './types/auth';

export interface IAuthService {
  register(dto: RegisterDto): Promise<ResponseRegisterDto>;
  login(dto: LoginDto): Promise<ResponseLoginDto | null>;
  refreshToken(data: TokenPayload): Promise<string>;
  revokeToken(jti: string): Promise<UserSession>;
}
