import { Exclude } from 'class-transformer';
import { IsString, Length } from 'class-validator';
import { BaseUserDto } from './base-user.dto';

export class CreateUserDto extends BaseUserDto {
  @IsString()
  @Length(6, 46)
  password: string;

  @Exclude()
  role_id: number;
}
