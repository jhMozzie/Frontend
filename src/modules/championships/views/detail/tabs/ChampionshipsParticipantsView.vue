<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4">
      
      <div class="flex items-center gap-4 flex-wrap">
        <div class="relative flex-1 w-full sm:w-auto">
          <LucideSearch class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="main-search-input" v-model="searchQuery"
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
                  <select v-model="filters.academyName" id="filter-academy" class="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-0">
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

    <div v-if="loading" class="text-center py-10 text-gray-500">
        <LucideLoader2 class="h-6 w-6 animate-spin mx-auto mb-2" />
        Cargando participantes...
    </div>
    <div v-else-if="error" class="text-center py-10 text-red-500">
        <LucideAlertTriangle class="h-6 w-6 mx-auto mb-2" />
        {{ error }}
    </div>

    <div v-else class="rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
      <DataTable :data="championshipParticipants" :columns="tableColumns">
        
        <template #studentName="{ item }">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
              {{ getInitials(item.studentName) }}
            </div>
            <span class="text-sm font-medium text-gray-900">{{ item.studentName }}</span>
          </div>
        </template>

        <template #actions="{ item }">
          <div class="flex justify-end gap-3 whitespace-nowrap">
            <button @click="handleEdit(item.id)" class="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900" title="Editar Inscripciones">
              <LucidePencil class="w-4 h-4" />
            </button>
            
            <button @click="viewDetails(item.id)" class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800" title="Ver Detalles">
              <LucideEye class="w-4 h-4" />
            </button>
            <button @click="handleDelete(item.id)" class="inline-flex items-center gap-1 text-red-600 hover:text-red-800" title="Eliminar">
              <LucideTrash2 class="w-4 h-4" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <div v-if="!loading && !error && totalPages > 1" class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 mt-4 border-t border-gray-200">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">Mostrar:</span>
        <select
          v-model="itemsPerPage"
          @change="handleLimitChange"
          class="h-9 rounded-md border border-gray-300 bg-white py-1 px-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
        </select>
        <span class="text-sm text-gray-500">
          resultados ({{ (participantsMeta.page - 1) * participantsMeta.limit + 1 }} -
          {{ Math.min(participantsMeta.page * participantsMeta.limit, participantsMeta.total) }}
          de {{ participantsMeta.total }})
        </span>
      </div>
      <div class="flex items-center gap-2">
         <span class="text-sm text-gray-500">Página {{ participantsMeta.page }} de {{ totalPages }}</span>
        <button
          @click="changePage(participantsMeta.page - 1)"
          :disabled="participantsMeta.page === 1"
          class="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LucideChevronLeft class="w-4 h-4 mr-1" /> Anterior
        </button>
        <button
          @click="changePage(participantsMeta.page + 1)"
          :disabled="participantsMeta.page === totalPages"
          class="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente <LucideChevronRight class="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>

    <Teleport to="body">
      <ParticipantFormModal
        v-if="isModalOpen"
        :championship-id="championshipId"
        :is-saving="isSaving"
        :error="modalError"
        @close="isModalOpen = false"
        
        @save="handleSaveParticipant"
        
        :initial-student-id="editingParticipant?.studentId"
        :initial-student-name="editingParticipant?.studentName"
        :initial-inscriptions="editingParticipant?.initialInscriptions"
        
        :editing-participant-id="editingParticipant?.participantId" 
        
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useChampionshipStore } from '@/modules/championships/store/championships.store';
import type { ParticipantListParams, CreateParticipantPayload, Inscription } from '@/modules/championships/types/participants.types';
import { 
  LucideSearch, LucideFilter, LucidePlus, LucideEye, LucidePencil, 
  LucideTrash2, LucideX, LucideChevronLeft, LucideChevronRight,
  LucideLoader2, LucideAlertTriangle
} from 'lucide-vue-next';
import DataTable from '@/components/ui/DataTable.vue';
import FilterPopover from '@/components/ui/FilterPopover.vue';
import ParticipantFormModal from '@/modules/championships/components/create/ParticipantFormModal.vue'; 

// --- Store y Estado ---
const route = useRoute();
const championshipStore = useChampionshipStore();

// 💥 CLAVE: Desestructuramos groupInscriptions y updateParticipantInscription
const { fetchParticipants, deleteParticipant, createParticipant, updateParticipantInscription, groupInscriptions } = useChampionshipStore() as any; 

const { 
  championshipParticipants, 
  participantsMeta, 
  participantsLoading: loading, 
  participantsError: error,
  currentChampionship 
} = storeToRefs(championshipStore);

const championshipId = computed(() => Number(route.params.id));

// --- Estado del Modal y Edición ---
const isModalOpen = ref(false);
const isSaving = ref(false); 
const modalError = ref<string | null>(null); 

// 💥 ESTADO DE EDICIÓN
const editingParticipant = ref<{ participantId: number; studentId: number; studentName: string; initialInscriptions: Inscription[] } | null>(null);

// --- Computed Properties (sin cambios) ---
const searchQuery = ref('');
const itemsPerPage = ref(5);
const filters = ref({ 
  academyName: "all",
  categoryId: 'all' as 'all' | number 
});
const totalPages = computed(() => participantsMeta.value.totalPages);

const uniqueClubs = computed(() => {
    // 💡 El filtro debe iterar sobre el array de inscripciones individuales
    const clubs = championshipParticipants.value.map((p: any) => p.academyName).filter(Boolean);
    return [...new Set(clubs as string[])].sort();
});

const hasActiveFilters = computed(() => 
    filters.value.academyName !== 'all' || 
    searchQuery.value !== '' || 
    filters.value.categoryId !== 'all'
);
const activeFilterCount = computed(() => 
    (filters.value.academyName !== 'all' ? 1 : 0) + 
    (searchQuery.value !== '' ? 1 : 0) +
    (filters.value.categoryId !== 'all' ? 1 : 0)
);

const tableColumns = ref([
  { key: 'studentName', label: 'Nombre' }, 
  { key: 'categoryName', label: 'Categoría' }, 
  { key: 'beltName', label: 'Grado' }, 
  { key: 'academyName', label: 'Club' }, 
]);

const fetchData = (page: number) => {
    const params: ParticipantListParams = {
        page: page,
        limit: itemsPerPage.value,
        championshipId: championshipId.value,
        categoryId: filters.value.categoryId !== 'all' ? filters.value.categoryId : undefined,
    };
    fetchParticipants(params);
    
    // 💥 IMPRESIÓN PARA DIAGNÓSTICO
    console.log("--- DEBUG TABLA DATOS ---");
    console.log("Datos de la tabla (championshipParticipants):", championshipParticipants.value);
    console.log("-------------------------");
};

const handleLimitChange = () => {
    fetchData(1);
};

const changePage = (page: number) => {
    if (page < 1 || page > totalPages.value) return;
    fetchData(page);
};

watch([searchQuery, filters], () => {
    // handleSearchOrFilterChange(); 
}, { deep: true });

const clearFilters = () => {
  filters.value = { academyName: "all", categoryId: 'all' };
  searchQuery.value = '';
  fetchData(1);
};

// --- Handlers de Acción (Creación/Edición/Añadir Individual) ---

const handleAddCompetitor = () => { 
  modalError.value = null;
  editingParticipant.value = null; // MODO CREAR
  isModalOpen.value = true;
};

// 💥 IMPLEMENTACIÓN: handleEdit (Edición Granular por FILA)
const handleEdit = async (participantIdToEdit: number) => {
  modalError.value = null;
  isSaving.value = true;

  try {
    // Buscamos el objeto de INSCRIPCIÓN individual de la tabla
    const singleInscriptionData: any = championshipParticipants.value.find((p: any) => p.id === participantIdToEdit); 

    if (singleInscriptionData) {
        
        // Construimos la única inscripción inicial para el modal.
        const initialInscription: Inscription = {
            participantId: singleInscriptionData.id,
            categoryId: singleInscriptionData.championshipCategoryId,
            categoryName: singleInscriptionData.categoryName, 
        };

        // Configuramos el estado de edición
        editingParticipant.value = {
            participantId: singleInscriptionData.id, // ID de la inscripción a editar
            studentId: singleInscriptionData.studentId, 
            studentName: singleInscriptionData.studentName,
            
            // CLAVE: Pasamos SÓLO la inscripción de esta fila en un array.
            initialInscriptions: [initialInscription], 
        };
        isModalOpen.value = true;
    } else {
        throw new Error("Datos de la inscripción no encontrados.");
    }

  } catch (e: any) {
    modalError.value = e.message || 'Error al cargar los datos de edición.';
    console.error(e);
  } finally {
    isSaving.value = false;
  }
};


// 💥 HANDLER DE GUARDADO (Maneja CREAR y EDICIÓN GRANULAR)
const handleSaveParticipant = async (
  studentId: number, 
  currentCategoryIds: number[], 
  newCategoryIds: number[]      
) => {
    // Validaciones iniciales
    if (!currentChampionship.value) {
        modalError.value = "Error: El campeonato no está cargado. No se puede inscribir.";
        return;
    }
    if (studentId === 0 || newCategoryIds.length === 0) {
        modalError.value = "Debe seleccionar un estudiante y al menos una categoría.";
        return;
    }
    
    isSaving.value = true;
    modalError.value = null;

    try {
        if (editingParticipant.value) {
            
            // --- MODO EDICIÓN GRANULAR (Corrección de una sola categoría) ---
            
            // Requerimos que solo se seleccione una nueva categoría para la corrección
            if (newCategoryIds.length !== 1) {
                throw new Error("Error: En modo edición solo se puede seleccionar una categoría (la nueva corrección).");
            }
            
            const participantId = editingParticipant.value.participantId;
            const oldCategoryId = currentCategoryIds[0];
            const newCategoryId = newCategoryIds[0];
            
            if (oldCategoryId !== newCategoryId) {
                 // 💥 Llama a la acción de corrección unitaria (PATCH /participants/:id)
                 await updateParticipantInscription(participantId, newCategoryId); 
            }

        } else {
            // --- MODO CREAR (Múltiple) ---
            const payload: CreateParticipantPayload = {
                studentId: studentId,
                championshipId: currentChampionship.value!.id, 
                categoryIds: newCategoryIds
            };
            await createParticipant(payload);
        }
        
        isModalOpen.value = false;
        fetchData(participantsMeta.value.page); 
        
    } catch (e: any) {
        const errorMessage = e.response?.data?.message || e.message || 'Error al guardar los cambios.';
        modalError.value = errorMessage;
        console.error('Error al guardar participante:', e);
    } finally {
        isSaving.value = false;
        editingParticipant.value = null;
    }
};

const viewDetails = (id: number) => { alert(`Ver detalles de inscripción ${id} (pendiente)`); };
const handleDelete = async (id: number) => {
  if (confirm(`¿Estás seguro de eliminar esta inscripción (ID: ${id})?`)) {
    await deleteParticipant(id);
  }
};

// --- Funciones Auxiliares (sin cambios) ---
const getInitials = (name: string): string => {
  if (!name) return "??";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

onMounted(() => {
  fetchData(1);
});
</script>