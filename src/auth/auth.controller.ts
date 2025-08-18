import {
  Body,
  ConflictException,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { SerializationInterceptor } from 'src/core/interceptors/serialization.interceptor';
import { CurrentUser } from './decorators/current-user.decorator';
import { RegisterDto, LoginDto } from './dto/req-auth.dto';
import {
  ResponseRegisterDto,
  ResponseLoginDto,
  ResponseRefreshTokenDto,
} from './dto/resp-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { TokenPayload } from './types/auth';
import { IAuthService } from './auth.interface';

@Controller('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);
  constructor(
    @Inject('IAuthService') private readonly authService: IAuthService,
  ) {}

  @UseInterceptors(new SerializationInterceptor(ResponseRegisterDto))
  @Post('register')
  @ApiOkResponse({
    description: 'Successful registration',
    type: ResponseRegisterDto,
  })
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({
    type: RegisterDto,
    description: 'Json structure for user registration',
  })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ResponseRegisterDto> {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      this.logger.error('Registration failed', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = (error.meta?.target as string[])[0];

          throw new ConflictException(
            `A user already exists with this ${field}.`,
          );
        }

        this.logger.error('Unhandled Prisma error', error.code, error.meta);
      }
      throw new InternalServerErrorException('something wrong on our side');
    }
  }

  @UseInterceptors(new SerializationInterceptor(ResponseLoginDto))
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOkResponse({
    description: 'Successful login',
    type: ResponseLoginDto,
  })
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiBody({
    type: LoginDto,
    description: 'Json structure for user login',
  })
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      this.logger.error('Login failed', error);
    }
  }

  @UseInterceptors(new SerializationInterceptor(ResponseRefreshTokenDto))
  @UseGuards(JwtRefreshGuard)
  @Put('refresh-token')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async getFullPayload(@CurrentUser() user: TokenPayload) {
    try {
      return await this.authService.refreshToken(user);
    } catch (error) {
      this.logger.error('create refresh token failed', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('refresh token is invalid.');
        }
      }
      throw new InternalServerErrorException('something wrong on our side');
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('logout')
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'Successful logout' })
  @ApiOperation({ summary: 'Log out the currently authenticated user' })
  async revokeToken(@CurrentUser() user: TokenPayload) {
    try {
      const { jti } = user;
      return await this.authService.revokeToken(jti);
    } catch (error) {
      this.logger.error('logout failed', error);
      throw new InternalServerErrorException('something wrong on our side');
    }
  }
}
