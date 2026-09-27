import { UserRole } from './auth.model';

export interface UserRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

