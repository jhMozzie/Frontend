import axios from "axios"

const BASE_URL = (import.meta.env.VITE_API_URL as string) || "https://backendtes-il2f.onrender.com/api"

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// 🔐 Middleware para token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})