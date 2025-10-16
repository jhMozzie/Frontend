// ✅ Tipos base del backend
export interface Student {
  id: number
  firstname: string
  lastname: string
  birthdate: string
  beltId: number
  academyId: number
  userId: number

  // Relaciones opcionales con sus IDs incluidos 👇
  belt?: {
    id: number
    name: string
    kyuLevel: number
  }

  academy?: {
    id: number
    name: string
  }

  user?: {
    id: number
    username: string
    email: string
  }
}

// ✅ DTOs para crear y actualizar
export interface CreateStudentDto {
  firstname: string
  lastname: string
  birthdate: string
  beltId: number | string
  academyId: number | string
  userId?: number
}

export interface UpdateStudentDto extends Partial<CreateStudentDto> {}

// ✅ Respuesta paginada del backend
export interface StudentResponse {
  data: Student[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// ✅ Tipos auxiliares (para los selects)
export interface Belt {
  id: number
  name: string
  kyuLevel: number
}

export interface Academy {
  id: number
  name: string
}