// src/modules/academies/stores/academy.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AcademyService } from '../services/academy.service'
import type { Academy, AcademyResponse } from '../types'

export const useAcademyStore = defineStore('academy', () => {
  const academies = ref<Academy[]>([])
  const meta = ref<AcademyResponse['meta']>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 📦 Obtener academias paginadas
  const fetchAcademies = async (page = 1, limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const response = await AcademyService.getAll(page, limit)
      academies.value = response.data
      meta.value = response.meta
    } catch (err: any) {
      error.value = err.message || 'Error al obtener academias'
    } finally {
      loading.value = false
    }
  }

  // 📄 Obtener academia por ID
  const getAcademyById = async (id: number) => {
    loading.value = true
    try {
      return await AcademyService.getById(id)
    } catch (err: any) {
      error.value = err.message || 'Error al obtener academia'
    } finally {
      loading.value = false
    }
  }

  // 🆕 Crear academia
  const createAcademy = async (payload: { name: string; userId: number }) => {
    await AcademyService.create(payload)
    await fetchAcademies(meta.value.page, meta.value.limit)
  }

  // ✏️ Actualizar academia
  const updateAcademy = async (id: number, payload: { name?: string; userId?: number }) => {
    await AcademyService.update(id, payload)
    await fetchAcademies(meta.value.page, meta.value.limit)
  }

  // 🗑️ Eliminar academia
  const deleteAcademy = async (id: number) => {
    await AcademyService.delete(id)
    await fetchAcademies(meta.value.page, meta.value.limit)
  }

  return {
    academies,
    meta,
    loading,
    error,
    fetchAcademies,
    getAcademyById,
    createAcademy,
    updateAcademy,
    deleteAcademy,
  }
})