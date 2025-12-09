import { api } from "@/services/api"
import type {
  ChampionshipResponse,
  Championship,
  CreateChampionshipDto,
  UpdateChampionshipDto,
} from "../types/championships.types"

export const championshipService = {
  // 📋 Obtener lista paginada
  async getAll(page = 1, limit = 10) {
    const { data } = await api.get<ChampionshipResponse>(
      `/championships/paginated?page=${page}&limit=${limit}`,
    )
    return data
  },

  // 🔍 Obtener un campeonato por ID
  async getById(id: number): Promise<Championship> {
    const { data } = await api.get<Championship>(`/championships/${id}`)
    return data
  },

  // 🆕 Crear campeonato
  async create(payload: CreateChampionshipDto) {
    // Si se proporciona un archivo, enviamos multipart/form-data
    if (payload && (payload as any).image && (payload as any).image instanceof File) {
      const form = new FormData()
      // Agregar todos los campos del payload al FormData
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return
        // Si es File, lo agregamos directamente
        if (value instanceof File) {
          form.append(key, value)
        } else if (typeof value === 'object') {
          // Para objetos/arrays, enviar JSON
          form.append(key, JSON.stringify(value))
        } else {
          // Para otros tipos (números, booleans), los convertimos a string
          form.append(key, String(value))
        }
      })

      // IMPORTANTE: el axios instance tiene por defecto Content-Type: application/json.
      // Si dejamos la llamada sin sobrescribir, ese header inválido permanecerá y
      // causará que el servidor no reconozca el multipart. Pasamos `undefined` para
      // que el navegador/axios establezcan correctamente el header con el boundary.
      const { data } = await api.post("/championships", form, {
        headers: { 'Content-Type': undefined as unknown as string },
      })
      return data
    }

    const { data } = await api.post("/championships", payload)
    return data
  },

  // ✏️ Actualizar campeonato
  async update(id: number, payload: UpdateChampionshipDto) {
    if (payload && (payload as any).image && (payload as any).image instanceof File) {
      const form = new FormData()
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return
        if (value instanceof File) {
          form.append(key, value)
        } else if (typeof value === 'object') {
          form.append(key, JSON.stringify(value))
        } else {
          form.append(key, String(value))
        }
      })

      const { data } = await api.put(`/championships/${id}`, form, {
        headers: { 'Content-Type': undefined as unknown as string },
      })
      return data
    }

    const { data } = await api.put(`/championships/${id}`, payload)
    return data
  },

  // ❌ Eliminar campeonato
  async delete(id: number) {
    const { data } = await api.delete(`/championships/${id}`)
    return data
  },
}