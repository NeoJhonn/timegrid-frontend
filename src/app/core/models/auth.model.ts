export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface JwtClaims {
  sub: string;
  userId: string;
  role: UserRole;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

export type UserRole = 'ADMIN' | 'MANAGER';

