// src/modules/academies/services/academy.service.ts
import { api } from '@/services/api'
import type { AcademyResponse, CreateAcademyDto, UpdateAcademyDto } from '../types'

export const AcademyService = {
  async getAll(page = 1, limit = 10) {
    const { data } = await api.get<AcademyResponse>(`/academies?page=${page}&limit=${limit}`)
    return data
  },

  async getById(id: number) {
    const { data } = await api.get(`/academies/${id}`)
    return data
  },

  async create(payload: CreateAcademyDto) {
    const { data } = await api.post('/academies', payload)
    return data
  },

  async update(id: number, payload: UpdateAcademyDto) {
    const { data } = await api.put(`/academies/${id}`, payload)
    return data
  },

  async delete(id: number) {
    const { data } = await api.delete(`/academies/${id}`)
    return data
  },
}