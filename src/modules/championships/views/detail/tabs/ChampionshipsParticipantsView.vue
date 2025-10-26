<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4">
      
      <div class="flex items-center gap-4 flex-wrap">
        <div class="relative flex-1 w-full sm:w-auto">
          <LucideSearch class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre..."
            class="w-full sm:w-64 rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 focus:border-gray-400 focus:outline-none focus:ring-0"
          />
        </div>

        <FilterPopover align="left" width="w-72">
          <template #trigger="{ isOpen }">
            <button
              :class="[
                'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none',
                'h-9', // Altura consistente
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
                  <label for="filter-academy" class="block text-sm font-medium text-gray-700 mb-1">Academia / Club</label>
                  <select v-model="filters.club" id="filter-academy" class="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-0">
                    <option value="all">Todos</option>
                    <option v-for="club in uniqueClubs" :key="club" :value="club">{{ club }}</option>
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
          @click="handleAddCompetitor"
          class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
        >
          <LucidePlus class="w-4 h-4" />
          Añadir Competidor
        </button>
      </div>
    </div>

    <div class="rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
      <DataTable :data="filteredCompetitors" :columns="tableColumns">
        
        <template #name="{ item }">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
              {{ getInitials(item.name) }}
            </div>
            <span class="text-sm font-medium text-gray-900">{{ item.name }}</span>
          </div>
        </template>
        
        <template #actions="{ item }">
          <div class="flex justify-end gap-3 whitespace-nowrap">
            <button @click="viewDetails(item.id)" class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800" title="Ver Detalles">
              <LucideEye class="w-4 h-4" />
            </button>
            <button @click="handleEdit(item.id)" class="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900" title="Editar">
              <LucidePencil class="w-4 h-4" />
            </button>
            <button @click="handleDelete(item.id)" class="inline-flex items-center gap-1 text-red-600 hover:text-red-800" title="Eliminar">
              <LucideTrash2 class="w-4 h-4" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <div v-if="totalPages > 1" class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 mt-4 border-t border-gray-200">
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
          {{ Math.min(endIndex, filteredCompetitors.length) }}
          de {{ filteredCompetitors.length }})
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
// Importamos los iconos necesarios
import { 
  LucideSearch, 
  LucideFilter, 
  LucidePlus, 
  LucideEye, 
  LucidePencil, 
  LucideTrash2, 
  LucideX,
  LucideChevronLeft,
  LucideChevronRight
} from 'lucide-vue-next';
// Importamos los componentes de UI
import DataTable from '@/components/ui/DataTable.vue';
import FilterPopover from '@/components/ui/FilterPopover.vue';
// (No importamos Pagination.vue porque el código de paginación está en este mismo template)

// --- Datos Hardcodeados ---
const allCompetitors = ref([
  { id: 1, name: "Juan Pérez García", category: "Kata Senior Masculino", belt: "Cinturón Negro 3º Dan", club: "Dojo Madrid" },
  { id: 2, name: "María López Ruiz", category: "Kumite Senior Femenino", belt: "Cinturón Negro 2º Dan", club: "Karate Valencia" },
  { id: 3, name: "Carlos Martínez", category: "Kata Junior Masculino", belt: "Cinturón Marrón", club: "Club Deportivo Toledo" },
  { id: 4, name: "Ana Sánchez", category: "Kumite Junior Femenino", belt: "Cinturón Negro 1º Dan", club: "Dojo Barcelona" },
  { id: 5, name: "Pedro Rodríguez", category: "Kata Senior Masculino", belt: "Cinturón Negro 4º Dan", club: "Karate Sevilla" },
  { id: 6, name: "Laura Fernández", category: "Kata Senior Femenino", belt: "Cinturón Negro 2º Dan", club: "Dojo Madrid" },
  { id: 7, name: "Roberto García López", category: "Kumite Senior Masculino", belt: "Cinturón Negro 1º Dan", club: "Club Deportivo Toledo" },
  { id: 8, name: "Elena Sánchez Ruiz", category: "Kata Junior Femenino", belt: "Cinturón Negro 2º Dan", club: "Karate Valencia" },
  { id: 9, name: "Diego Álvarez Castro", category: "Kumite Junior Masculino", belt: "Cinturón Marrón", club: "Dojo Barcelona" },
  { id: 10, name: "Carmen Ruiz Navarro", category: "Kumite Senior Femenino", belt: "Cinturón Negro 3º Dan", club: "Karate Sevilla" },
]);

// --- Estado de Filtros y Paginación ---
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(5);
const filters = ref({ club: "all" });

// --- Lógica de Filtros ---
const uniqueClubs = computed(() => [...new Set(allCompetitors.value.map(c => c.club).filter(Boolean))].sort());

const filteredCompetitors = computed(() => {
  return allCompetitors.value.filter(c => {
    const lowerQuery = searchQuery.value.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(lowerQuery) || 
                          c.category.toLowerCase().includes(lowerQuery);
    const matchesClub = filters.value.club === 'all' || c.club === filters.value.club;
    return matchesSearch && matchesClub;
  });
});

const hasActiveFilters = computed(() => filters.value.club !== 'all');
const activeFilterCount = computed(() => (filters.value.club !== 'all' ? 1 : 0));

const clearFilters = () => {
  filters.value = { club: "all" };
  currentPage.value = 1;
};

// --- Lógica de Paginación ---
const totalPages = computed(() => Math.max(1, Math.ceil(filteredCompetitors.value.length / itemsPerPage.value)));
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => startIndex.value + itemsPerPage.value);
const filteredPaginatedCategories = computed(() => filteredCompetitors.value.slice(startIndex.value, endIndex.value));

// --- Lógica de DataTable ---
const tableColumns = ref([
  { key: 'name', label: 'Nombre' }, // Usará el slot #name
  { key: 'category', label: 'Categoría' },
  { key: 'belt', label: 'Grado' },
  { key: 'club', label: 'Club' },
  // 'Acciones' es manejado por el slot #actions
])

// --- Watcher para resetear la página ---
watch([searchQuery, filters, itemsPerPage], () => {
    currentPage.value = 1;
}, { deep: true });

// --- Handlers ---
const handleAddCompetitor = () => {
  alert("Abrir modal para añadir competidor (pendiente)");
};
const viewDetails = (id: number) => {
  alert(`Ver detalles del competidor ${id} (pendiente)`);
};
const handleEdit = (id: number) => {
  alert(`Editar competidor ${id} (pendiente)`);
};
const handleDelete = (id: number) => {
  if (confirm(`¿Estás seguro de eliminar al competidor ${id}?`)) {
    // Lógica simulada de eliminación
    allCompetitors.value = allCompetitors.value.filter(c => c.id !== id);
    alert(`Competidor ${id} eliminado (simulado)`);
  }
};

// --- Funciones Auxiliares ---
const getInitials = (name: string): string => {
  if (!name) return "??";
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
};
</script>