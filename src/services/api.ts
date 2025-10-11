import axios from "axios"

export const api = axios.create({
  baseURL: "http://localhost:3000/api", // cambia si tu backend usa otro puerto
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