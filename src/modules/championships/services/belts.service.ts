import { api } from '@/services/api'
import type { Belt } from '../types/belts.types'

export const beltsService = {
  async getAll(): Promise<Belt[]> {
    const response = await api.get<Belt[]>('/belts')
    return response.data
  },
}
