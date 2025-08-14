export interface Auth {
  id?: number;
  username?: string;
  fullname?: string;
  email: string;
  role?: string;
  password: string;
  access_token?: string;
  refresh_token?: string;
}

export interface TokenPayload {
  sub: number;
  username: string;
  full_name: string;
  role: string;
  iat?: number;
  exp?: number;
  jti: string;
  type?: string;
}
