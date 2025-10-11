<template>
  <div class="flex-1 space-y-6 p-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Usuarios</h1>
        <p class="text-gray-500 mt-1">
          Gestiona los usuarios del sistema y sus permisos
        </p>
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
          <LucideUsers class="h-5 w-5 text-red-600" />
          <span class="text-sm font-medium text-gray-600">Total Usuarios</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">{{ usuarios.length }}</p>
          <p class="text-xs text-gray-500">Registrados en el sistema</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <LucideUserCheck class="h-5 w-5 text-green-600" />
          <span class="text-sm font-medium text-gray-600">Usuarios Activos</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">
            {{ usuarios.filter(u => u.estado === 'Activo').length }}
          </p>
          <p class="text-xs text-gray-500">Con acceso al sistema</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <LucideShield class="h-5 w-5 text-indigo-600" />
          <span class="text-sm font-medium text-gray-600">Administradores</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">
            {{ usuarios.filter(u => u.rol === 'Administrador').length }}
          </p>
          <p class="text-xs text-gray-500">Con permisos completos</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <LucideGraduationCap class="h-5 w-5 text-blue-600" />
          <span class="text-sm font-medium text-gray-600">Instructores</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">
            {{ usuarios.filter(u => u.rol === 'Instructor').length }}
          </p>
          <p class="text-xs text-gray-500">Enseñando actualmente</p>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 class="font-semibold text-gray-800 text-lg">Lista de Usuarios</h2>
          <p class="text-sm text-gray-500">
            {{ filteredUsuarios.length }} usuario(s) encontrado(s)
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Buscador -->
          <div class="relative">
            <LucideSearch class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              v-model="searchTerm"
              placeholder="Buscar usuarios..."
              class="pl-8 w-[300px] border border-gray-300 rounded-md h-10 text-sm px-3 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <!-- Filtro simple -->
          <select
            v-model="filters.rol"
            class="border border-gray-300 rounded-md h-10 px-2 text-sm"
          >
            <option value="all">Todos los roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Instructor">Instructor</option>
            <option value="Coordinador">Coordinador</option>
            <option value="Asistente">Asistente</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Rol</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Academia</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Teléfono</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
              <th class="px-4 py-3 text-right font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="usuario in filteredUsuarios"
              :key="usuario.id"
              class="hover:bg-gray-50"
            >
              <td class="px-4 py-3 font-medium text-gray-800">{{ usuario.nombre }}</td>
              <td class="px-4 py-3">{{ usuario.email }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium"
                  :class="rolColors[usuario.rol] || ''"
                >
                  <component :is="rolIcons[usuario.rol] || LucideUser" class="h-3 w-3" />
                  {{ usuario.rol }}
                </span>
              </td>
              <td class="px-4 py-3">{{ usuario.academia }}</td>
              <td class="px-4 py-3 text-gray-600">{{ usuario.telefono }}</td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-1 rounded-md text-xs font-semibold"
                  :class="usuario.estado === 'Activo'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-600'"
                >
                  {{ usuario.estado }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <button class="p-1 hover:text-blue-600">
                    <LucideEye class="h-4 w-4" />
                  </button>
                  <button class="p-1 hover:text-yellow-600">
                    <LucideEdit class="h-4 w-4" />
                  </button>
                  <button class="p-1 hover:text-red-600">
                    <LucideTrash2 class="h-4 w-4" />
                  </button>
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
import { ref, computed } from "vue"
import {
  LucidePlus,
  LucideSearch,
  LucideUser,
  LucideEye,
  LucideEdit,
  LucideTrash2,
  LucideShield,
  LucideUsers,
  LucideUserCheck,
  LucideGraduationCap
} from "lucide-vue-next"

// 🧍 Datos simulados
const usuarios = ref([
  {
    id: 1,
    nombre: "Roberto Fernández",
    email: "roberto.fernandez@admin.com",
    rol: "Administrador",
    academia: "Todas",
    telefono: "+34 600 111 222",
    estado: "Activo",
  },
  {
    id: 2,
    nombre: "Laura Martínez",
    email: "laura.martinez@instructor.com",
    rol: "Instructor",
    academia: "Dojo Central",
    telefono: "+34 611 222 333",
    estado: "Activo",
  },
  {
    id: 3,
    nombre: "Miguel Ángel Torres",
    email: "miguel.torres@instructor.com",
    rol: "Instructor",
    academia: "Karate Kids",
    telefono: "+34 622 333 444",
    estado: "Activo",
  },
  {
    id: 4,
    nombre: "Carmen Ruiz",
    email: "carmen.ruiz@coordinador.com",
    rol: "Coordinador",
    academia: "Academia Bushido",
    telefono: "+34 633 444 555",
    estado: "Activo",
  },
  {
    id: 5,
    nombre: "David Sánchez",
    email: "david.sanchez@instructor.com",
    rol: "Instructor",
    academia: "Dojo Central",
    telefono: "+34 644 555 666",
    estado: "Inactivo",
  },
  {
    id: 6,
    nombre: "Patricia López",
    email: "patricia.lopez@admin.com",
    rol: "Administrador",
    academia: "Todas",
    telefono: "+34 655 666 777",
    estado: "Activo",
  },
])

// 🎨 Colores e íconos
const rolColors: Record<string, string> = {
  Administrador: "bg-red-100 text-red-800 border-red-300",
  Instructor: "bg-blue-100 text-blue-800 border-blue-300",
  Coordinador: "bg-purple-100 text-purple-800 border-purple-300",
  Asistente: "bg-green-100 text-green-800 border-green-300",
}

const rolIcons: Record<string, any> = {
  Administrador: LucideShield,
  Instructor: LucideUser,
  Coordinador: LucideUser,
  Asistente: LucideUser,
}

// 🔍 Filtros
const searchTerm = ref("")
const filters = ref({ rol: "all" })

const filteredUsuarios = computed(() => {
  return usuarios.value.filter((usuario) => {
    const matchesSearch =
      usuario.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      usuario.rol.toLowerCase().includes(searchTerm.value.toLowerCase())

    const matchesRol = filters.value.rol === "all" || usuario.rol === filters.value.rol
    return matchesSearch && matchesRol
  })
})

const isDialogOpen = ref(false)
</script>