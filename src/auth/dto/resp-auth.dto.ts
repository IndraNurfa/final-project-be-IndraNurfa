// import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

export class ResponseRegisterDto {
  // @ApiProperty({ example: 1 })
  // @Expose()
  // @Type(() => Number)
  // id: number;

  // @ApiProperty({ example: 'johndoe@example.com' })
  @Expose()
  @Type(() => String)
  email: string;

  // @ApiProperty({ example: 'John Doe' })
  @Expose()
  @Type(() => String)
  full_name: string;

  // @ApiProperty({
  //   example: '0001-01-01T00:00:00.000Z',
  //   type: String,
  //   format: 'date-time',
  // })
  @Expose()
  @Type(() => Date)
  created_at: Date;

  // @ApiProperty({
  //   example: '0001-01-01T00:00:00.000Z',
  //   type: String,
  //   format: 'date-time',
  // })
  @Expose()
  @Type(() => Date)
  updated_at: Date;
}

export class ResponseLoginDto {
  // @ApiProperty({ example: 1 })
  // @Expose()
  // @Type(() => Number)
  // id: number;

  // @ApiProperty({ example: 'John Doe' })
  @Expose()
  @Type(() => String)
  full_name: string;

  // @ApiProperty({ example: 'johndoe@example.com' })
  @Expose()
  @Type(() => String)
  email: string;

  @Expose()
  @Transform(({ obj }: { obj: { role?: { name?: string } } }) => obj.role?.name)
  role: string;

  // @ApiProperty({
  //   example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  //   description: 'JWT access token',
  // })
  @Expose()
  @Type(() => String)
  access_token: string;

  // @ApiProperty({
  //   example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  //   description: 'JWT refresh token',
  // })
  @Expose()
  @Type(() => String)
  refresh_token: string;
}

export class ResponseRefreshTokenDto {
  @Expose()
  @Type(() => String)
  access_token: string;
}
