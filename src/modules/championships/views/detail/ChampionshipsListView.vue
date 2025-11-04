<template>
  <div class="flex flex-col">
    <div class="border-b border-gray-200 bg-white">
      <div class="flex items-center justify-between px-6 py-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Campeonatos</h1>
          <p class="mt-1 text-sm text-gray-500">
            Gestiona todos los campeonatos y torneos
          </p>
        </div>
        <!-- Botón solo visible para Administrador -->
        <RouterLink
          v-if="isAdmin"
          :to="{ name: 'championships-create' }"
          class="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
        >
          <LucidePlus class="h-4 w-4" />
          Nuevo Campeonato
        </RouterLink>
      </div>
    </div>

    <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative w-full md:w-[280px]">
          <LucideSearch
            class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar campeonatos..."
            class="pl-9 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-300"
          />
        </div>

        <div class="relative">
          <select
            v-model="selectedMonth"
            class="appearance-none border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 pr-8 focus:outline-none focus:ring-0 focus:border-gray-300 cursor-pointer"
          >
            <option value="all">Todos los meses</option>
            <option v-for="m in months" :key="m.value" :value="m.value">
              {{ m.label }}
            </option>
          </select>
          <LucideChevronDown
            class="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
        </div>

        <div class="relative">
          <select
            v-model="selectedYear"
            class="appearance-none border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 pr-8 focus:outline-none focus:ring-0 focus:border-gray-300 cursor-pointer"
          >
            <option value="all">Todos los años</option>
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
          <LucideChevronDown
            class="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
        </div>

        <div class="relative">
          <button
            @click="toggleStatusPopover"
            class="inline-flex items-center gap-2 border border-gray-300 bg-white px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <LucideFilter class="h-4 w-4" />
            Estado
            <span
              v-if="selectedStatuses.length > 0"
              class="ml-1 bg-red-100 text-red-700 text-xs font-medium rounded-full px-2 py-0.5"
            >
              {{ selectedStatuses.length }}
            </span>
          </button>

          <div
            v-if="showStatusPopover"
            class="absolute z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-md p-3"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-semibold text-gray-700">
                Filtrar por estado
              </h4>
              <button
                @click="clearStatuses"
                class="text-xs text-red-500 hover:underline"
                v-if="selectedStatuses.length > 0"
              >
                Limpiar
              </button>
            </div>

            <div class="space-y-2">
              <label
                v-for="status in statuses"
                :key="status"
                class="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :checked="selectedStatuses.includes(status)"
                  @change="toggleStatus(status)"
                  class="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span class="text-sm text-gray-700">{{ status }}</span>
              </label>
            </div>
          </div>
        </div>

        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="inline-flex items-center gap-1 text-sm text-red-600 hover:underline ml-auto"
        >
          <LucideX class="h-4 w-4" />
          Limpiar
        </button>
      </div>
    </div>

    <div class="flex-1 p-6">
      <div v-if="loading" class="text-center py-10 text-gray-500">
        <LucideLoader2 class="h-6 w-6 animate-spin mx-auto mb-2" />
        Cargando campeonatos...
      </div>
      <div v-else-if="error" class="text-center py-10 text-red-500">
        <LucideAlertTriangle class="h-6 w-6 mx-auto mb-2" />
        {{ error }}
      </div>
      <div v-else-if="filteredChampionships.length === 0" class="text-center py-12">
        <LucideCalendar class="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <h3 class="text-lg font-semibold text-gray-700 mb-1">
          No se encontraron campeonatos
        </h3>
        <p class="text-sm text-gray-500 mb-4">
          Intenta ajustar los filtros o limpiar la búsqueda.
        </p>
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition"
        >
          Limpiar filtros
        </button>
      </div>

      <div v-else>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <RouterLink
            v-for="champ in paginatedChampionships"
            :key="champ.id"
            :to="`/championships/${champ.id}`"
            class="overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
          >
            <div class="aspect-video w-full overflow-hidden">
              <img 
                :src="champ.image?.trim() ? champ.image : '/international-karate-championship.jpg'" 
                :alt="champ.name" 
                class="w-full h-full object-cover" 
              />
            </div>
            
            <div class="p-5">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-semibold text-lg text-foreground line-clamp-1">{{ champ.name }}</h3>
                <span class="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-red-600 text-white">
                  {{ champ.status }}
                </span>
              </div>

              <div class="space-y-2">
                <div class="flex items-center gap-2 text-sm text-gray-500">
                  <LucideCalendar class="w-4 h-4" />
                  <span>{{ formatDate(champ.startDate) }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-500">
                  <LucideMapPin class="w-4 h-4" />
                  <span class="line-clamp-1">{{ champ.location }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-500">
                  <LucideUsers class="w-4 h-4" />
                  <span>{{ champ.academy }}</span>
                </div>
              </div>

              <div class="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <!-- Botones solo visibles para Administrador -->
                <template v-if="isAdmin">
                  <button
                    type="button"
                    @click.prevent.stop="handleEdit(champ.id)"
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-3 flex-1 gap-2 border border-gray-300 bg-white hover:bg-gray-50"
                  >
                    <LucidePencil class="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    @click.prevent.stop="handleDelete(champ.id)"
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-3 flex-1 gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-red-600 hover:text-red-700"
                  >
                    <LucideTrash2 class="w-4 h-4" />
                    Eliminar
                  </button>
                </template>
                
                <!-- Mensaje para entrenadores -->
                <div v-else class="text-xs text-gray-500 text-center py-2 w-full">
                  <LucideEye class="w-4 h-4 inline-block mr-1" />
                  Ver detalles
                </div>
              </div>
            </div>
          </RouterLink>
        </div>

        <p class="text-sm text-gray-500 text-center mt-6">
          Mostrando
          {{ (currentPage - 1) * itemsPerPage + 1 }} –
          {{ Math.min(currentPage * itemsPerPage, filteredChampionships.length) }}
          de {{ filteredChampionships.length }} campeonatos
        </p>
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { RouterLink, useRouter } from "vue-router"
import { storeToRefs } from "pinia"
import {
  LucidePlus,
  LucideCalendar,
  LucideSearch,
  LucideX,
  LucideFilter,
  LucideChevronDown,
  LucideLoader2,
  LucideAlertTriangle,
  // 👇 AÑADIMOS LOS ICONOS QUE AHORA ESTÁN EN ESTE TEMPLATE
  LucideMapPin,
  LucideUsers,
  LucidePencil,
  LucideTrash2,
  LucideEye, // ← Para mostrar icono de "solo lectura"
} from "lucide-vue-next"

import Pagination from "@/components/ui/Pagination.vue"
import { useChampionshipStore } from "@/modules/championships/store/championships.store"

const championshipStore = useChampionshipStore()
const { championships, loading, error } = storeToRefs(championshipStore)
const { fetchChampionships, deleteChampionship } = championshipStore

const router = useRouter()

// --- Verificar si el usuario es administrador ---
const userRole = ref(localStorage.getItem("userRole") || "")
const isAdmin = computed(() => userRole.value === "Administrador")

// --- Filtros ---
const searchQuery = ref("")
const selectedMonth = ref("all")
const selectedYear = ref("all")
const selectedStatuses = ref<string[]>([])
const showStatusPopover = ref(false)

// --- Listas estáticas ---
const months = [
  { value: "1", label: "Enero" }, { value: "2", label: "Febrero" }, { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" }, { value: "5", label: "Mayo" }, { value: "6", label: "Junio" },
  { value: "7", label: "Julio" }, { value: "8", label: "Agosto" }, { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" }, { value: "11", label: "Noviembre" }, { value: "12", label: "Diciembre" },
]
const years = ["2024", "2025", "2026"]
const statuses = ["Activo", "Próximo", "Inscripción Abierta", "Planificación"]

onMounted(() => {
  fetchChampionships(1, 999) 
})

// --- Filtros lógicos ---
function toggleStatusPopover() {
  showStatusPopover.value = !showStatusPopover.value
}
function toggleStatus(status: string) {
  if (selectedStatuses.value.includes(status))
    selectedStatuses.value = selectedStatuses.value.filter((s) => s !== status)
  else selectedStatuses.value.push(status)
}
function clearStatuses() {
  selectedStatuses.value = []
}
function handleClickOutside(e: MouseEvent) {
  const popover = document.querySelector(".absolute.z-50")
  if (popover && !popover.contains(e.target as Node))
    showStatusPopover.value = false
}
onMounted(() => document.addEventListener("click", handleClickOutside))
onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside))

// --- Computed filters ---
const hasActiveFilters = computed(
  () =>
    searchQuery.value !== "" ||
    selectedMonth.value !== "all" ||
    selectedYear.value !== "all" ||
    selectedStatuses.value.length > 0,
)

const filteredChampionships = computed(() =>
  championships.value.filter((c) => {
    const date = new Date(c.startDate)
    
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus =
      selectedStatuses.value.length === 0 ||
      selectedStatuses.value.includes(c.status)
      
    const matchesMonth =
      selectedMonth.value === "all" ||
      (date.getMonth() + 1).toString() === selectedMonth.value

    const matchesYear =
      selectedYear.value === "all" ||
      date.getFullYear().toString() === selectedYear.value
      
    return matchesSearch && matchesStatus && matchesMonth && matchesYear
  }),
)

// --- Paginación ---
const currentPage = ref(1)
const itemsPerPage = ref(6)
const totalPages = computed(() =>
  Math.ceil(filteredChampionships.value.length / itemsPerPage.value)
)
const paginatedChampionships = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredChampionships.value.slice(start, end)
})

function handlePageChange(page: number) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: "smooth" })
}

// --- Limpieza de filtros ---
function clearFilters() {
  searchQuery.value = ""
  selectedMonth.value = "all"
  selectedYear.value = "all"
  selectedStatuses.value = []
  currentPage.value = 1
}

// --- Formateo de fechas ---
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

// --- Manejadores de eventos (Sin cambios) ---
function handleEdit(id: number) {
  router.push({ name: 'championships-edit', params: { id } })
}

async function handleDelete(id: number) {
  if (window.confirm("¿Estás seguro de que quieres eliminar este campeonato?")) {
    try {
      await deleteChampionship(id);
    } catch (err) {
      console.error("Error al eliminar el campeonato:", err);
    }
  }
}
</script>