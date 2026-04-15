export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  userId: number;
  name: string;
  email: string;
  roles: string[];
}

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roles: string[];
}

export interface UpdateUserRolesRequest {
  roles: string[];
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  timestamp: string;
  errors?: string[];
}
