import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'johndoe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    example: 2,
    description: 'Role ID, e.g., 1 for admin, 2 for user',
  })
  @Exclude()
  @IsOptional()
  role_id: number;

  @ApiProperty({ example: 'strongPassword123', minLength: 6, maxLength: 46 })
  @IsString()
  @IsNotEmpty()
  @Length(6, 46)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'johndoe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'strongPassword123', minLength: 6, maxLength: 46 })
  @IsString()
  @IsNotEmpty()
  @Length(6, 46)
  password: string;
}
