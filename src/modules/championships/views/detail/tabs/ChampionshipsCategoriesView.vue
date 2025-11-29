<template>
  <div> 
    <div class="grid gap-4 md:grid-cols-4 mb-6">
      <div class="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <p class="text-sm text-gray-500">Total Categorías</p>
        <p class="text-2xl font-bold mt-1">{{ championshipCategories.length }}</p> 
      </div>
      <div class="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <p class="text-sm text-gray-500">Categorías Filtradas</p>
         <p class="text-2xl font-bold mt-1">{{ filteredCategorias.length }}</p>
      </div>
      <div class="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <p class="text-sm text-gray-500">Total Inscritos (Filtrados)</p>
         <p class="text-2xl font-bold mt-1">{{ totalFilteredParticipants }}</p> 
      </div>
      <div class="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <p class="text-sm text-gray-500">Promedio Inscritos (Filtrados)</p>
         <p class="text-2xl font-bold mt-1">{{ averageParticipantsPerFilteredCategory }}</p> 
      </div>
    </div>

    <div class="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-4 items-center">
        <div class="relative flex-1 w-full sm:w-auto">
           <LucideSearch class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
           <input v-model="searchTerm" @input="currentPage = 1" type="text" placeholder="Buscar por nombre, código, tipo..." class="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 focus:border-gray-400 focus:outline-none focus:ring-0"/>
        </div>
        <div class="relative w-full sm:w-auto">
            <button @click="toggleFilterPopover" :class="[
                'inline-flex w-full sm:w-auto items-center justify-center gap-2 whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                hasActiveFilters ? 'border-red-600 text-red-700 bg-red-50 hover:bg-red-100' : 'border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50'
             ]">
              <LucideFilter class="h-4 w-4" />
              Filtros {{ hasActiveFilters ? `(${activeFilterCount})` : '' }}
            </button>
            <div v-if="showFilterPopover" class="absolute right-0 z-10 mt-2 w-72 rounded-lg border border-gray-200 bg-white shadow-lg p-4" ref="filterPopoverRef">
                <div class="flex items-center justify-between mb-3"><h4 class="font-semibold text-sm">Filtros</h4><button v-if="hasActiveFilters" @click="clearFilters" class="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"><LucideX class="h-3 w-3" /> Limpiar</button></div>
                <div class="space-y-4">
                  <div><label for="filter-tipo" class="block text-sm font-medium text-gray-700 mb-1">Tipo</label><select v-model="filters.modality" @change="currentPage = 1" id="filter-tipo" class="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"><option value="all">Todos</option><option value="Kata">Kata</option><option value="Kumite">Kumite</option></select></div>
                  <div><label for="filter-edad" class="block text-sm font-medium text-gray-700 mb-1">Rango Edad</label><select v-model="filters.ageRangeLabel" @change="currentPage = 1" id="filter-edad" class="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"><option value="all">Todos</option><option v-for="age in uniqueAgeRanges" :key="age" :value="age">{{ age }}</option></select></div>
                  <div><label for="filter-cinturon" class="block text-sm font-medium text-gray-700 mb-1">Cinturón (Min)</label><select v-model="filters.beltMinName" @change="currentPage = 1" id="filter-cinturon" class="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"><option value="all">Todos</option><option v-for="belt in uniqueBeltNames" :key="belt" :value="belt">{{ belt }}</option></select></div>
                </div>
            </div>
        </div>
      </div>
    </div>

    <!-- Botones de Generación de Brackets - Solo para Administradores -->
    <div v-if="userRole !== 'Entrenador'" class="flex items-center justify-start gap-4 mb-6">
       <button 
           @click="handleGenerateBrackets"
           class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none bg-red-600 text-white hover:bg-red-700"
       >
           <LucideUsers class="h-4 w-4" />
           Generar Brackets
       </button>
       <BracketsPdfExport 
           :championship-id="championshipId"
           :championship-name="currentChampionship?.name"
       />
    </div>
    
    <div class="mb-6">
      <div v-if="loading" class="text-center py-12 text-gray-500">
        <LucideLoader2 class="h-10 w-10 mx-auto mb-3 text-gray-400 animate-spin" />
        <p>Cargando categorías...</p>
      </div>
      <div v-else-if="error" class="text-center py-12 text-red-500">
        <LucideAlertTriangle class="h-10 w-10 mx-auto mb-3" />
        <p>{{ error }}</p>
      </div>
      <div v-else-if="paginatedCategorias.length === 0" class="text-center py-12 text-gray-500">
        <LucideInbox class="h-10 w-10 mx-auto mb-3 text-gray-400" />
        <p>No se encontraron categorías con los filtros aplicados.</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="categoria in paginatedCategorias" :key="categoria.id"
             class="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between gap-4">
          <div class="flex-1">
            <!-- Título principal: código + modalidad + género -->
            <h3 class="font-semibold text-lg mb-1 line-clamp-1">
              {{ categoria.code ? `${categoria.code} - ` : '' }}{{ categoria.modality }} {{ categoria.gender }}
            </h3>
            <!-- Subtítulo: rango de edad y rango de cinturones (mostrar solo edades y rangos de grado) -->
            <p class="text-sm text-gray-500 mb-2">
              {{ categoria.ageRangeLabel }} • De {{ extractBeltRank(categoria.beltMinName) }} hasta {{ extractBeltRank(categoria.beltMaxName) }}
            </p>
            <div class="flex items-center gap-2 text-gray-500">
              <LucideUsers class="w-4 h-4 shrink-0" />
              <span class="text-sm">{{ categoria.participantCount }} participantes</span>
            </div>
          </div>
          <button @click="viewDetails(categoria.id)" class="shrink-0 inline-flex h-9 items-center justify-center rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            Ver Detalles
          </button>
        </div>
      </div>
    </div>

    <div v-if="!loading && !error && totalPages > 1" class="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 bg-white rounded-b-lg shadow-sm">
       <div class="text-sm text-gray-500">
           Mostrando {{ startIndex + 1 }} - {{ Math.min(endIndex, filteredCategorias.length) }} de {{ filteredCategorias.length }} categorías
       </div>
       <div class="flex items-center gap-2">
           <select
             v-model="itemsPerPage"
             class="h-9 rounded-md border border-gray-300 bg-white py-1 px-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"
           >
             <option :value="6">6 / pág.</option>
             <option :value="10">10 / pág.</option>
             <option :value="15">15 / pág.</option>
           </select>
           <nav role="navigation" aria-label="pagination" class="flex">
             <ul class="flex flex-row items-center gap-1">
               <li><button @click="goToPage(1)" :disabled="currentPage === 1" aria-label="Ir a la primera página" class="h-9 w-9 flex items-center justify-center rounded-md border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronsLeft class="h-4 w-4" /></button></li>
               <li><button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="h-9 flex items-center gap-1 px-3 py-2 text-sm rounded-md border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft class="h-4 w-4" /><span>Anterior</span></button></li>
               <li v-for="page in visiblePages" :key="page">
                 <button v-if="typeof page === 'number'" @click="goToPage(page)" class="flex h-9 w-9 items-center justify-center rounded-md border text-sm transition-all" :class="[currentPage === page ? 'bg-red-600 text-white border-red-600 cursor-default' : 'hover:bg-gray-100']" :aria-current="currentPage === page ? 'page' : undefined">{{ page }}</button>
                 <span v-else class="flex h-9 w-9 items-center justify-center text-sm">...</span>
               </li>
               <li><button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="h-9 flex items-center gap-1 px-3 py-2 text-sm rounded-md border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><span>Siguiente</span><ChevronRight class="h-4 w-4" /></button></li>
               <li><button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" aria-label="Ir a la última página" class="h-9 w-9 flex items-center justify-center rounded-md border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronsRight class="h-4 w-4" /></button></li>
             </ul>
           </nav>
       </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useChampionshipStore } from '@/modules/championships/store/championships.store';
import type { ChampionshipCategoryListItem } from '@/modules/championships/types/championships-categories.types';
import BracketsPdfExport from '@/modules/championships/components/brackets/BracketsPdfExport.vue';
// 💥 Importar todos los iconos
import { LucideSearch, LucideFilter, LucideX, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, LucideUsers, LucideInbox, LucideLoader2, LucideAlertTriangle } from 'lucide-vue-next';

// --- Store y Estado ---
const route = useRoute();
const championshipStore = useChampionshipStore();

const { 
  championshipCategories, 
  categoriesLoading: loading, 
  categoriesError: error,
  currentChampionship
} = storeToRefs(championshipStore);

// 💥 CORRECCIÓN: Desestructuramos las acciones del store
const { fetchChampionshipCategories, generateBrackets } = championshipStore as any; 

const championshipId = computed(() => Number(route.params.id));

// 👤 Obtener rol del usuario logueado
const userRole = ref<string | null>(localStorage.getItem("userRole"));

// --- Estado de Filtros y Paginación ---
const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(6); 
const filters = ref({
  modality: "all",
  ageRangeLabel: "all",
  beltMinName: "all",
});
const showFilterPopover = ref(false);
const filterPopoverRef = ref<HTMLElement | null>(null);

// --- Carga Inicial de Datos ---
onMounted(() => {
  if (championshipId.value && !isNaN(championshipId.value)) {
    fetchChampionshipCategories(championshipId.value, 1, 999); 
  } else {
    console.error("ID de campeonato inválido en la ruta.");
  }
});

// --- Computed Properties ---

const filteredCategorias = computed<ChampionshipCategoryListItem[]>(() => {
  if (!Array.isArray(championshipCategories.value)) {
    return [];
  }
  return championshipCategories.value.filter((cat: ChampionshipCategoryListItem) => {
    const lowerSearch = searchTerm.value.toLowerCase();
    const descriptiveName = composeSearchText(cat).toLowerCase();
    const matchesSearch = descriptiveName.includes(lowerSearch) || (cat.code && cat.code.toLowerCase().includes(lowerSearch));
    const matchesModality = filters.value.modality === 'all' || cat.modality === filters.value.modality;
    const matchesAge = filters.value.ageRangeLabel === 'all' || cat.ageRangeLabel === filters.value.ageRangeLabel;
    const matchesBelt = filters.value.beltMinName === 'all' || cat.beltMinName === filters.value.beltMinName;
    return matchesSearch && matchesModality && matchesAge && matchesBelt;
  });
});

const uniqueAgeRanges = computed(() => [...new Set(championshipCategories.value.map((c: any) => c.ageRangeLabel).filter(Boolean))].sort());
const uniqueBeltNames = computed(() => [...new Set(championshipCategories.value.map((c: any) => c.beltMinName).filter(Boolean))].sort());

const totalPages = computed<number>(() => Math.max(1, Math.ceil(filteredCategorias.value.length / itemsPerPage.value)));
const startIndex = computed<number>(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed<number>(() => startIndex.value + itemsPerPage.value);
const paginatedCategorias = computed<ChampionshipCategoryListItem[]>(() => filteredCategorias.value.slice(startIndex.value, endIndex.value));

// 4. Estadísticas (CORREGIDO: Usaremos los valores computados)
const totalFilteredParticipants = computed<number>(() => filteredCategorias.value.reduce((sum, cat) => sum + cat.participantCount, 0));
const averageParticipantsPerFilteredCategory = computed<number | string>(() => {
    if (filteredCategorias.value.length === 0) return 0;
    return Math.round(totalFilteredParticipants.value / filteredCategorias.value.length);
});


// 5. Filtros activos (sin cambios)
const hasActiveFilters = computed<boolean>(() => filters.value.modality !== 'all' || filters.value.ageRangeLabel !== 'all' || filters.value.beltMinName !== 'all');
const activeFilterCount = computed<number>(() => (filters.value.modality !== 'all' ? 1 : 0) + (filters.value.ageRangeLabel !== 'all' ? 1 : 0) + (filters.value.beltMinName !== 'all' ? 1 : 0));

// 6. Paginación (sin cambios)
const visiblePages = computed<(number | string)[]>(() => {
  const total = totalPages.value
  const current = currentPage.value
  const range = 2; const pages: (number | string)[] = []; const start = Math.max(1, current - range); const end = Math.min(total, current + range);
  if (start > 1) { pages.push(1); if (start > 2) pages.push('...'); }
  for (let i = start; i <= end; i++) { pages.push(i); }
  if (end < total) { if (end < total - 1) pages.push('...'); pages.push(total); }
  return pages;
});

// --- Watcher para resetear la página ---
watch([searchTerm, filters, itemsPerPage], () => {
    currentPage.value = 1;
}, { deep: true });

// --- Handlers (sin cambios) ---
const goToPage = (page: number | string) => {
  if (typeof page === 'string') return;
  if (page >= 1 && page <= totalPages.value) { currentPage.value = page; }
};
const clearFilters = () => { filters.value = { modality: "all", ageRangeLabel: "all", beltMinName: "all" }; searchTerm.value = ''; showFilterPopover.value = false; };
const toggleFilterPopover = () => { showFilterPopover.value = !showFilterPopover.value; };
const viewDetails = (categoryId: number) => { alert(`Ver detalles de categoría ${categoryId} (pendiente)`); };
const handleClickOutside = (event: MouseEvent) => {
    if (filterPopoverRef.value && !filterPopoverRef.value.contains(event.target as Node)) {
        const triggerButton = (event.target as Element).closest('button');
        const triggerButtonHasFilterIcon = triggerButton?.querySelector('svg.lucide-filter');
        if (!triggerButtonHasFilterIcon) { showFilterPopover.value = false; }
    }
};
onMounted(() => { document.addEventListener('click', handleClickOutside); });
onBeforeUnmount(() => { document.removeEventListener('click', handleClickOutside); });

// --- Handlers de Brackets ---
const handleGenerateBrackets = async () => {
    if (championshipId.value) {
        try {
            // 1. Llamar a la acción (que ahora devuelve el mensaje)
            const response: any = await generateBrackets(championshipId.value);
            
            // 2. 💥 Mostrar el "Toast" de éxito
            alert(response.message || "Brackets generados exitosamente.");
            
        } catch (e: any) {
            // 3. 💥 Mostrar el "Toast" de error
            alert("Error al generar brackets: " + (e.message || "Error desconocido"));
        }
    }
};

// --- Funciones Auxiliares (sin cambios) ---
function composeSearchText(cat: ChampionshipCategoryListItem): string {
  return [
    cat.code ?? '',
    cat.modality,
    cat.gender,
    cat.ageRangeLabel,
    cat.weight ?? '',
    cat.beltMinName,
    cat.beltMaxName,
  ].filter(Boolean).join(' ');
}

/**
 * Extrae la parte de grado (ej. "7mo Kyu") desde el nombre completo del cinturón.
 * Si no encuentra un patrón numérico, intenta detectar "negro" u devuelve el texto final.
 */
function extractBeltRank(name?: string): string {
  if (!name) return '';
  const rankRegex = /(\d+(?:er|ro|to|mo)?\s*[Kk]yu)/;
  const m = name.match(rankRegex);
  if (m && m[1]) return m[1].toLowerCase();
  if (/negro/i.test(name)) return 'negro';
  const parts = name.trim().split(/\s+/);
  return parts.slice(-2).join(' ').toLowerCase();
}
</script>