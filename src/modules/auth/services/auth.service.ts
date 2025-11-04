import { api } from "@/services/api"

import type { LoginPayload, LoginResponse, User } from "../types/auth.types"


export const AuthService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", payload)

    console.log('AuthService - Respuesta completa:', data)

    // Validar estructura de respuesta
    if (!data || !data.user) {
      throw new Error('Respuesta del servidor inválida: falta información del usuario')
    }

    if (!data.user.role) {
      throw new Error('Respuesta del servidor inválida: falta información del rol')
    }

    // Guardar token y datos del usuario
    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))
    
    return data
  },

  logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userRoleId")
    localStorage.removeItem("userId")
    localStorage.removeItem("username")
    localStorage.removeItem("academyId") // 🆕 Limpiar academyId
  },

  getUser(): User | null {
    const stored = localStorage.getItem("user")
    return stored ? JSON.parse(stored) : null
  },
}