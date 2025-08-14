import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
export class ResponseRegisterDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @Type(() => Number)
  id: number;

  @ApiProperty({ example: 'johndoe@example.com' })
  @Expose()
  @Type(() => String)
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @Expose()
  @Type(() => String)
  full_name: string;

  @ApiProperty({ example: 2 })
  @Expose()
  @Type(() => Number)
  role_id: number;

  @ApiProperty({
    example: '0001-01-01T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @Expose()
  @Type(() => Date)
  created_at: Date;

  @ApiProperty({
    example: '0001-01-01T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @Expose()
  @Type(() => Date)
  updated_at: Date;
}

export class ResponseGetUsersDto {
  id: number;

  @ApiProperty({ example: 'johndoe@example.com' })
  @Expose()
  @Type(() => String)
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @Expose()
  @Type(() => String)
  full_name: string;

  @ApiProperty({ example: 2 })
  @Expose()
  @Transform(
    ({ obj }: { obj: { role?: { name?: string } } }) => obj.role?.name ?? null,
  )
  role: string;
}
