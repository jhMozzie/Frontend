<template>
  <div> <!-- Contenedor principal para la pestaña -->
    <!-- Filters -->
    <div class="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="relative flex-1">
          <LucideSearch class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar competidor por nombre..."
            class="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 focus:border-gray-400 focus:outline-none focus:ring-0"
          />
        </div>
        <button @click="openFilters" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-gray-300 bg-transparent px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <LucideFilter class="h-4 w-4" />
          Filtros (Ej: Academia)
        </button>
      </div>
    </div>

    <!-- Competitors List Table -->
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full w-full">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Categoría</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Grado</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Club</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
             <tr v-if="paginatedCompetitors.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-sm text-gray-500">
                    No se encontraron competidores.
                </td>
            </tr>
            <tr v-for="competitor in paginatedCompetitors" :key="competitor.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="whitespace-nowrap px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
                    {{ getInitials(competitor.name) }}
                  </div>
                  <span class="text-sm font-medium text-gray-900">{{ competitor.name }}</span>
                </div>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{{ competitor.category }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{{ competitor.belt }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ competitor.club }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
                <button @click="viewDetails(competitor.id)" class="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50">
                  Ver Detalles
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Paginación -->
       <div v-if="totalPages > 1" class="border-t border-gray-200 px-6 py-4">
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
import { ref, computed } from 'vue';
import { LucideSearch, LucideFilter } from 'lucide-vue-next';
import Pagination from '@/components/ui/Pagination.vue'; // Asumiendo que existe

// --- Datos Hardcodeados ---
const competitors = ref([
  { id: 1, name: "Juan Pérez García", category: "Kata Senior Masculino", belt: "Cinturón Negro 3º Dan", club: "Dojo Madrid" },
  { id: 2, name: "María López Ruiz", category: "Kumite Senior Femenino", belt: "Cinturón Negro 2º Dan", club: "Karate Valencia" },
  { id: 3, name: "Carlos Martínez", category: "Kata Junior Masculino", belt: "Cinturón Marrón", club: "Club Deportivo Toledo" },
  { id: 4, name: "Ana Sánchez", category: "Kumite Junior Femenino", belt: "Cinturón Negro 1º Dan", club: "Dojo Barcelona" },
  { id: 5, name: "Pedro Rodríguez", category: "Kata Senior Masculino", belt: "Cinturón Negro 4º Dan", club: "Karate Sevilla" },
  { id: 6, name: "Laura Fernández", category: "Kata Senior Femenino", belt: "Cinturón Negro 2º Dan", club: "Dojo Madrid" },
  // ... puedes añadir más para probar paginación ...
]);

// --- Estado de Filtros y Paginación ---
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(5); // Mostrar 5 por página

// --- Lógica de Filtrado (solo nombre por ahora) ---
const filteredCompetitors = computed(() => {
  if (!searchQuery.value) {
    return competitors.value;
  }
  const query = searchQuery.value.toLowerCase();
  return competitors.value.filter(c => c.name.toLowerCase().includes(query));
});

// --- Lógica de Paginación ---
const totalPages = computed(() => Math.ceil(filteredCompetitors.value.length / itemsPerPage.value));
const paginatedCompetitors = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredCompetitors.value.slice(start, end);
});

// --- Handlers ---
const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const openFilters = () => {
  alert("Funcionalidad de filtros avanzada pendiente.");
};

const viewDetails = (id: number) => {
  alert(`Ver detalles del competidor ${id} (pendiente).`);
};

// --- Funciones Auxiliares ---
const getInitials = (name: string): string => {
  if (!name) return "??";
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
};
</script>