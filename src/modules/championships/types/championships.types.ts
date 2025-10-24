// src/modules/championships/types/championships.types.ts

// ✅ Entidad principal
export interface Championship {
  id: number
  name: string
  startDate: string // O Date si prefieres convertirlo en el store/componente
  location: string
  district: string
  province: string
  country: string
  description: string // 👈 AÑADIDO
  image: string
  status: string
  academy: string
}

// ✅ DTOs para Crear
export interface CreateChampionshipDto {
  name: string
  startDate: string
  location: string
  district?: string // Mantenemos opcional como en el backend
  province?: string // Mantenemos opcional
  country?: string  // Mantenemos opcional
  description?: string // 👈 AÑADIDO (opcional al crear)
  image?: string
  status: string
  academyId: number
}

// ✅ DTOs para Actualizar
// Partial hace que todos los campos sean opcionales
export interface UpdateChampionshipDto extends Partial<CreateChampionshipDto> {
    description?: string; // 👈 Asegurarse que esté aquí también (aunque Partial ya lo haría opcional)
}

// ✅ Respuesta paginada del backend (Sin cambios, ya usa Championship[])
export interface ChampionshipResponse {
  data: Championship[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}