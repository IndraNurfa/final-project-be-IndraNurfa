import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtHelpers {
  constructor(private readonly jwtService: JwtService) {}

  async generate(
    id: number,
    full_name: string,
    role: string,
    expires: string,
    uuid: string,
    type: string,
  ): Promise<string> {
    const payload = { sub: id, full_name, role, type };

    const token = this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      jwtid: uuid,
      expiresIn: expires,
    });

    return token;
  }
}
