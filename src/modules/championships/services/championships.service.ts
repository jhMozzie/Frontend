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
    const { data } = await api.post("/championships", payload)
    return data
  },

  // ✏️ Actualizar campeonato
  async update(id: number, payload: UpdateChampionshipDto) {
    const { data } = await api.put(`/championships/${id}`, payload)
    return data
  },

  // ❌ Eliminar campeonato
  async delete(id: number) {
    const { data } = await api.delete(`/championships/${id}`)
    return data
  },
}