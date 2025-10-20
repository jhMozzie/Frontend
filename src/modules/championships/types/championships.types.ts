// ✅ Entidad principal
export interface Championship {
  id: number
  name: string
  startDate: string
  location: string
  district: string
  province: string
  country: string
  image: string
  status: string
  academy: string // ⚠️ ya viene como texto, no relación
}

// ✅ DTOs
export interface CreateChampionshipDto {
  name: string
  startDate: string
  location: string
  district: string
  province: string
  country: string
  image?: string
  status: string
  academyId: number
}

export interface UpdateChampionshipDto extends Partial<CreateChampionshipDto> {}

// ✅ Respuesta paginada del backend
export interface ChampionshipResponse {
  data: Championship[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}