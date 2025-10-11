export interface Role {
  id: number
  description: string // ← coincide con el campo real del backend
}

export interface User {
  id: number
  email: string
  username: string
  phone?: string
  birthdate?: string
  status: string
  roleId: number
  role?: Role // ← usa el tipo definido arriba
}

export interface CreateUserDto {
  email: string
  username: string
  password: string
  roleId: number
  phone?: string
  birthdate?: string
  status?: string
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}