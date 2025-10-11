<template>
  <div class="flex-1 space-y-6 p-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Usuarios</h1>
        <p class="text-gray-500 mt-1">Gestiona los usuarios del sistema y sus permisos</p>
      </div>
      <button
        @click="isDialogOpen = true"
        class="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
      >
        <LucidePlus class="h-4 w-4" />
        Nuevo Usuario
      </button>
    </div>

    <!-- ✅ Cards estadísticas -->
    <div class="grid gap-4 md:grid-cols-4">
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <LucideUsers class="h-5 w-5 text-red-500" />
          <span class="text-sm font-medium text-gray-600">Total Usuarios</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">{{ users.length }}</p>
          <p class="text-xs text-gray-500">Registrados en el sistema</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <LucideUserCheck class="h-5 w-5 text-green-500" />
          <span class="text-sm font-medium text-gray-600">Usuarios Activos</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">
            {{ users.filter(u => u.status === 'Activo').length }}
          </p>
          <p class="text-xs text-gray-500">Con acceso al sistema</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <LucideShield class="h-5 w-5 text-rose-400" />
          <span class="text-sm font-medium text-gray-600">Administradores</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">
            {{ users.filter(u => u.role?.description === 'Administrador').length }}
          </p>
          <p class="text-xs text-gray-500">Con permisos completos</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <LucideDumbbell class="h-5 w-5 text-sky-400" />
          <span class="text-sm font-medium text-gray-600">Entrenadores</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">
            {{ users.filter(u => u.role?.description === 'Entrenador').length }}
          </p>
          <p class="text-xs text-gray-500">Activos en entrenamiento</p>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 class="font-semibold text-gray-800 text-lg">Lista de Usuarios</h2>
          <p class="text-sm text-gray-500">{{ filteredUsers.length }} usuario(s) encontrado(s)</p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Buscador -->
          <div class="relative">
            <LucideSearch class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              v-model="searchTerm"
              placeholder="Buscar usuarios..."
              class="pl-8 w-[300px] border border-gray-300 rounded-md h-10 text-sm px-3 focus:ring-2 focus:ring-rose-400 outline-none"
            />
          </div>

          <!-- Filtro simple -->
          <select
            v-model="filters.role"
            class="border border-gray-300 rounded-md h-10 px-2 text-sm"
          >
            <option value="all">Todos los roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Entrenador">Entrenador</option>
            <option value="Estudiante">Estudiante</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="p-6 text-gray-500 text-center">Cargando usuarios...</div>
      <div v-else-if="error" class="p-6 text-red-500 text-center">{{ error }}</div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Usuario</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Rol</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Teléfono</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
              <th class="px-4 py-3 text-right font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="usuario in filteredUsers" :key="usuario.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-800">{{ usuario.username }}</td>
              <td class="px-4 py-3">{{ usuario.email }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 transform hover:scale-105"
                  :class="getRoleColor(usuario.role?.description)"
                >
                  <component :is="getRoleIcon(usuario.role?.description)" class="h-3.5 w-3.5" />
                  {{ usuario.role?.description || 'Sin rol' }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-600">{{ usuario.phone || '—' }}</td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-1 rounded-md text-xs font-semibold"
                  :class="usuario.status === 'Activo'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-600'"
                >
                  {{ usuario.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <button class="p-1 hover:text-blue-500"><LucideEye class="h-4 w-4" /></button>
                  <button class="p-1 hover:text-yellow-500"><LucideEdit class="h-4 w-4" /></button>
                  <button class="p-1 hover:text-rose-500"><LucideTrash2 class="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import {
  LucidePlus,
  LucideSearch,
  LucideUser,
  LucideUserCog,         // 🧑‍🏫 Nuevo ícono de entrenador
  LucideEye,
  LucideEdit,
  LucideTrash2,
  LucideShield,
  LucideUsers,
  LucideUserCheck,
  LucideGraduationCap,
} from "lucide-vue-next"
import { useUserStore } from "../stores/user.store"
import { storeToRefs } from "pinia"

// 🧩 Store de usuarios (Pinia)
const userStore = useUserStore()
const { users, loading, error } = storeToRefs(userStore)

// 🎯 Filtros y búsqueda
const searchTerm = ref("")
const filters = ref({ role: "all" })
const isDialogOpen = ref(false)

// 🎨 Íconos por rol (actualizado)
const rolIcons: Record<string, any> = {
  Administrador: LucideShield,
  Entrenador: LucideUserCog, // 👤 Entrenador ahora con ícono de persona técnica
  Estudiante: LucideGraduationCap,
}

// 🎨 Colores cálidos y suaves
const rolColors: Record<string, string> = {
  Administrador: "bg-rose-100 text-rose-700 border border-rose-200",
  Entrenador: "bg-sky-100 text-sky-700 border border-sky-200",
  Estudiante: "bg-emerald-100 text-emerald-700 border border-emerald-200",
}

// 🧠 Helpers seguros
const getRoleIcon = (roleDesc?: string) => rolIcons[roleDesc ?? ""] || LucideUser
const getRoleColor = (roleDesc?: string) => rolColors[roleDesc ?? ""] || "bg-gray-100 text-gray-600"

// 🔍 Computed para filtros
const filteredUsers = computed(() => {
  const term = searchTerm.value.toLowerCase().trim()
  return users.value.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.role?.description || "").toLowerCase().includes(term)
    const matchesRole =
      filters.value.role === "all" || u.role?.description === filters.value.role
    return matchesSearch && matchesRole
  })
})

// 🚀 Carga inicial
onMounted(() => {
  userStore.fetchUsers()
})
</script>