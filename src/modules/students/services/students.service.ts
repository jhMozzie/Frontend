// src/modules/students/services/students.service.ts
import { api } from "@/services/api"
import type {
  StudentResponse,
  Student,
  CreateStudentDto,
  UpdateStudentDto,
  Belt,
  Academy,
} from "../types/students.types"

export const studentService = {
  // 📋 Obtener lista paginada de estudiantes
  async getAll(page = 1, limit = 10, academyId?: number) {
    const { data } = await api.get<StudentResponse>(
      `/students?page=${page}&limit=${limit}${
        academyId ? `&academyId=${academyId}` : ""
      }`
    )
    return data
  },

  // 🧍 Obtener estudiante por ID
  async getById(id: number): Promise<Student> {
    const { data } = await api.get<Student>(`/students/${id}`)
    return data
  },

  // 🧾 Crear estudiante
  async create(payload: CreateStudentDto) {
    const { data } = await api.post("/students", payload)
    return data
  },

  // ✏️ Actualizar estudiante
  async update(id: number, payload: UpdateStudentDto) {
    const { data } = await api.put(`/students/${id}`, payload)
    return data
  },

  // ❌ Eliminar estudiante
  async delete(id: number) {
    const { data } = await api.delete(`/students/${id}`)
    return data
  },

  // 🥋 Obtener cinturones
  async getBelts(): Promise<Belt[]> {
    const { data } = await api.get<Belt[]>("/belts")
    return data
  },

  // 🏫 Obtener academias
  async getAcademies(): Promise<Academy[]> {
    const { data } = await api.get<Academy[]>("/academies")
    return data
  },
}