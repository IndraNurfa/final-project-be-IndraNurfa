import { Module } from '@nestjs/common';
import { EncryptHelpers } from './utils/encrypt-helpers';
import { JwtHelpers } from './utils/jwt-helpers';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [JwtHelpers, EncryptHelpers, JwtService],
  exports: [JwtHelpers, EncryptHelpers],
})
export class CommonModule {}
