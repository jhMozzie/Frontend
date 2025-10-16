// src/modules/students/store/students.store.ts
import { defineStore } from "pinia"
import { ref } from "vue"
import { studentService } from "../services/students.service"
import type {
  Student,
  StudentResponse,
  CreateStudentDto,
  UpdateStudentDto,
} from "../types/students.types"

export const useStudentStore = defineStore("students", () => {
  const students = ref<Student[]>([])
  const meta = ref<StudentResponse["meta"]>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 📦 Obtener estudiantes paginados
  const fetchStudents = async (page = 1, limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const response = await studentService.getAll(page, limit)
      students.value = response.data
      Object.assign(meta.value, response.meta) // mantiene referencia reactiva
    } catch (err: any) {
      error.value = err.message || "Error al obtener estudiantes"
    } finally {
      loading.value = false
    }
  }

  const fetchStudentById = async (id: number) => {
    try {
      return await studentService.getById(id)
    } catch (err: any) {
      error.value = err.message || "Error al obtener estudiante"
    }
  }

  const createStudent = async (payload: CreateStudentDto) => {
    await studentService.create(payload)
    await fetchStudents(meta.value.page, meta.value.limit)
  }

  const updateStudent = async (id: number, payload: UpdateStudentDto) => {
    await studentService.update(id, payload)
    await fetchStudents(meta.value.page, meta.value.limit)
  }

  const deleteStudent = async (id: number) => {
    await studentService.delete(id)
    await fetchStudents(meta.value.page, meta.value.limit)
  }

  return {
    students,
    meta,
    loading,
    error,
    fetchStudents,
    fetchStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
  }
})