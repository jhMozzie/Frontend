<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4">
      
      <div class="flex items-center gap-4 flex-wrap">
        <div class="flex gap-1 rounded-md border border-gray-300 p-0.5">
          <button 
            @click="quickFilter = 'all'" 
            :class="['px-3 py-1 text-sm rounded-md transition-colors', quickFilter === 'all' ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-50']">
            Todas
          </button>
          <button 
            @click="quickFilter = 'Kata'" 
            :class="['px-3 py-1 text-sm rounded-md transition-colors', quickFilter === 'Kata' ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-50']">
            Kata
          </button>
          <button 
            @click="quickFilter = 'Kumite'" 
            :class="['px-3 py-1 text-sm rounded-md transition-colors', quickFilter === 'Kumite' ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-50']">
            Kumite
          </button>
        </div>

        <FilterPopover align="left" width="w-72">
          <template #trigger="{ isOpen }">
            <button
              :class="[
                'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none',
                'h-9',
                (hasActiveFilters || isOpen) ? 'border-red-600 text-red-700 bg-red-50 hover:bg-red-100' : 'border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50'
              ]"
            >
              <LucideFilter class="h-4 w-4" />
              <span>Filtros</span>
              <span v-if="hasActiveFilters" class="ml-1 bg-red-200 text-red-800 text-xs font-medium rounded-full px-2 py-0.5">
                {{ activeFilterCount }}
              </span>
            </button>
          </template>
          
          <template #content="{ close }">
             <div class="flex items-center justify-between mb-3">
               <h4 class="font-semibold text-sm">Filtros Avanzados</h4>
               <button v-if="hasActiveFilters" @click="clearFilters" class="inline-flex items-center gap-1 text-xs text-red-600 hover:underline">
                 <LucideX class="h-3 w-3" /> Limpiar
               </button>
             </div>
             <div class="space-y-4">
                <div>
                  <label for="filter-edad" class="block text-sm font-medium text-gray-700 mb-1">Grupo de Edad</label>
                  <select v-model="ageFilter" id="filter-edad" class="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-0">
                    <option value="all">Todas Edades</option>
                    <option value="Infantil">Infantil (U14)</option>
                    <option value="Juvenil">Juvenil (Cadete/Junior)</option>
                    <option value="Senior">Senior (Sub-21/Senior)</option>
                  </select>
                </div>
                <div>
                  <label for="filter-cinturon" class="block text-sm font-medium text-gray-700 mb-1">Cinturón (Min)</label>
                  <select v-model="filters.beltMinName" id="filter-cinturon" class="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-0">
                    <option value="all">Todos</option>
                    <option v-for="belt in uniqueBeltNames" :key="belt" :value="belt">{{ belt }}</option>
                  </select>
                </div>
             </div>
             <button @click="close" class="mt-4 w-full inline-flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm">
               Aplicar
             </button>
          </template>
        </FilterPopover>

      </div>

      <div class="flex gap-2 w-full sm:w-auto">
        <button
          @click="openCreateModal"
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

    <div v-if="categoriesLoading" class="text-center py-10 text-gray-500">
      <LucideLoader2 class="h-6 w-6 animate-spin mx-auto mb-2" />
      Cargando categorías...
    </div>
    <div v-else-if="categoriesError" class="text-center py-10 text-red-500">
      <LucideAlertTriangle class="h-6 w-6 mx-auto mb-2" />
      {{ categoriesError }}
    </div>

    <div v-else class="rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
      <DataTable :data="filteredPaginatedCategories" :columns="tableColumns">
        <template #name="{ item }">
          <span class="font-medium text-gray-900">{{ generateCategoryName(item) }}</span>
        </template>
        
        <template #belt="{ item }">
          <span>{{ item.beltMinName === item.beltMaxName ? item.beltMinName : `${item.beltMinName} a ${item.beltMaxName}` }}</span>
        </template>
        
        <template #participantCount="{ item }">
           <span class="flex justify-center">{{ item.participantCount }}</span>
        </template>

        <template #actions="{ item }">
          <div class="flex justify-end gap-2 whitespace-nowrap">
            <button @click="handleEditCategory(item)" class="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900">
              <LucidePencil class="w-4 h-4" />
            </button>
            <button @click="handleDeleteCategory(item.id)" class="inline-flex items-center gap-1 text-red-600 hover:text-red-800">
              <LucideTrash2 class="w-4 h-4" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <div v-if="!categoriesLoading && totalPages > 1" class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 mt-4 border-t border-gray-200">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">Mostrar:</span>
        <select
          v-model="itemsPerPage"
          class="h-9 rounded-md border border-gray-300 bg-white py-1 px-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
        </select>
        <span class="text-sm text-gray-500">
          resultados ({{ startIndex + 1 }} -
          {{ Math.min(endIndex, filteredCategories.length) }}
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
          <LucideChevronLeft class="w-4 h-4 mr-1" /> Anterior
        </button>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente <LucideChevronRight class="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>

    <transition
      enter-active-class="ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <CategoryFormModal
        v-if="showCategoryModal"
        :initial-data="editingCategoryData"
        :is-saving="isSaving"
        :error="modalError"
        @close="closeModal"
        @save="handleSaveCategory"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useChampionshipStore } from '@/modules/championships/store/championships.store'
import type { ChampionshipCategoryListItem, CreateChampionshipCategoryPayload, UpdateChampionshipCategoryPayload } from '@/modules/championships/types/championships-categories.types'
import {
  LucidePlus, LucideUpload, LucidePencil, LucideTrash2, LucideChevronLeft,
  LucideChevronRight, LucideLoader2, LucideAlertTriangle, LucideX,
  LucideFilter
} from 'lucide-vue-next'
import DataTable from '@/components/ui/DataTable.vue'
import FilterPopover from '@/components/ui/FilterPopover.vue'
import CategoryFormModal from '@/modules/championships/components/create/CategoryFormModal.vue'

// --- CONEXIÓN AL STORE ---
const route = useRoute()
const championshipStore = useChampionshipStore()
const championshipId = computed(() => Number(route.params.id))

const { 
  championshipCategories, 
  // categoriesMeta, // No lo usamos para paginación frontend
  categoriesLoading, 
  categoriesError 
} = storeToRefs(championshipStore)

const { 
  fetchChampionshipCategories, 
  createCategory, 
  updateCategory,
  deleteCategory 
} = championshipStore

// --- ESTADO LOCAL ---
const quickFilter = ref<string>('all') // Filtro modalidad
const ageFilter = ref<string>('all')  // Filtro edad (Infantil, Juvenil, Senior)
const filters = ref({ // Filtros avanzados (popover)
  beltMinName: "all",
});
const currentPage = ref(1)
const itemsPerPage = ref(5)

// --- DATOS Y PAGINACIÓN ---
onMounted(() => {
  if (championshipId.value) {
    fetchChampionshipCategories(championshipId.value, 1, 999)
  }
})

// --- Lógica de Filtros ---
const hasActiveFilters = computed<boolean>(() => {
  return filters.value.beltMinName !== 'all' || ageFilter.value !== 'all'
});
const activeFilterCount = computed<number>(() => {
  return (filters.value.beltMinName !== 'all' ? 1 : 0) + (ageFilter.value !== 'all' ? 1 : 0)
});

const clearFilters = () => {
  filters.value = { beltMinName: "all" };
  ageFilter.value = 'all';
  currentPage.value = 1;
};

function getAgeGroup(ageRangeLabel: string): string {
  if (ageRangeLabel.includes('U14')) return 'Infantil';
  if (ageRangeLabel.includes('Cadete') || ageRangeLabel.includes('Junior')) return 'Juvenil';
  if (ageRangeLabel.includes('Sub-21') || ageRangeLabel.includes('Senior')) return 'Senior';
  return 'Otro';
}

const filteredCategories = computed(() => {
  if (!Array.isArray(championshipCategories.value)) return [];
  
  const filtered = championshipCategories.value.filter(cat => {
    const matchesQuickFilter = quickFilter.value === 'all' || cat.modality === quickFilter.value;
    const matchesAgeFilter = ageFilter.value === 'all' || getAgeGroup(cat.ageRangeLabel) === ageFilter.value;
    const matchesBelt = filters.value.beltMinName === 'all' || cat.beltMinName === filters.value.beltMinName;
    return matchesQuickFilter && matchesAgeFilter && matchesBelt;
  });

  // Ordenamos por 'code'
  return filtered.sort((a, b) => {
    const codeA = a.code || '';
    const codeB = b.code || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  });
});

// --- Paginación ---
const totalPages = computed(() => Math.max(1, Math.ceil(filteredCategories.value.length / itemsPerPage.value)));
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => startIndex.value + itemsPerPage.value);
const filteredPaginatedCategories = computed(() => filteredCategories.value.slice(startIndex.value, endIndex.value));

const uniqueAgeRanges = computed(() => [...new Set(championshipCategories.value.map(c => c.ageRangeLabel).filter(Boolean))].sort());
const uniqueBeltNames = computed(() => [...new Set(championshipCategories.value.map(c => c.beltMinName).filter(Boolean))].sort());


watch([quickFilter, ageFilter, filters, itemsPerPage], () => {
    currentPage.value = 1;
}, { deep: true });

// --- LÓGICA DEL MODAL ---
const showCategoryModal = ref(false)
const isEditing = ref(false)
const editingCategoryData = ref<Partial<CreateChampionshipCategoryPayload> & { id?: number } | undefined>(undefined)
const modalError = ref<string | null>(null)
const isSaving = ref(false)

const getInitialFormData = (): CreateChampionshipCategoryPayload => ({
  code: '',
  modality: 'Kata',
  gender: 'Masculino',
  beltMinId: 9, 
  beltMaxId: 12,
  ageRangeId: 1,
  weight: null,
})

const openCreateModal = () => {
  isEditing.value = false
  editingCategoryData.value = undefined
  modalError.value = null
  isSaving.value = false 
  showCategoryModal.value = true
}

const handleEditCategory = (category: ChampionshipCategoryListItem) => {
  isEditing.value = true
  editingCategoryData.value = {
    id: category.id,
    code: category.code || '',
    modality: category.modality,
    gender: category.gender,
    weight: category.weight || null,
    // (IDs hardcodeados - necesita fetchById para ser real)
    ageRangeId: 1, 
    beltMinId: 9,  
    beltMaxId: 12, 
  }
  modalError.value = null
  isSaving.value = false
  showCategoryModal.value = true
}

const closeModal = () => {
  showCategoryModal.value = false
}

const handleSaveCategory = async (data: CreateChampionshipCategoryPayload) => {
  modalError.value = null
  isSaving.value = true
  
  if (!championshipId.value) {
    modalError.value = "Error: ID de campeonato no encontrado."
    isSaving.value = false
    return
  }

  try {
    if (isEditing.value && editingCategoryData.value?.id) {
      await updateCategory(editingCategoryData.value.id, data as UpdateChampionshipCategoryPayload)
    } else {
      await createCategory(championshipId.value, data)
    }
    closeModal()
  } catch (error: any) {
    console.error("Error al guardar categoría:", error)
    modalError.value = error.message || "Ocurrió un error."
  } finally {
    isSaving.value = false
  }
}

const handleDeleteCategory = async (id: number) => {
  if (!window.confirm("¿Estás seguro de que quieres eliminar esta categoría?")) return;

  try {
    await deleteCategory(id)
  } catch (error: any) {
    console.error(error)
    alert(error.message || "Error al eliminar la categoría.")
  }
}

const handleImportExcel = () => { alert('Importar desde Excel (pendiente)'); }

// --- LÓGICA DE DATATABLE ---
const tableColumns = ref([
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Categoría' }, 
  // { key: 'modality', label: 'Tipo' }, // <-- Columna eliminada
  { key: 'ageRangeLabel', label: 'Edad' },
  { key: 'belt', label: 'Cinturón' }, 
  { key: 'participantCount', label: 'Inscritos' },
])

// --- Funciones Auxiliares ---
function generateCategoryName(cat: ChampionshipCategoryListItem): string {
    let name = `${cat.modality} ${cat.gender} ${cat.ageRangeLabel}`;
    if (cat.modality === 'Kumite' && cat.weight) {
        name += ` ${cat.weight}`;
    }
    return name;
}
</script>