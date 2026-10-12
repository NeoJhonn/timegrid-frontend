import { UserRole } from './auth.model';

export interface UserRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserUpdateRequest {
  username: string;
  email: string;
  role: UserRole;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}
