// 📁 src/stores/user.store.ts
import { defineStore } from "pinia"
import { ref, reactive } from "vue"
import { userService } from "../services/user.service"
import type { User, CreateUserDto, UpdateUserDto } from "../types/user.types"

export const useUserStore = defineStore("userStore", () => {
  // 🔹 Estado reactivo
  const users = ref<User[]>([])
  const allUsers = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const meta = reactive({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })

  // 🔹 Actions
  const fetchUsers = async (page = 1, limit = 10, role = "all") => {
    loading.value = true
    try {
      const res = await userService.getAll(page, limit, role)
      users.value = res.data
      meta.total = res.meta.total
      meta.page = res.meta.page
      meta.limit = res.meta.limit
      meta.totalPages = res.meta.totalPages
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const fetchAllUsers = async () => {
    try {
      const res = await userService.getAll(1, 9999, "all")
      allUsers.value = res.data
    } catch (err: any) {
      console.error("Error al cargar todos los usuarios:", err)
    }
  }

  const createUser = async (data: CreateUserDto) => {
    try {
      const newUser = await userService.create(data)
      users.value.unshift(newUser)
      meta.total += 1
    } catch (err: any) {
      error.value = err.message
    }
  }

  const updateUser = async (id: number, data: UpdateUserDto) => {
    try {
      const updated = await userService.update(id, data)
      const idx = users.value.findIndex((u) => u.id === id)
      if (idx !== -1) users.value[idx] = updated
    } catch (err: any) {
      error.value = err.message
    }
  }

  const deleteUser = async (id: number) => {
    try {
      await userService.delete(id)
      users.value = users.value.filter((u) => u.id !== id)
      meta.total -= 1
    } catch (err: any) {
      error.value = err.message
    }
  }

  // 🧩 Retorna todo lo necesario
  return {
    users,
    allUsers,
    loading,
    error,
    meta,
    fetchUsers,
    fetchAllUsers,
    createUser,
    updateUser,
    deleteUser,
  }
})