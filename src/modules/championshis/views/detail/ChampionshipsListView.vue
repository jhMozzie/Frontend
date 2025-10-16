<template>
  <div class="flex flex-col">
    <!-- Header -->
    <div class="border-b border-gray-200 bg-white">
      <div class="flex items-center justify-between px-6 py-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Campeonatos</h1>
          <p class="mt-1 text-sm text-gray-500">
            Gestiona todos los campeonatos y torneos
          </p>
        </div>
        <button
          class="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
        >
          <LucidePlus class="h-4 w-4" />
          Nuevo Campeonato
        </button>
      </div>
    </div>

    <!-- 🔍 Filtros -->
    <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
      <div class="flex flex-wrap items-center gap-2">
        <!-- Búsqueda -->
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

        <!-- Mes -->
        <div class="relative">
          <select
            v-model="selectedMonth"
            class="appearance-none border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 pr-8 focus:outline-none focus:ring-0 focus:border-gray-300 cursor-pointer"
          >
            <option value="all">Todos los meses</option>
            <option
              v-for="m in months"
              :key="m.value"
              :value="m.value"
            >
              {{ m.label }}
            </option>
          </select>
          <LucideChevronDown
            class="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
        </div>

        <!-- Año -->
        <div class="relative">
          <select
            v-model="selectedYear"
            class="appearance-none border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 pr-8 focus:outline-none focus:ring-0 focus:border-gray-300 cursor-pointer"
          >
            <option value="all">Todos los años</option>
            <option
              v-for="y in years"
              :key="y"
              :value="y"
            >
              {{ y }}
            </option>
          </select>
          <LucideChevronDown
            class="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
        </div>

        <!-- ⚙️ Filtro por Estado -->
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

          <!-- Popover -->
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

        <!-- ❌ Limpiar -->
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

    <!-- Contenido -->
    <div class="flex-1 p-6">
      <div
        v-if="filteredChampionships.length === 0"
        class="text-center py-12"
      >
        <LucideCalendar
          class="h-10 w-10 text-gray-400 mx-auto mb-3"
        />
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
        <!-- Grid -->
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <RouterLink
            v-for="champ in currentChampionships"
            :key="champ.id"
            :to="`/campeonatos/${champ.id}`"
            class="overflow-hidden border border-gray-200 bg-white rounded-lg shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <div class="aspect-video w-full overflow-hidden bg-gray-100">
              <img
                :src="champ.image || '/placeholder.svg'"
                :alt="champ.name"
                class="h-full w-full object-cover"
              />
            </div>

            <div class="p-5">
              <div
                class="flex items-start justify-between gap-2 mb-3"
              >
                <h3
                  class="text-lg font-bold text-gray-900 line-clamp-2"
                >
                  {{ champ.name }}
                </h3>
                <span
                  class="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 whitespace-nowrap"
                >
                  {{ champ.status }}
                </span>
              </div>

              <div class="space-y-2">
                <div
                  class="flex items-center gap-2 text-sm text-gray-500"
                >
                  <LucideCalendar class="h-4 w-4" />
                  {{ champ.date }}
                </div>
                <div
                  class="flex items-center gap-2 text-sm text-gray-500"
                >
                  <LucideMapPin class="h-4 w-4" />
                  {{ champ.location }}
                </div>
                <div
                  class="flex items-center gap-2 text-sm text-gray-500"
                >
                  <LucideUsers class="h-4 w-4" />
                  {{ champ.participants }} participantes
                </div>
              </div>
            </div>
          </RouterLink>
        </div>

        <!-- 📄 Paginación -->
        <div class="mt-6 flex items-center justify-between">
          <p class="text-sm text-gray-500">
            Mostrando {{ indexOfFirstItem + 1 }} -
            {{ Math.min(indexOfLastItem, filteredChampionships.length) }}
            de {{ filteredChampionships.length }} campeonatos
          </p>

          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">Mostrar:</span>
              <select
                v-model="itemsPerPage"
                class="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white focus:outline-none focus:ring-0 focus:border-gray-300"
              >
                <option value="6">6</option>
                <option value="9">9</option>
                <option value="12">12</option>
                <option value="18">18</option>
              </select>
            </div>

            <div class="flex items-center gap-1">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-1 rounded-md text-sm border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              >
                Anterior
              </button>

              <button
                v-for="page in pageNumbers"
                :key="page"
                @click="changePage(page)"
                :class="[
                  'px-3 py-1 rounded-md text-sm border border-gray-300 hover:bg-gray-100',
                  currentPage === page
                    ? 'bg-red-600 text-white border-red-600'
                    : '',
                ]"
              >
                {{ page }}
              </button>

              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 rounded-md text-sm border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import {
  LucidePlus,
  LucideCalendar,
  LucideMapPin,
  LucideUsers,
  LucideSearch,
  LucideX,
  LucideFilter,
  LucideChevronDown,
} from "lucide-vue-next"

// --- Datos
const championships = [
  { id: "1", name: "Campeonato Nacional 2025", date: "15 de Marzo, 2025", month: 3, year: 2025, location: "Madrid, España", participants: 156, status: "Activo", image: "/karate-tournament-arena.jpg" },
  { id: "2", name: "Torneo Regional Centro", date: "22 de Febrero, 2025", month: 2, year: 2025, location: "Toledo, España", participants: 89, status: "Próximo", image: "/karate-dojo-competition.jpg" },
  { id: "3", name: "Copa Juvenil de Primavera", date: "5 de Abril, 2025", month: 4, year: 2025, location: "Valencia, España", participants: 124, status: "Inscripción Abierta", image: "/young-karate-athletes.jpg" },
  { id: "4", name: "Campeonato Internacional", date: "10 de Mayo, 2025", month: 5, year: 2025, location: "Barcelona, España", participants: 203, status: "Planificación", image: "/international-karate-championship.jpg" },
]

const months = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
]
const years = ["2024", "2025", "2026"]
const statuses = ["Activo", "Próximo", "Inscripción Abierta", "Planificación"]

// --- Filtros
const searchQuery = ref("")
const selectedMonth = ref("all")
const selectedYear = ref("all")
const selectedStatuses = ref<string[]>([])
const showStatusPopover = ref(false)

function toggleStatusPopover() {
  showStatusPopover.value = !showStatusPopover.value
}
function toggleStatus(status: string) {
  if (selectedStatuses.value.includes(status)) {
    selectedStatuses.value = selectedStatuses.value.filter((s) => s !== status)
  } else selectedStatuses.value.push(status)
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

// --- Computed
const hasActiveFilters = computed(
  () =>
    searchQuery.value !== "" ||
    selectedMonth.value !== "all" ||
    selectedYear.value !== "all" ||
    selectedStatuses.value.length > 0,
)

const filteredChampionships = computed(() =>
  championships.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesMonth =
      selectedMonth.value === "all" || c.month === Number(selectedMonth.value)
    const matchesYear =
      selectedYear.value === "all" || c.year === Number(selectedYear.value)
    const matchesStatus =
      selectedStatuses.value.length === 0 ||
      selectedStatuses.value.includes(c.status)
    return matchesSearch && matchesMonth && matchesYear && matchesStatus
  }),
)

// --- Paginación
const currentPage = ref(1)
const itemsPerPage = ref(6)
const indexOfLastItem = computed(() => currentPage.value * itemsPerPage.value)
const indexOfFirstItem = computed(() => indexOfLastItem.value - itemsPerPage.value)
const totalPages = computed(() =>
  Math.ceil(filteredChampionships.value.length / itemsPerPage.value),
)
const currentChampionships = computed(() =>
  filteredChampionships.value.slice(indexOfFirstItem.value, indexOfLastItem.value),
)

const pageNumbers = computed(() => {
  const pages: number[] = []
  const maxPagesToShow = 5
  if (totalPages.value <= maxPagesToShow)
    for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  else if (currentPage.value <= 3) {
    for (let i = 1; i <= 4; i++) pages.push(i)
    pages.push(totalPages.value)
  } else if (currentPage.value >= totalPages.value - 2) {
    pages.push(1)
    for (let i = totalPages.value - 3; i <= totalPages.value; i++) pages.push(i)
  } else {
    pages.push(1)
    for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) pages.push(i)
    pages.push(totalPages.value)
  }
  return pages
})

function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: "smooth" })
}

function clearFilters() {
  searchQuery.value = ""
  selectedMonth.value = "all"
  selectedYear.value = "all"
  selectedStatuses.value = []
  currentPage.value = 1
}
</script>