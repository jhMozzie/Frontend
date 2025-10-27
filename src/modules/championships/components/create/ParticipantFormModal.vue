<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 transition-opacity duration-300 ease-out"
    @click.self="handleClose"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl" ref="modalContentRef">
      <div class="flex items-center justify-between border-b border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
        <button @click="handleClose" class="text-gray-400 hover:text-gray-600">
          <LucideX class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        
        <div>
          <label for="student-search" class="block text-sm font-medium text-gray-700 mb-1">Estudiante</label>
          <div class="relative">
            <input
                v-if="!selectedStudentName || isEditing"
                id="student-search"
                v-model="studentSearchQuery"
                :disabled="isEditing"
                type="text"
                placeholder="Buscar por nombre..."
                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-red-500 disabled:bg-gray-100"
                @focus="showStudentResults = true"
                @blur="hideStudentResults"
            />
            
            <input 
              v-else 
              :value="selectedStudentName" 
              disabled 
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-white text-gray-900 font-medium" 
            />
            
            <LucideSearch v-if="!selectedStudentName || isEditing" class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />

            <ul v-if="showStudentResults && filteredStudents.length > 0 && !isEditing" class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
              <li 
                v-for="student in filteredStudents" 
                :key="student.id"
                @mousedown.prevent="selectStudent(student.id, student.name)"
                class="px-3 py-2 cursor-pointer hover:bg-red-50 text-sm"
              >
                {{ student.name }}
              </li>
            </ul>
            <div v-else-if="showStudentResults && filteredStudents.length === 0 && studentSearchQuery.length > 0 && !isEditing" class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 p-2 text-sm text-gray-500">
                No se encontraron estudiantes.
            </div>
            
          </div>
        </div>
        
        <div v-if="selectedCategories.length > 0">
          <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
             Categorías Seleccionadas <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">{{ selectedCategories.length }}</span>
          </label>
          <div class="flex flex-wrap gap-2 p-3 rounded-md border border-red-300 bg-red-50">
            <span v-for="cat in selectedCategories" :key="cat.id" class="inline-flex items-center gap-1 text-xs font-medium bg-red-600 text-white px-2.5 py-1 rounded-full">
              {{ cat.code }}
              <button @click="unselectCategory(cat.id)" class="ml-0.5 text-white/80 hover:text-white" title="Quitar">
                <LucideX class="w-3 h-3" />
              </button>
            </span>
          </div>
        </div>

        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-medium text-gray-700">Categorías Disponibles</label>
            <div class="flex space-x-2 p-1 bg-gray-100 rounded-md text-sm">
                <button 
                    @click="categoryFilter = 'all'" 
                    :class="['px-3 py-1 rounded-md transition', categoryFilter === 'all' ? 'bg-white shadow text-red-600' : 'text-gray-600 hover:bg-gray-200']"
                >
                    Todas
                </button>
                <button 
                    @click="categoryFilter = 'Kumite'" 
                    :class="['px-3 py-1 rounded-md transition', categoryFilter === 'Kumite' ? 'bg-white shadow text-red-600' : 'text-gray-600 hover:bg-gray-200']"
                >
                    Kumite
                </button>
                <button 
                    @click="categoryFilter = 'Kata'" 
                    :class="['px-3 py-1 rounded-md transition', categoryFilter === 'Kata' ? 'bg-white shadow text-red-600' : 'text-gray-600 hover:bg-gray-200']"
                >
                    Kata
                </button>
            </div>
          </div>

          <div v-if="categoriesLoading" class="text-center text-gray-500 py-4">
            <LucideLoader2 class="w-5 h-5 animate-spin mx-auto" />
          </div>
          <div v-else-if="categoriesError" class="text-center text-red-500 py-4">
            {{ categoriesError }}
          </div>
          <div v-else-if="filteredCategories.length === 0" class="text-center text-gray-500 py-4 border rounded-md">
            No hay categorías disponibles con los filtros actuales.
          </div>
          <div v-else class="space-y-3 max-h-64 overflow-y-auto rounded-md border p-4">
            <div v-for="category in filteredCategories" :key="category.id" class="flex items-center">
              <input 
                :id="`cat-${category.id}`" 
                type="checkbox" 
                :value="category.id"
                v-model="selectedCategoryIds"
                class="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <label :for="`cat-${category.id}`" class="ml-3 text-sm text-gray-700 cursor-pointer">
                <span class="font-medium">{{ category.code }}</span> - {{ generateCategoryName(category) }}
                <span class="text-xs text-gray-500">({{ category.participantCount }} inscritos)</span>
              </label>
            </div>
          </div>
        </div>
        
        <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
      </div>

      <div class="flex justify-end gap-3 border-t border-gray-200 p-6 bg-gray-50">
        <button
          @click="handleClose"
          class="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 text-sm"
        >
          Cancelar
        </button>
        <button
          @click="handleSave"
          :disabled="isSaving || selectedStudentId === 0 || selectedCategoryIds.length === 0"
          class="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm disabled:opacity-50"
        >
           <LucideLoader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
          {{ isEditing ? 'Guardar Cambios' : 'Inscribir Competidor' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { LucideX, LucideLoader2, LucideSearch, LucideUsers } from 'lucide-vue-next'; // 💡 Asegúrate de tener LucideUsers importado si lo usas en el futuro
import { useChampionshipStore } from '@/modules/championships/store/championships.store';
import { storeToRefs } from 'pinia';
import type { Inscription } from '@/modules/championships/types/participants.types';
import type { ChampionshipCategoryListItem } from '@/modules/championships/types/championships-categories.types';

// --- DEFINICIÓN DE PROPS y EMITS (sin cambios) ---
const props = defineProps<{
  championshipId: number; 
  initialStudentId?: number; 
  initialInscriptions?: Inscription[]; 
  isSaving: boolean; 
  error: string | null; 
}>();

const emit = defineEmits<{
  (e: 'close'): void; 
  (e: 'save', studentId: number, currentCategoryIds: number[], newCategoryIds: number[]): void;
}>();

// --- STORE ---
const championshipStore = useChampionshipStore();
const { championshipCategories: allCategories, categoriesLoading, categoriesError } = storeToRefs(championshipStore);
const { fetchChampionshipCategories } = championshipStore;

// --- ESTADO INTERNO DEL FORMULARIO ---
const selectedStudentId = ref(0);
const selectedStudentName = ref(''); 
const selectedCategoryIds = ref<number[]>([]); 
const categoryFilter = ref<'all' | 'Kumite' | 'Kata'>('all');

// Declaraciones de búsqueda de estudiante
const studentSearchQuery = ref(''); 
const showStudentResults = ref(false); 


// --- LÓGICA DE EDICIÓN ---
const isEditing = computed(() => !!props.initialStudentId);
const title = computed(() => isEditing.value ? 'Editar Inscripciones' : 'Inscribir Competidor');

// watch (Manejo de Edición/Reset)
watch(() => props.initialStudentId, (newId) => {
  if (newId) {
    // Modo Edición: Llenamos los datos 
    selectedStudentId.value = newId;
    // La búsqueda se desactiva y el nombre se mostraría estático (si lo tuvieras)
    selectedCategoryIds.value = props.initialInscriptions?.map(inv => inv.categoryId) || [];
  } else {
    // Modo Crear: Reseteamos
    selectedStudentId.value = 0;
    selectedStudentName.value = ''; 
    studentSearchQuery.value = ''; 
    selectedCategoryIds.value = [];
  }
}, { immediate: true });

// --- LÓGICA DE CATEGORÍAS ---

// Filtra las categorías disponibles según el botón Kata/Kumite/Todas (sin cambios)
const filteredCategories = computed(() => {
    if (categoryFilter.value === 'all') {
        return allCategories.value;
    }
    return allCategories.value.filter(cat => cat.modality === categoryFilter.value);
});

// 💥 NUEVA COMPUTED PROPERTY: Mapea los IDs seleccionados a objetos de categoría
const selectedCategories = computed(() => {
    // Filtra el array completo de categorías para obtener solo las seleccionadas
    return allCategories.value.filter(cat => selectedCategoryIds.value.includes(cat.id));
});

// 💥 NUEVA FUNCIÓN: Para quitar una categoría desde la sección de seleccionadas
const unselectCategory = (categoryId: number) => {
    selectedCategoryIds.value = selectedCategoryIds.value.filter(id => id !== categoryId);
};


// --- LÓGICA DE ESTUDIANTES (Simulación) ---

const allStudentsMock = ref([
    { id: 1, name: 'Juan Pérez' },
    { id: 2, name: 'Carlos Ruiz' },
    { id: 3, name: 'Miguel Sanz' },
    { id: 4, name: 'Pedro López' },
    { id: 7, name: 'Ana Sánchez' },
    { id: 12, name: 'Carla Navarro' },
]);

const filteredStudents = computed(() => {
    if (!studentSearchQuery.value) return allStudentsMock.value;
    const query = studentSearchQuery.value.toLowerCase();
    return allStudentsMock.value.filter(student => 
        student.name.toLowerCase().includes(query)
    );
});

const selectStudent = (id: number, name: string) => {
    selectedStudentId.value = id;
    selectedStudentName.value = name;
    studentSearchQuery.value = name; 
    showStudentResults.value = false;
};

// 💥 CORRECCIÓN VISUAL: Añadimos un pequeño retraso y comprobamos si el foco se perdió
const hideStudentResults = () => {
    setTimeout(() => {
        // Solo oculta si no se ha seleccionado un elemento *y* si el campo de búsqueda no coincide con el nombre seleccionado
        if(selectedStudentId.value !== 0 && studentSearchQuery.value === selectedStudentName.value) {
            showStudentResults.value = false;
        } else {
            // Si el usuario escribió algo y luego hizo click fuera sin seleccionar, reseteamos la búsqueda
            if (selectedStudentId.value === 0) {
                 studentSearchQuery.value = '';
            }
            showStudentResults.value = false;
        }
    }, 150);
};

// --- Carga Inicial de Datos (sin cambios) ---
onMounted(() => {
  if (allCategories.value.length === 0) {
    fetchChampionshipCategories(props.championshipId, 1, 999);
  }
});


// --- HANDLERS (EMISIÓN DE EVENTOS) (sin cambios) ---
const handleClose = () => {
  emit('close');
};

const handleSave = () => {
  if (selectedStudentId.value === 0 || selectedCategoryIds.value.length === 0) {
    alert("Por favor, seleccione un estudiante y al menos una categoría.");
    return;
  }
  
  const currentCategoryIds = props.initialInscriptions?.map(inv => inv.categoryId) || [];
  const newCategoryIds = selectedCategoryIds.value;
  
  emit('save', selectedStudentId.value, currentCategoryIds, newCategoryIds);
};

// --- Funciones Auxiliares (sin cambios) ---
function generateCategoryName(cat: ChampionshipCategoryListItem): string {
    let name = `${cat.modality} ${cat.gender} ${cat.ageRangeLabel}`;
    if (cat.modality === 'Kumite' && cat.weight) {
        name += ` ${cat.weight}`;
    }
    return name;
}
</script>