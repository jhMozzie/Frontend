<template>
  <div class="space-y-6">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200"
    >
      <div class="flex items-center gap-2 flex-wrap">
        <label class="text-sm font-medium text-gray-700 shrink-0"
          >Filtrar por:</label
        >
        <div class="flex gap-1 rounded-md border border-gray-300 p-0.5">
          <button
            @click="filterDivision = 'all'"
            :class="[
              'px-3 py-1 text-sm rounded-md transition-colors',
              filterDivision === 'all'
                ? 'bg-gray-100 text-gray-900 font-semibold'
                : 'text-gray-600 hover:bg-gray-50',
            ]"
          >
            Todas
          </button>
          <button
            @click="filterDivision = 'Infantil'"
            :class="[
              'px-3 py-1 text-sm rounded-md transition-colors',
              filterDivision === 'Infantil'
                ? 'bg-gray-100 text-gray-900 font-semibold'
                : 'text-gray-600 hover:bg-gray-50',
            ]"
          >
            Infantil
          </button>
          <button
            @click="filterDivision = 'Juvenil'"
            :class="[
              'px-3 py-1 text-sm rounded-md transition-colors',
              filterDivision === 'Juvenil'
                ? 'bg-gray-100 text-gray-900 font-semibold'
                : 'text-gray-600 hover:bg-gray-50',
            ]"
          >
            Juvenil
          </button>
          <button
            @click="filterDivision = 'Senior'"
            :class="[
              'px-3 py-1 text-sm rounded-md transition-colors',
              filterDivision === 'Senior'
                ? 'bg-gray-100 text-gray-900 font-semibold'
                : 'text-gray-600 hover:bg-gray-50',
            ]"
          >
            Senior
          </button>
        </div>
      </div>

      <div class="flex gap-2 w-full sm:w-auto">
        <button
          @click="handleAddCategory"
          class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
        >
          <LucidePlus class="w-4 h-4" />
          Agregar Categoría
        </button>
        <button
          @click="handleImportExcel"
          class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition"
        >
          <LucideUpload class="w-4 h-4" />
          Importar desde Excel
        </button>
      </div>
    </div>

    <div class="border rounded-lg overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Nombre de Categoría
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Tipo
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              División
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="paginatedCategories.length === 0">
            <td colspan="4" class="px-6 py-8 text-center text-sm text-gray-500">
              No hay categorías para mostrar
            </td>
          </tr>
          <tr v-for="category in paginatedCategories" :key="category.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ category.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ category.type }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ category.division }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <div class="flex justify-end gap-2">
                <button
                  @click="handleEditCategory(category.id)"
                  class="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                >
                  <LucidePencil class="w-4 h-4" />
                  Editar
                </button>
                <button
                  @click="handleDeleteCategory(category.id)"
                  class="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
                >
                  <LucideTrash2 class="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="filteredCategories.length > 0"
      class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200"
    >
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">Mostrar:</span>
        <select
          v-model="itemsPerPage"
          @change="currentPage = 1"
          class="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400 appearance-none cursor-pointer"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
        </select>
        <span class="text-sm text-gray-500">
          resultados ({{ startIndex + 1 }} -
          {{ Math.min(startIndex + itemsPerPage, filteredCategories.length) }}
          de {{ filteredCategories.length }})
        </span>
      </div>
      <div class="flex items-center gap-2">
         <span class="text-sm text-gray-500">Página {{ currentPage }} de {{ totalPages }}</span>
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LucideChevronLeft class="w-4 h-4 mr-1" />
          Anterior
        </button>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
          <LucideChevronRight class="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  LucidePlus,
  LucideUpload,
  LucidePencil,
  LucideTrash2,
  LucideChevronLeft,
  LucideChevronRight,
} from 'lucide-vue-next'

// Definimos la interfaz directamente aquí
interface Category {
  id: string
  name: string
  type: 'Kata' | 'Kumite'
  division: string
}

// --- Estado Local (Hardcodeado) ---

// Filtro
const filterDivision = ref<string>('all')

// Datos de ejemplo (como en React)
const categories = ref<Category[]>([
  { id: '1', name: 'Infantil Masculino -45kg', type: 'Kumite', division: 'Infantil' },
  { id: '2', name: 'Juvenil Femenino Kata', type: 'Kata', division: 'Juvenil' },
  { id: '3', name: 'Senior Masculino -75kg', type: 'Kumite', division: 'Senior' },
  { id: '4', name: 'Infantil Femenino -40kg', type: 'Kumite', division: 'Infantil' },
  { id: '5', name: 'Senior Femenino Kata', type: 'Kata', division: 'Senior' },
])

// Paginación
const currentPage = ref(1)
const itemsPerPage = ref(5) // Cambiado a 5 para el ejemplo visual

// --- Lógica (Hardcodeada) ---

// Filtrado (Computed Property)
const filteredCategories = computed(() => {
  if (filterDivision.value === 'all') {
    return categories.value
  }
  return categories.value.filter((cat) => cat.division === filterDivision.value)
})

// Paginación (Computed Properties)
const totalPages = computed(() =>
  Math.ceil(filteredCategories.value.length / itemsPerPage.value)
)
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const paginatedCategories = computed(() =>
  filteredCategories.value.slice(
    startIndex.value,
    startIndex.value + itemsPerPage.value
  )
)

// Handlers (Simulados)
const handleDeleteCategory = (id: string) => {
  categories.value = categories.value.filter((cat) => cat.id !== id)
  // toast.success("Categoría eliminada"); // Necesitarás un sistema de toast
  console.log('Categoría eliminada:', id)
}

const handleEditCategory = (id: string) => {
  // toast.info("Función de edición próximamente");
  console.log('Editar categoría:', id)
}

const handleAddCategory = () => {
  // toast.info("Función de agregar categoría próximamente");
  console.log('Agregar categoría')
}

const handleImportExcel = () => {
  // toast.info("Función de importar Excel próximamente");
  console.log('Importar Excel')
}
</script>