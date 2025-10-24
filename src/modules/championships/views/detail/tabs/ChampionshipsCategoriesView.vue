<template>
  <div> <div class="grid gap-4 md:grid-cols-4 mb-6">
      <div class="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <p class="text-sm text-gray-500">Total Categorías</p>
        <p class="text-2xl font-bold mt-1">{{ categoriasData.length }}</p>
      </div>
      <div class="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <p class="text-sm text-gray-500">Categorías Filtradas</p> <p class="text-2xl font-bold mt-1">{{ filteredCategorias.length }}</p>
      </div>
      <div class="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <p class="text-sm text-gray-500">Total Inscritos (Todas)</p> <p class="text-2xl font-bold mt-1">{{ totalInscritos }}</p>
      </div>
      <div class="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <p class="text-sm text-gray-500">Promedio Inscritos (Todas)</p> <p class="text-2xl font-bold mt-1">{{ promedioInscritos }}</p>
      </div>
    </div>

    <div class="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-4 items-center">
        <div class="relative flex-1 w-full sm:w-auto">
           <LucideSearch class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
           <input v-model="searchTerm" type="text" placeholder="Buscar categoría..." class="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 focus:border-gray-400 focus:outline-none focus:ring-0"/>
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
                  <div><label for="filter-tipo" class="block text-sm font-medium text-gray-700 mb-1">Tipo</label><select v-model="filters.tipo" id="filter-tipo" class="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"><option value="all">Todos</option><option value="Kata">Kata</option><option value="Kumite">Kumite</option></select></div>
                  <div><label for="filter-edad" class="block text-sm font-medium text-gray-700 mb-1">Rango Edad</label><select v-model="filters.rangoEdad" id="filter-edad" class="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"><option value="all">Todos</option><option value="10-13 años">10-13 años</option><option value="14-17 años">14-17 años</option><option value="18+ años">18+ años</option></select></div>
                  <div><label for="filter-cinturon" class="block text-sm font-medium text-gray-700 mb-1">Nivel Cinturón</label><select v-model="filters.nivelCinturon" id="filter-cinturon" class="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"><option value="all">Todos</option><option value="Todos los niveles">Todos los niveles</option><option value="Cinturón Negro">Cinturón Negro</option></select></div>
                </div>
            </div>
        </div>
      </div>
    </div>

    <div class="mb-6">
      <div v-if="paginatedCategorias.length === 0" class="text-center py-12 text-gray-500">
        <LucideInbox class="h-10 w-10 mx-auto mb-3 text-gray-400" />
        <p>No se encontraron categorías con los filtros aplicados.</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="categoria in paginatedCategorias" :key="categoria.id"
             class="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between gap-4">
          <div class="flex-1">
            <h3 class="font-semibold text-lg mb-2 line-clamp-1">{{ categoria.nombre }}</h3>
            <div class="flex items-center gap-2 text-gray-500">
              <LucideUsers class="w-4 h-4 shrink-0" />
              <span class="text-sm">{{ categoria.inscritos }} participantes</span>
            </div>
             </div>
          <button @click="viewDetails(categoria.id)" class="shrink-0 inline-flex h-9 items-center justify-center rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            Ver Detalles
          </button>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 0" class="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 bg-white rounded-b-lg shadow-sm">
       <div class="text-sm text-gray-500">
           Mostrando {{ startIndex + 1 }} - {{ Math.min(endIndex, filteredCategorias.length) }} de {{ filteredCategorias.length }} categorías
       </div>
       <div class="flex items-center gap-2">
           <select
             v-model="itemsPerPage"
             @change="currentPage = 1"
             class="h-9 rounded-md border border-gray-300 bg-white py-1 px-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"
           >
             <option :value="3">3 / pág.</option>
             <option :value="6">6 / pág.</option>
             <option :value="9">9 / pág.</option>
             <option :value="12">12 / pág.</option>
           </select>
           <nav role="navigation" aria-label="pagination" class="flex">
             <ul class="flex flex-row items-center gap-1">
               <li><button @click="goToPage(1)" :disabled="currentPage === 1" aria-label="Ir a la primera página" class="h-9 w-9 flex items-center justify-center rounded-md border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronsLeft class="h-4 w-4" /></button></li>
               <li><button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="h-9 flex items-center gap-1 px-3 py-2 text-sm rounded-md border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft class="h-4 w-4" /><span>Anterior</span></button></li>
               <li v-for="page in visiblePages" :key="page">
                 <button v-if="typeof page === 'number'" @click="goToPage(page)" class="flex h-9 w-9 items-center justify-center rounded-md border text-sm transition-all" :class="[currentPage === page ? 'bg-red-600 text-white border-red-600 cursor-default' : 'hover:bg-gray-100']" :aria-current="currentPage === page ? 'page' : undefined">{{ page }}</button>
                 <span v-else class="flex h-9 w-9 items-center justify-center text-sm">...</span> </li>
               <li><button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="h-9 flex items-center gap-1 px-3 py-2 text-sm rounded-md border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><span>Siguiente</span><ChevronRight class="h-4 w-4" /></button></li>
               <li><button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" aria-label="Ir a la última página" class="h-9 w-9 flex items-center justify-center rounded-md border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronsRight class="h-4 w-4" /></button></li>
             </ul>
           </nav>
       </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
// 👇 Añadimos LucideUsers y LucideInbox
import { LucideSearch, LucideFilter, LucideX, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, LucideUsers, LucideInbox } from 'lucide-vue-next';

// --- Interfaces y Datos Hardcodeados ---
interface Category {
  id: number;
  nombre: string;
  tipo: 'Kata' | 'Kumite';
  rangoEdad: string;
  nivelCinturon: string;
  inscritos: number;
}
const categoriasData = ref<Category[]>([
  { id: 1, nombre: "Kata Senior Masculino", tipo: "Kata", rangoEdad: "18+ años", nivelCinturon: "Todos los niveles", inscritos: 12 },
  { id: 2, nombre: "Kumite Senior Femenino", tipo: "Kumite", rangoEdad: "18+ años", nivelCinturon: "Todos los niveles", inscritos: 8 },
  { id: 3, nombre: "Kata Junior Masculino", tipo: "Kata", rangoEdad: "14-17 años", nivelCinturon: "Todos los niveles", inscritos: 15 },
  { id: 4, nombre: "Kumite Junior Femenino", tipo: "Kumite", rangoEdad: "14-17 años", nivelCinturon: "Todos los niveles", inscritos: 10 },
  { id: 5, nombre: "Kata Infantil Masculino", tipo: "Kata", rangoEdad: "10-13 años", nivelCinturon: "Todos los niveles", inscritos: 18 },
  { id: 6, nombre: "Kumite Infantil Femenino", tipo: "Kumite", rangoEdad: "10-13 años", nivelCinturon: "Todos los niveles", inscritos: 14 },
  { id: 7, nombre: "Kata Senior Negro", tipo: "Kata", rangoEdad: "18+ años", nivelCinturon: "Cinturón Negro", inscritos: 7 },
  { id: 8, nombre: "Kumite Senior Negro", tipo: "Kumite", rangoEdad: "18+ años", nivelCinturon: "Cinturón Negro", inscritos: 5 },
]);

// --- Estado de Filtros y Paginación ---
const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(6);
const filters = ref({ tipo: "all", rangoEdad: "all", nivelCinturon: "all" });
const showFilterPopover = ref(false);
const filterPopoverRef = ref<HTMLElement | null>(null);

// --- Computed Properties ---
const filteredCategorias = computed<Category[]>(() => {
  return categoriasData.value.filter(cat => {
    const matchesSearch = cat.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()); // Solo buscar por nombre
    const matchesTipo = filters.value.tipo === 'all' || cat.tipo === filters.value.tipo;
    const matchesRango = filters.value.rangoEdad === 'all' || cat.rangoEdad === filters.value.rangoEdad;
    const matchesNivel = filters.value.nivelCinturon === 'all' || cat.nivelCinturon === filters.value.nivelCinturon;
    return matchesSearch && matchesTipo && matchesRango && matchesNivel;
  });
});
const hasActiveFilters = computed<boolean>(() => filters.value.tipo !== 'all' || filters.value.rangoEdad !== 'all' || filters.value.nivelCinturon !== 'all');
const activeFilterCount = computed<number>(() => (filters.value.tipo !== 'all' ? 1 : 0) + (filters.value.rangoEdad !== 'all' ? 1 : 0) + (filters.value.nivelCinturon !== 'all' ? 1 : 0));
const totalPages = computed<number>(() => Math.max(1, Math.ceil(filteredCategorias.value.length / itemsPerPage.value))); // Asegura al menos 1 página
const startIndex = computed<number>(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed<number>(() => startIndex.value + itemsPerPage.value);
const paginatedCategorias = computed<Category[]>(() => filteredCategorias.value.slice(startIndex.value, endIndex.value));
const totalInscritos = computed<number>(() => categoriasData.value.reduce((sum, cat) => sum + cat.inscritos, 0));
const promedioInscritos = computed<number>(() => categoriasData.value.length > 0 ? Math.round(totalInscritos.value / categoriasData.value.length) : 0);
const visiblePages = computed<(number | string)[]>(() => {
  const total = totalPages.value
  const current = currentPage.value
  const range = 2; const pages: (number | string)[] = []; const start = Math.max(1, current - range); const end = Math.min(total, current + range);
  if (start > 1) { pages.push(1); if (start > 2) pages.push('...'); }
  for (let i = start; i <= end; i++) { pages.push(i); }
  if (end < total) { if (end < total - 1) pages.push('...'); pages.push(total); }
  return pages;
});

// --- Handlers ---
const goToPage = (page: number | string) => {
  if (typeof page === 'string') return;
  if (page >= 1 && page <= totalPages.value) { currentPage.value = page; }
};
const clearFilters = () => { filters.value = { tipo: "all", rangoEdad: "all", nivelCinturon: "all" }; searchTerm.value = ''; currentPage.value = 1; showFilterPopover.value = false; };
const toggleFilterPopover = () => { showFilterPopover.value = !showFilterPopover.value; };
const viewDetails = (id: number) => { alert(`Ver detalles de categoría ${id} (pendiente)`); };
const handleClickOutside = (event: MouseEvent) => {
    if (filterPopoverRef.value && !filterPopoverRef.value.contains(event.target as Node)) {
        const triggerButton = (event.target as Element).closest('button');
        const triggerButtonHasFilterIcon = triggerButton?.querySelector('svg.lucide-filter');
        if (!triggerButtonHasFilterIcon) { showFilterPopover.value = false; }
    }
};
onMounted(() => { document.addEventListener('click', handleClickOutside); });
onBeforeUnmount(() => { document.removeEventListener('click', handleClickOutside); });

</script>