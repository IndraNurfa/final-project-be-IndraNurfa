export interface SessionType {
  user_id: number;
  token: string;
  refresh_token: string;
  jti: string;
  token_expired: Date;
  refresh_token_expired: Date;
}
