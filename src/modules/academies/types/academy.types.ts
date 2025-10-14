// src/modules/academies/types/academy.types.ts

export interface Academy {
  id: number
  name: string
  instructor: string
  students: number
  contact: {
    phone: string
    email: string
  }
  status: 'Activo' | 'Inactivo'
}

export interface AcademyResponse {
  data: Academy[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateAcademyDto {
  name: string
  userId: number
}

export interface UpdateAcademyDto {
  name?: string
  userId?: number
}