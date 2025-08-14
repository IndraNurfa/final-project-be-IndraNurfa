import { IsString, Length } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @Length(6, 46)
  password: string;

  @IsString()
  oldPassword: string;
}
