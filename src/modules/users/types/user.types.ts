export interface User {
  id: number;
  email: string;
  username: string;
  phone?: string;
  birthdate?: string;
  status: string;
  roleId: number;
  role?: { id: number; name: string };
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  roleId: number;
  phone?: string;
  birthdate?: string;
  status?: string;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}