<template>
  <div class="flex-1 space-y-6 p-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Academias</h1>
        <p class="text-gray-500 mt-1">
          Gestiona las academias afiliadas y sus datos
        </p>
      </div>
      <button
        @click="isDialogOpen = true"
        class="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
      >
        <LucidePlus class="h-4 w-4" />
        Nueva Academia
      </button>
    </div>

    <!-- ✅ Cards resumen con iconos -->
    <div class="grid gap-4 md:grid-cols-4">
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <LucideBuilding2 class="h-5 w-5 text-blue-600" />
          <span class="text-sm font-medium text-gray-600">Total Academias</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">{{ academias.length }}</p>
          <p class="text-xs text-gray-500">Registradas en el sistema</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <LucideCheckCircle2 class="h-5 w-5 text-green-600" />
          <span class="text-sm font-medium text-gray-600">Academias Activas</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">{{ academiasActivas }}</p>
          <p class="text-xs text-gray-500">Operando actualmente</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <LucideUsers class="h-5 w-5 text-red-600" />
          <span class="text-sm font-medium text-gray-600">Total Estudiantes</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">{{ totalEstudiantes }}</p>
          <p class="text-xs text-gray-500">En todas las academias</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <LucideBarChart2 class="h-5 w-5 text-indigo-600" />
          <span class="text-sm font-medium text-gray-600">Promedio por Academia</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">
            {{ Math.round(totalEstudiantes / academias.length) }}
          </p>
          <p class="text-xs text-gray-500">Estudiantes por academia</p>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div class="flex items-center justify-between border-b border-gray-200 p-4">
        <div>
          <h2 class="font-semibold text-gray-800 text-lg">Lista de Academias</h2>
          <p class="text-sm text-gray-500">
            {{ filteredAcademias.length }} academia(s) encontrada(s)
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Buscar -->
          <div class="relative">
            <LucideSearch class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              v-model="searchTerm"
              placeholder="Buscar academias..."
              class="pl-8 w-[300px] border border-gray-300 rounded-md h-10 text-sm px-3 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <!-- Filtros -->
          <div class="relative">
            <button
              @click="showFilters = !showFilters"
              class="border border-gray-300 rounded-md h-10 w-10 flex items-center justify-center hover:bg-gray-50"
              :class="hasActiveFilters ? 'border-red-500' : ''"
            >
              <LucideFilter class="h-4 w-4 text-gray-600" />
            </button>

            <div
              v-if="showFilters"
              class="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10"
            >
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold text-sm">Filtros</h4>
                <button
                  v-if="hasActiveFilters"
                  @click="clearFilters"
                  class="flex items-center text-xs text-gray-600 hover:text-red-600"
                >
                  <LucideX class="h-4 w-4 mr-1" />
                  Limpiar
                </button>
              </div>

              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <select
                    v-model="filters.ciudad"
                    class="w-full border border-gray-300 rounded-md h-9 px-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="all">Todas las ciudades</option>
                    <option value="Madrid">Madrid</option>
                    <option value="Barcelona">Barcelona</option>
                    <option value="Valencia">Valencia</option>
                    <option value="Sevilla">Sevilla</option>
                    <option value="Bilbao">Bilbao</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    v-model="filters.estado"
                    class="w-full border border-gray-300 rounded-md h-9 px-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="Activa">Activa</option>
                    <option value="Inactiva">Inactiva</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla principal -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Ubicación</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Instructor Principal</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Estudiantes</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Contacto</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
              <th class="px-4 py-3 text-right font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="academia in filteredAcademias"
              :key="academia.id"
              class="hover:bg-gray-50"
            >
              <td class="px-4 py-3 font-medium text-gray-800">
                {{ academia.nombre }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-start gap-2">
                  <LucideMapPin class="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <div class="text-sm">{{ academia.direccion }}</div>
                    <div class="text-xs text-gray-500">
                      {{ academia.ciudad }}, {{ academia.estado }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">{{ academia.instructorPrincipal }}</td>
              <td class="px-4 py-3 flex items-center gap-1">
                <LucideUsers class="h-4 w-4 text-gray-400" />
                <span class="font-medium">{{ academia.numeroEstudiantes }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-1 text-sm">
                    <LucidePhone class="h-3 w-3 text-gray-400" />
                    <span class="text-gray-600">{{ academia.telefono }}</span>
                  </div>
                  <div class="text-xs text-gray-400">{{ academia.email }}</div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span
                  :class="[
                    'px-2 py-1 rounded-md text-xs font-semibold',
                    academia.estadoAcademia === 'Activa'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-700',
                  ]"
                >
                  {{ academia.estadoAcademia }}
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
import {
  LucidePlus,
  LucideSearch,
  LucideFilter,
  LucideX,
  LucideMapPin,
  LucideUsers,
  LucidePhone,
  LucideEye,
  LucideEdit,
  LucideTrash2,
  LucideBarChart2,
  LucideBuilding2,
  LucideCheckCircle2,
} from "lucide-vue-next"
import { ref, computed } from "vue"

const academias = ref([
  {
    id: 1,
    nombre: "Dojo Central",
    direccion: "Calle Principal 123",
    ciudad: "Madrid",
    estado: "Madrid",
    instructorPrincipal: "Laura Martínez",
    numeroEstudiantes: 45,
    telefono: "+34 911 222 333",
    email: "info@dojocentral.com",
    estadoAcademia: "Activa",
  },
  {
    id: 2,
    nombre: "Karate Kids",
    direccion: "Avenida del Deporte 45",
    ciudad: "Barcelona",
    estado: "Barcelona",
    instructorPrincipal: "Miguel Ángel Torres",
    numeroEstudiantes: 32,
    telefono: "+34 933 444 555",
    email: "contacto@karatekids.com",
    estadoAcademia: "Activa",
  },
  {
    id: 3,
    nombre: "Academia Bushido",
    direccion: "Plaza del Maestro 8",
    ciudad: "Valencia",
    estado: "Valencia",
    instructorPrincipal: "Carmen Ruiz",
    numeroEstudiantes: 28,
    telefono: "+34 961 666 777",
    email: "info@bushido.com",
    estadoAcademia: "Activa",
  },
  {
    id: 4,
    nombre: "Dojo Samurai",
    direccion: "Calle del Guerrero 56",
    ciudad: "Sevilla",
    estado: "Sevilla",
    instructorPrincipal: "Antonio García",
    numeroEstudiantes: 38,
    telefono: "+34 954 888 999",
    email: "contacto@dojosamurai.com",
    estadoAcademia: "Activa",
  },
  {
    id: 5,
    nombre: "Centro Marcial Zen",
    direccion: "Avenida de la Paz 90",
    ciudad: "Bilbao",
    estado: "Vizcaya",
    instructorPrincipal: "Elena Fernández",
    numeroEstudiantes: 22,
    telefono: "+34 944 111 222",
    email: "info@zenkarate.com",
    estadoAcademia: "Inactiva",
  },
])

const searchTerm = ref("")
const showFilters = ref(false)
const isDialogOpen = ref(false)
const filters = ref({
  ciudad: "all",
  estado: "all",
})

const filteredAcademias = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return academias.value.filter((a) => {
    const matchesSearch =
      a.nombre.toLowerCase().includes(term) ||
      a.ciudad.toLowerCase().includes(term) ||
      a.instructorPrincipal.toLowerCase().includes(term)
    const matchesCiudad = filters.value.ciudad === "all" || a.ciudad === filters.value.ciudad
    const matchesEstado =
      filters.value.estado === "all" || a.estadoAcademia === filters.value.estado
    return matchesSearch && matchesCiudad && matchesEstado
  })
})

const totalEstudiantes = computed(() =>
  academias.value.reduce((sum, a) => sum + a.numeroEstudiantes, 0)
)
const academiasActivas = computed(
  () => academias.value.filter((a) => a.estadoAcademia === "Activa").length
)
const hasActiveFilters = computed(
  () => filters.value.ciudad !== "all" || filters.value.estado !== "all"
)

const clearFilters = () => {
  filters.value = { ciudad: "all", estado: "all" }
}
</script>