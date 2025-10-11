import { api } from "@/services/api"

interface LoginPayload {
  email: string
  password: string
}

export const AuthService = {
  async login(payload: LoginPayload) {
    const { data } = await api.post("/auth/login", payload)

    // Guardar token y datos del usuario
    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))
    return data
  },

  logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },

  getUser() {
    const stored = localStorage.getItem("user")
    return stored ? JSON.parse(stored) : null
  },
}