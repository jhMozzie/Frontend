<template>
  <div class="flex-1 space-y-6 p-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Estudiantes</h1>
        <p class="text-gray-500 mt-1">Gestiona los estudiantes registrados en las academias</p>
      </div>
      <button
        @click="isDialogOpen = true"
        class="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
      >
        <LucidePlus class="h-4 w-4" />
        Nuevo Estudiante
      </button>
    </div>

    <!-- ✅ Cards estadísticas -->
    <div class="grid gap-4 md:grid-cols-4">
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <LucideUsers class="h-5 w-5 text-red-600" />
          <span class="text-sm font-medium text-gray-600">Total Estudiantes</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">{{ totalEstudiantes }}</p>
          <p class="text-xs text-gray-500">Registrados en el sistema</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <LucideUserCheck class="h-5 w-5 text-green-600" />
          <span class="text-sm font-medium text-gray-600">Estudiantes Activos</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">{{ totalActivos }}</p>
          <p class="text-xs text-gray-500">Actualmente entrenando</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <LucideAward class="h-5 w-5 text-indigo-600" />
          <span class="text-sm font-medium text-gray-600">Cinturones Negros</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">{{ totalNegros }}</p>
          <p class="text-xs text-gray-500">Dan certificados</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <LucideBarChart2 class="h-5 w-5 text-blue-600" />
          <span class="text-sm font-medium text-gray-600">Edad Promedio</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">{{ edadPromedio }}</p>
          <p class="text-xs text-gray-500">Años</p>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 class="font-semibold text-gray-800 text-lg">Lista de Estudiantes</h2>
          <p class="text-sm text-gray-500">{{ filtered.length }} estudiante(s) encontrado(s)</p>
        </div>

        <div class="flex items-center gap-2">
          <div class="relative">
            <LucideSearch class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              v-model="q"
              placeholder="Buscar estudiantes..."
              class="pl-8 w-[300px] border border-gray-300 rounded-md h-10 text-sm px-3 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <button class="border border-gray-300 rounded-md h-10 px-3 hover:bg-gray-50">
            <LucideFilter class="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Edad</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Cinturón</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Academia</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Contacto</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
              <th class="px-4 py-3 text-right font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="s in filtered" :key="s.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-800">{{ s.nombre }}</td>
              <td class="px-4 py-3">{{ s.edad }} años</td>
              <td class="px-4 py-3">
                <span
                  :class="['px-2 py-1 rounded-full text-xs font-medium', beltClass(s.cinturon)]"
                >
                  {{ s.cinturon }}
                </span>
              </td>
              <td class="px-4 py-3">{{ s.academia }}</td>
              <td class="px-4 py-3">
                <p class="text-gray-900">{{ s.email }}</p>
                <p class="text-gray-400 text-xs">{{ s.telefono }}</p>
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-1 rounded-md text-xs font-semibold"
                  :class="s.estado === 'Activo'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-600'"
                >
                  {{ s.estado }}
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
  LucideFilter,
  LucideEye,
  LucideEdit,
  LucideTrash2,
  LucideUsers,
  LucideUserCheck,
  LucideAward,
  LucideBarChart2
} from "lucide-vue-next"

type Estado = "Activo" | "Inactivo"

interface StudentRow {
  id: number
  nombre: string
  edad: number
  cinturon: string
  academia: string
  email: string
  telefono: string
  estado: Estado
}

const rows = ref<StudentRow[]>([
  {
    id: 1,
    nombre: "Carlos Rodríguez",
    edad: 15,
    cinturon: "Negro 1er Dan",
    academia: "Dojo Central",
    email: "carlos.rodriguez@email.com",
    telefono: "+34 612 345 678",
    estado: "Activo",
  },
  {
    id: 2,
    nombre: "María González",
    edad: 12,
    cinturon: "Marrón",
    academia: "Karate Kids",
    email: "maria.gonzalez@email.com",
    telefono: "+34 623 456 789",
    estado: "Activo",
  },
  {
    id: 3,
    nombre: "Juan Martínez",
    edad: 18,
    cinturon: "Negro 2do Dan",
    academia: "Dojo Central",
    email: "juan.martinez@email.com",
    telefono: "+34 634 567 890",
    estado: "Activo",
  },
  {
    id: 4,
    nombre: "Ana López",
    edad: 14,
    cinturon: "Azul",
    academia: "Academia Bushido",
    email: "ana.lopez@email.com",
    telefono: "+34 645 678 901",
    estado: "Inactivo",
  },
  {
    id: 5,
    nombre: "Pedro Sánchez",
    edad: 16,
    cinturon: "Negro 1er Dan",
    academia: "Karate Kids",
    email: "pedro.sanchez@email.com",
    telefono: "+34 656 789 012",
    estado: "Activo",
  },
])

const q = ref("")
const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return rows.value
  return rows.value.filter((s) =>
    [s.nombre, s.cinturon, s.academia, s.email, s.telefono, s.estado]
      .join(" ")
      .toLowerCase()
      .includes(term)
  )
})

// Métricas
const totalEstudiantes = computed(() => rows.value.length)
const totalActivos = computed(() => rows.value.filter((s) => s.estado === "Activo").length)
const totalNegros = computed(() => rows.value.filter((s) => s.cinturon.toLowerCase().includes("negro")).length)
const edadPromedio = computed(() =>
  Math.round(rows.value.reduce((acc, s) => acc + s.edad, 0) / Math.max(rows.value.length, 1))
)

// Colores de cinturón
const beltClass = (belt: string) => {
  const b = belt.toLowerCase()
  if (b.includes("negro")) return "bg-black text-white"
  if (b.includes("marrón") || b.includes("marron")) return "bg-yellow-200 text-yellow-900"
  if (b.includes("azul")) return "bg-blue-100 text-blue-700"
  if (b.includes("verde")) return "bg-green-100 text-green-700"
  if (b.includes("naranja")) return "bg-orange-100 text-orange-700"
  if (b.includes("amarillo")) return "bg-yellow-100 text-yellow-700"
  return "bg-gray-200 text-gray-700"
}

const isDialogOpen = ref(false)
</script>