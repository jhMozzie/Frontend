import { defineStore } from "pinia"
import { ref } from "vue"
import { championshipService } from "../services/championships.service"
import type {
  Championship,
  ChampionshipResponse,
  CreateChampionshipDto,
  UpdateChampionshipDto,
} from "../types/championships.types"

export const useChampionshipStore = defineStore("championships", () => {
  const championships = ref<Championship[]>([])
  const meta = ref<ChampionshipResponse["meta"]>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 📦 Obtener campeonatos paginados
  const fetchChampionships = async (page = 1, limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const response = await championshipService.getAll(page, limit)
      championships.value = response.data
      Object.assign(meta.value, response.meta)
    } catch (err: any) {
      error.value = err.message || "Error al obtener campeonatos"
    } finally {
      loading.value = false
    }
  }

  // 🔍 Obtener campeonato por ID
  const fetchChampionshipById = async (id: number) => {
    try {
      return await championshipService.getById(id)
    } catch (err: any) {
      error.value = err.message || "Error al obtener campeonato"
    }
  }

  // 🆕 Crear campeonato
  const createChampionship = async (payload: CreateChampionshipDto) => {
    await championshipService.create(payload)
    await fetchChampionships(meta.value.page, meta.value.limit)
  }

  // ✏️ Actualizar campeonato
  const updateChampionship = async (id: number, payload: UpdateChampionshipDto) => {
    await championshipService.update(id, payload)
    await fetchChampionships(meta.value.page, meta.value.limit)
  }

  // ❌ Eliminar campeonato
  const deleteChampionship = async (id: number) => {
    await championshipService.delete(id)
    await fetchChampionships(meta.value.page, meta.value.limit)
  }

  return {
    championships,
    meta,
    loading,
    error,
    fetchChampionships,
    fetchChampionshipById,
    createChampionship,
    updateChampionship,
    deleteChampionship,
  }
})