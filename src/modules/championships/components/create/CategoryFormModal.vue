<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity duration-300 ease-out"
    @click.self="handleClose"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg" ref="modalContentRef">
      <div class="flex items-center justify-between border-b border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
        <button @click="handleClose" class="text-gray-400 hover:text-gray-600">
          <LucideX class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        <div>
          <label for="cat-code" class="block text-sm font-medium text-gray-700 mb-1">Código (Opcional)</label>
          <input
            id="cat-code"
            v-model="formData.code"
            type="text"
            placeholder="Ej. A1, B10"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-red-500"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="cat-modality" class="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
            <select
              id="cat-modality"
              v-model="formData.modality"
              @change="onModalityChange"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-red-500"
            >
              <option value="Kata">Kata</option>
              <option value="Kumite">Kumite</option>
            </select>
          </div>
          <div>
            <label for="cat-gender" class="block text-sm font-medium text-gray-700 mb-1">Género</label>
            <select
              id="cat-gender"
              v-model="formData.gender"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-red-500"
            >
              <option>Masculino</option>
              <option>Femenino</option>
              <option>Mixto</option>
            </select>
          </div>
        </div>

        <div>
          <label for="cat-age-range" class="block text-sm font-medium text-gray-700 mb-1">Rango de Edad</label>
          <select
            id="cat-age-range"
            v-model.number="formData.ageRangeId"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-red-500"
          >
            <option v-if="ageRanges.length === 0" disabled :value="undefined">Cargando rangos de edad...</option>
            <option v-for="range in ageRanges" :key="range.id" :value="range.id">
              {{ range.label }} ({{ range.minAge }}-{{ range.maxAge }} años)
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="cat-belt-min" class="block text-sm font-medium text-gray-700 mb-1">Cinturón Mínimo</label>
            <select
              id="cat-belt-min"
              v-model.number="formData.beltMinId"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-red-500"
            >
              <option v-if="belts.length === 0" disabled value="0">Cargando cinturones...</option>
              <option v-for="belt in belts" :key="belt.id" :value="belt.id">
                {{ belt.name }} ({{ belt.kyuLevel }} Kyu)
              </option>
            </select>
          </div>
          <div>
            <label for="cat-belt-max" class="block text-sm font-medium text-gray-700 mb-1">Cinturón Máximo</label>
            <select
              id="cat-belt-max"
              v-model.number="formData.beltMaxId"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-red-500"
            >
              <option v-if="belts.length === 0" disabled value="0">Cargando cinturones...</option>
               <option v-for="belt in belts" :key="belt.id" :value="belt.id">
                {{ belt.name }} ({{ belt.kyuLevel }} Kyu)
              </option>
            </select>
          </div>
        </div>

        <div v-if="formData.modality === 'Kumite'">
          <label for="cat-weight" class="block text-sm font-medium text-gray-700 mb-1">Peso (Opcional)</label>
          <input
            id="cat-weight"
            v-model="formData.weight"
            type="text"
            placeholder="Ej. -75kg, +84kg, o dejar vacío para Open"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-red-500"
          />
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
          :disabled="isSaving"
          class="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm disabled:opacity-50"
        >
           <LucideLoader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
          {{ isEditing ? 'Guardar Cambios' : 'Crear Categoría' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { LucideX, LucideLoader2 } from 'lucide-vue-next';
import type { CreateChampionshipCategoryPayload } from '@/modules/championships/types/championships-categories.types';
import { useChampionshipStore } from '@/modules/championships/store/championships.store';
import { storeToRefs } from 'pinia';

// --- STORE ---
const championshipStore = useChampionshipStore();
const { formData: categoryFormData } = storeToRefs(championshipStore);
const { fetchCategoryFormData } = championshipStore;

// Computed para acceder fácilmente a los datos
const ageRanges = computed(() => categoryFormData.value?.ageRanges || []);
const belts = computed(() => categoryFormData.value?.belts || []);

// --- DEFINICIÓN DE PROPS ---
const props = defineProps<{
  // 'initialData' es opcional. Si se pasa, es modo Edición.
  initialData?: Partial<CreateChampionshipCategoryPayload> & { id?: number };
  isSaving: boolean;  // Estado de carga (viene del padre)
  error: string | null;   // Mensaje de error (viene del padre)
}>();

// --- DEFINICIÓN DE EVENTOS ---
const emit = defineEmits<{
  (e: 'close'): void; // Evento para cerrar el modal
  (e: 'save', data: CreateChampionshipCategoryPayload): void; // Evento para guardar
}>();

// --- ESTADO INTERNO DEL FORMULARIO ---
const formData = ref<CreateChampionshipCategoryPayload>({
  code: '',
  modality: 'Kata',
  gender: 'Masculino',
  beltMinId: 0,   // Se establecerá cuando se carguen los cinturones
  beltMaxId: 0,   // Se establecerá cuando se carguen los cinturones
  ageRangeId: 0,  // Se establecerá cuando se carguen los rangos de edad
  weight: null,
});

// --- LÓGICA DE EDICIÓN ---
const isEditing = computed(() => !!props.initialData?.id);
const title = computed(() => isEditing.value ? 'Editar Categoría' : 'Agregar Nueva Categoría');

// 'watch' observa si 'initialData' cambia (cuando se abre el modal)
watch(() => props.initialData, (newData) => {
  if (newData) {
    // Si hay datos iniciales (modo Edición), llena el formulario
    formData.value = {
      code: newData.code || '',
      modality: newData.modality || 'Kata',
      gender: newData.gender || 'Masculino',
      beltMinId: newData.beltMinId || 0,
      beltMaxId: newData.beltMaxId || 0,
      ageRangeId: newData.ageRangeId || 0,
      weight: newData.weight || null,
    };
  } else {
    // Si no (modo Crear), resetea el formulario con valores iniciales
    formData.value = {
      code: '', 
      modality: 'Kata', 
      gender: 'Masculino', 
      beltMinId: 0,
      beltMaxId: 0, 
      ageRangeId: 0, 
      weight: null,
    };
  }
}, { immediate: true }); // 'immediate: true' ejecuta el watch al cargar

// Cargar datos del backend
onMounted(async () => {
  // Cargar datos del formulario (age ranges y belts) desde el backend
  await fetchCategoryFormData();
  
  // Establecer valores por defecto una vez cargados los datos (solo si no estamos editando)
  if (!isEditing.value && categoryFormData.value) {
    // Establecer primer rango de edad si está disponible
    if (ageRanges.value.length > 0 && formData.value.ageRangeId === 0) {
      formData.value.ageRangeId = ageRanges.value[0]!.id;
    }
    
    // Establecer cinturones por defecto si están disponibles
    if (belts.value.length > 0) {
      if (formData.value.beltMinId === 0) {
        // Buscar cinturón Marrón (3er Kyu) o usar el primero disponible
        const brownBelt = belts.value.find(b => b.kyuLevel === 3);
        formData.value.beltMinId = brownBelt?.id || belts.value[0]!.id;
      }
      
      if (formData.value.beltMaxId === 0) {
        // Buscar cinturón Negro o usar el último disponible
        const blackBelt = belts.value.find(b => b.name.toLowerCase().includes('negro'));
        formData.value.beltMaxId = blackBelt?.id || belts.value[belts.value.length - 1]!.id;
      }
    }
  }
});



// --- HANDLERS (EMISIÓN DE EVENTOS) ---
const handleClose = () => {
  emit('close');
};

const handleSave = () => {
  // Limpia el peso si es Kata
  if (formData.value.modality === 'Kata') {
    formData.value.weight = null;
  }
  // Limpia el peso si es Kumite Open (string vacío)
  if (formData.value.modality === 'Kumite' && formData.value.weight === '') {
    formData.value.weight = null;
  }
  // Emite el evento 'save' con los datos
  emit('save', formData.value);
};

// Limpia 'weight' si el usuario cambia a 'Kata'
const onModalityChange = () => {
  if (formData.value.modality === 'Kata') {
    formData.value.weight = null;
  }
};
</script>