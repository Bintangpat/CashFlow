import { UserRole } from './enums';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  message: string;
}
