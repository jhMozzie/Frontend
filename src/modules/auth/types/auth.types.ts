
export interface LoginPayload {
  email: string
  password: string
}

// ✅ Estructura actualizada para coincidir con tu backend
export interface User {
  id: number
  email: string
  username: string
  role: string // ← Es un string, no un objeto ("Administrador" o "Entrenador")
  academyId?: number // 🆕 Para entrenadores (opcional)
}

export interface LoginResponse {
  token: string
  user: User
}