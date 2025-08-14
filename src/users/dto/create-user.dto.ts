import { IsOptional, IsString, Length } from 'class-validator';
import { BaseUserDto } from './base-user.dto';

export class CreateUserDto extends BaseUserDto {
  @IsString()
  @Length(6, 46)
  password: string;

  // @IsOptional()
  role_id: number;
}
