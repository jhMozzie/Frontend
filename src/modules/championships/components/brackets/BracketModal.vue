<template>
  <!-- Diálogo mejorado para registrar resultados (Kumite y Kata) -->
  <div v-if="open" class="fixed inset-0 bg-opacity-20 z-40 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" ref="dialogContentRef">
      <!-- Header -->
      <div class="border-b border-gray-200 px-6 py-4 space-y-1">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">
              {{ match?.status === 'Completado' ? 'Editar' : 'Registrar' }} Resultado - Match #{{ match?.matchNumber }}
            </h3>
            <p v-if="match?.categoryInfo" class="text-sm text-gray-500">{{ match.categoryInfo }}</p>
          </div>
          <!-- Badge de match completado -->
          <div v-if="match?.status === 'Completado'" class="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
            ✓ Completado
          </div>
        </div>
      </div>

      <!-- Alerta para administrador editando match completado -->
      <div v-if="match?.status === 'Completado'" class="mx-6 mt-4 p-3 bg-amber-50 border border-amber-300 rounded-lg">
        <div class="flex items-center gap-2">
          <span class="text-xl">⚠️</span>
          <div class="text-sm text-amber-800">
            <span class="font-semibold">Modo Administrador:</span> Estás editando un combate finalizado. Los cambios se guardarán y actualizarán el bracket.
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="space-y-6 p-6">
        <!-- Tipo de competencia detectado automáticamente (solo lectura visual) -->
        <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="text-2xl">{{ competitionType === 'kumite' ? '🥋' : '🎭' }}</div>
            <div>
              <div class="text-sm font-medium text-gray-600">Modalidad</div>
              <div class="text-lg font-bold text-blue-700">
                {{ competitionType === 'kumite' ? 'Kumite (Combate)' : 'Kata (Forma)' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Modo Kumite -->
        <template v-if="competitionType === 'kumite'">
          <!-- Competidor 1 -->
          <div class="space-y-3 p-4 bg-white border-2 border-gray-200 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-semibold text-lg text-gray-900">{{ match?.competitor1?.name || "Pendiente" }}</div>
                <div v-if="match?.competitor1?.academy" class="text-sm text-gray-500">{{ match.competitor1.academy }}</div>
              </div>
              <!-- Checkbox para empate -->
              <div v-if="isKumiteTie" class="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  :id="`winner-comp1-${match?.id}`"
                  :checked="manualWinnerId === match?.competitor1?.id"
                  @change="manualWinnerId = match?.competitor1?.id || null"
                  class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label :for="`winner-comp1-${match?.id}`" class="text-sm font-medium text-gray-700">
                  Ganador
                </label>
              </div>
            </div>
            
            <div class="space-y-3">
              <!-- Puntos -->
              <div>
                <label class="text-xs text-gray-500 mb-2 block">Puntos</label>
                <div class="flex items-center gap-3">
                  <button @click="tempScore1 = Math.max(0, tempScore1 - 1)" class="p-2 rounded-md bg-gray-100 hover:bg-gray-200">
                    <LucideMinus class="w-4 h-4" />
                  </button>
                  <div class="text-4xl font-bold w-20 text-center text-red-600">{{ tempScore1 }}</div>
                  <button @click="tempScore1++" class="p-2 rounded-md bg-gray-100 hover:bg-gray-200">
                    <LucidePlus class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Faltas, Senshu, Hansoku -->
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="text-xs text-gray-500 mb-2 block">Faltas</label>
                  <div class="flex items-center gap-2">
                    <button @click="tempFouls1 = Math.max(0, tempFouls1 - 1)" class="p-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
                      <LucideMinus class="w-3 h-3" />
                    </button>
                    <span class="text-xl font-bold w-8 text-center">{{ tempFouls1 }}</span>
                    <button @click="tempFouls1 = Math.min(4, tempFouls1 + 1)" class="p-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
                      <LucidePlus class="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-xs text-gray-500">Senshu</label>
                  <button
                    @click="tempSenshu1 = !tempSenshu1"
                    :class="[
                      'w-full px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      tempSenshu1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    ]"
                  >
                    {{ tempSenshu1 ? '✓' : '—' }}
                  </button>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-xs text-gray-500">Hansoku</label>
                  <button
                    @click="tempHansoku1 = !tempHansoku1"
                    :class="[
                      'w-full px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      tempHansoku1 ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    ]"
                  >
                    {{ tempHansoku1 ? '✗' : '—' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="h-px bg-gray-200"></div>

          <!-- Competidor 2 -->
          <div class="space-y-3 p-4 bg-white border-2 border-gray-200 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-semibold text-lg text-gray-900">{{ match?.competitor2?.name || "Pendiente" }}</div>
                <div v-if="match?.competitor2?.academy" class="text-sm text-gray-500">{{ match.competitor2.academy }}</div>
              </div>
              <!-- Checkbox para empate -->
              <div v-if="isKumiteTie" class="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  :id="`winner-comp2-${match?.id}`"
                  :checked="manualWinnerId === match?.competitor2?.id"
                  @change="manualWinnerId = match?.competitor2?.id || null"
                  class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label :for="`winner-comp2-${match?.id}`" class="text-sm font-medium text-gray-700">
                  Ganador
                </label>
              </div>
            </div>
            
            <div class="space-y-3">
              <!-- Puntos -->
              <div>
                <label class="text-xs text-gray-500 mb-2 block">Puntos</label>
                <div class="flex items-center gap-3">
                  <button @click="tempScore2 = Math.max(0, tempScore2 - 1)" class="p-2 rounded-md bg-gray-100 hover:bg-gray-200">
                    <LucideMinus class="w-4 h-4" />
                  </button>
                  <div class="text-4xl font-bold w-20 text-center text-blue-600">{{ tempScore2 }}</div>
                  <button @click="tempScore2++" class="p-2 rounded-md bg-gray-100 hover:bg-gray-200">
                    <LucidePlus class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Faltas, Senshu, Hansoku -->
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="text-xs text-gray-500 mb-2 block">Faltas</label>
                  <div class="flex items-center gap-2">
                    <button @click="tempFouls2 = Math.max(0, tempFouls2 - 1)" class="p-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
                      <LucideMinus class="w-3 h-3" />
                    </button>
                    <span class="text-xl font-bold w-8 text-center">{{ tempFouls2 }}</span>
                    <button @click="tempFouls2 = Math.min(4, tempFouls2 + 1)" class="p-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
                      <LucidePlus class="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-xs text-gray-500">Senshu</label>
                  <button
                    @click="tempSenshu2 = !tempSenshu2"
                    :class="[
                      'w-full px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      tempSenshu2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    ]"
                  >
                    {{ tempSenshu2 ? '✓' : '—' }}
                  </button>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-xs text-gray-500">Hansoku</label>
                  <button
                    @click="tempHansoku2 = !tempHansoku2"
                    :class="[
                      'w-full px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      tempHansoku2 ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    ]"
                  >
                    {{ tempHansoku2 ? '✗' : '—' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Indicador de ganador para Kumite -->
          <div v-if="kumiteWinner" class="flex items-center gap-2 p-3 rounded-lg" :class="[
            kumiteWinner === 'Empate' ? 'bg-yellow-50 border border-yellow-300' : 'bg-blue-50 border border-blue-200'
          ]">
            <LucideTrophy class="w-5 h-5" :class="[
              kumiteWinner === 'Empate' ? 'text-yellow-600' : 'text-blue-600'
            ]" />
            <span class="font-semibold" :class="[
              kumiteWinner === 'Empate' ? 'text-yellow-700' : 'text-blue-700'
            ]">
              <span v-if="kumiteWinner === 'Empate'">⚠️ Empate - Selecciona un ganador manualmente</span>
              <span v-else>Ganador: {{ kumiteWinner }}</span>
            </span>
          </div>
        </template>

        <!-- Modo Kata -->
        <template v-else>
          <!-- Competidor 1 (Akka - Rojo) -->
          <div class="space-y-3 p-4 bg-white border-2 border-red-300 rounded-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-red-600 rounded-full"></div>
                <div class="font-semibold text-lg text-gray-900">{{ match?.competitor1?.name || "Pendiente" }}</div>
              </div>
              <!-- Checkbox para empate -->
              <div v-if="isKataTie" class="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  :id="`winner-kata-comp1-${match?.id}`"
                  :checked="manualWinnerId === match?.competitor1?.id"
                  @change="manualWinnerId = match?.competitor1?.id || null"
                  class="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label :for="`winner-kata-comp1-${match?.id}`" class="text-sm font-medium text-gray-700">
                  Ganador
                </label>
              </div>
            </div>
            <div v-if="match?.competitor1?.academy" class="text-sm text-gray-500">{{ match.competitor1.academy }}</div>
            
            <div>
              <label class="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                🚩 Banderas Rojas
              </label>
              <div class="flex items-center justify-center gap-3 py-2">
                <button @click="tempRedFlags1 = Math.max(0, tempRedFlags1 - 1)" class="p-2 rounded-md bg-red-100 hover:bg-red-200 text-red-700">
                  <LucideMinus class="w-5 h-5" />
                </button>
                <span class="text-5xl font-bold w-24 text-center text-red-600">{{ tempRedFlags1 }}</span>
                <button @click="tempRedFlags1 = Math.min(5, tempRedFlags1 + 1)" class="p-2 rounded-md bg-red-100 hover:bg-red-200 text-red-700">
                  <LucidePlus class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div class="h-px bg-gray-200"></div>

          <!-- Competidor 2 (Ao - Azul) -->
          <div class="space-y-3 p-4 bg-white border-2 border-blue-300 rounded-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-blue-600 rounded-full"></div>
                <div class="font-semibold text-lg text-gray-900">{{ match?.competitor2?.name || "Pendiente" }}</div>
              </div>
              <!-- Checkbox para empate -->
              <div v-if="isKataTie" class="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  :id="`winner-kata-comp2-${match?.id}`"
                  :checked="manualWinnerId === match?.competitor2?.id"
                  @change="manualWinnerId = match?.competitor2?.id || null"
                  class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label :for="`winner-kata-comp2-${match?.id}`" class="text-sm font-medium text-gray-700">
                  Ganador
                </label>
              </div>
            </div>
            <div v-if="match?.competitor2?.academy" class="text-sm text-gray-500">{{ match.competitor2.academy }}</div>
            
            <div>
              <label class="text-sm font-medium text-blue-700 mb-2 flex items-center gap-1">
                🔵 Banderas Azules
              </label>
              <div class="flex items-center justify-center gap-3 py-2">
                <button @click="tempBlueFlags2 = Math.max(0, tempBlueFlags2 - 1)" class="p-2 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700">
                  <LucideMinus class="w-5 h-5" />
                </button>
                <span class="text-5xl font-bold w-24 text-center text-blue-600">{{ tempBlueFlags2 }}</span>
                <button @click="tempBlueFlags2 = Math.min(5, tempBlueFlags2 + 1)" class="p-2 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700">
                  <LucidePlus class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Indicador de ganador para Kata -->
          <div v-if="kataWinner" class="flex items-center gap-2 p-3 rounded-lg" :class="[
            kataWinner === 'Empate' ? 'bg-yellow-50 border border-yellow-300' : 'bg-blue-50 border border-blue-200'
          ]">
            <LucideTrophy class="w-5 h-5" :class="[
              kataWinner === 'Empate' ? 'text-yellow-600' : 'text-blue-600'
            ]" />
            <span class="font-semibold" :class="[
              kataWinner === 'Empate' ? 'text-yellow-700' : 'text-blue-700'
            ]">
              <span v-if="kataWinner === 'Empate'">⚠️ Empate - Selecciona un ganador manualmente</span>
              <span v-else>Ganador: {{ kataWinner }}</span>
            </span>
          </div>
        </template>
      </div>

      <!-- Footer -->
      <div class="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
        <button @click="handleClose" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Cancelar
        </button>
        <button @click="handleSave" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 min-w-[150px]">
          Guardar Resultado
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { LucidePlus, LucideMinus, LucideTrophy } from 'lucide-vue-next';

// --- Tipos ---
interface Competitor { 
  id: number; 
  name: string; 
  academy?: string; 
}

interface MatchData { 
  id: number; 
  matchNumber: number; 
  competitor1?: Competitor; 
  competitor2?: Competitor; 
  winner?: number;
  score1: number | null; 
  score2: number | null; 
  status: string; 
  modality?: 'Kumite' | 'Kata';
  categoryInfo?: string;
}

// --- Props ---
const props = defineProps<{
  open: boolean;
  match: MatchData | null;
}>();

// --- Emits ---
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', winnerId: number, scores: { scoreAkka: number; scoreAo: number }): void;
}>();

// --- Estado local ---
const dialogContentRef = ref<HTMLElement | null>(null);
const competitionType = ref<'kumite' | 'kata'>('kumite');

// Variables para Kumite
const tempScore1 = ref(0);
const tempScore2 = ref(0);
const tempFouls1 = ref(0);
const tempFouls2 = ref(0);
const tempSenshu1 = ref(false);
const tempSenshu2 = ref(false);
const tempHansoku1 = ref(false);
const tempHansoku2 = ref(false);

// Variables para Kata
const tempRedFlags1 = ref(0);
const tempBlueFlags1 = ref(0);
const tempRedFlags2 = ref(0);
const tempBlueFlags2 = ref(0);

// Variable para ganador manual en caso de empate
const manualWinnerId = ref<number | null>(null);

// --- Watchers ---
watch(() => props.match, (newMatch) => {
  if (newMatch) {
    // Detectar tipo de competencia
    competitionType.value = newMatch.modality?.toLowerCase() === 'kata' ? 'kata' : 'kumite';
    
    // Inicializar valores con los scores guardados (para edición de matches completados)
    tempScore1.value = newMatch.score1 || 0;
    tempScore2.value = newMatch.score2 || 0;
    
    // Para Kata, inicializar las banderas con los scores guardados
    if (competitionType.value === 'kata') {
      tempRedFlags1.value = newMatch.score1 || 0;
      tempBlueFlags2.value = newMatch.score2 || 0;
    }
    
    // Reset otros valores
    tempFouls1.value = 0;
    tempFouls2.value = 0;
    tempSenshu1.value = false;
    tempSenshu2.value = false;
    tempHansoku1.value = false;
    tempHansoku2.value = false;
    
    // Solo resetear banderas si no es Kata o si no hay scores guardados
    if (competitionType.value !== 'kata') {
      tempRedFlags1.value = 0;
      tempBlueFlags1.value = 0;
      tempRedFlags2.value = 0;
      tempBlueFlags2.value = 0;
    }
    
    // Si el match está completado y hay empate, pre-seleccionar al ganador actual
    if (newMatch.status === 'Completado' && newMatch.winner) {
      manualWinnerId.value = newMatch.winner;
    } else {
      manualWinnerId.value = null;
    }
  }
});

// --- Computed ---
const kumiteWinner = computed(() => {
  if (!props.match) return null;
  
  const comp1 = props.match.competitor1;
  const comp2 = props.match.competitor2;
  
  if (!comp1 || !comp2) return null;
  
  // 1. Hansoku tiene prioridad máxima (descalificación)
  if (tempHansoku1.value && !tempHansoku2.value) return comp2.name;
  if (tempHansoku2.value && !tempHansoku1.value) return comp1.name;
  if (tempHansoku1.value && tempHansoku2.value) return "Ambos descalificados";
  
  // 2. Comparar puntos
  if (tempScore1.value > tempScore2.value) return comp1.name;
  if (tempScore2.value > tempScore1.value) return comp2.name;
  
  // 3. Empate en puntos - revisar Senshu (primer punto)
  if (tempSenshu1.value && !tempSenshu2.value) return comp1.name;
  if (tempSenshu2.value && !tempSenshu1.value) return comp2.name;
  
  // 4. Empate total
  return "Empate";
});

const kataWinner = computed(() => {
  if (!props.match) return null;
  
  const comp1 = props.match.competitor1;
  const comp2 = props.match.competitor2;
  
  if (!comp1 || !comp2) return null;
  
  // Competidor 1 (Akka) tiene solo banderas rojas
  // Competidor 2 (Ao) tiene solo banderas azules
  const total1 = tempRedFlags1.value;
  const total2 = tempBlueFlags2.value;
  
  if (total1 > total2) return comp1.name;
  if (total2 > total1) return comp2.name;
  
  return "Empate";
});

// Detectar si hay empate
const isKumiteTie = computed(() => kumiteWinner.value === "Empate");
const isKataTie = computed(() => kataWinner.value === "Empate");

// --- Handlers ---
const handleClose = () => {
  emit('close');
};

const handleSave = () => {
  if (!props.match) return;
  
  let winnerId: number | undefined;
  
  if (competitionType.value === 'kumite') {
    // Si hay empate, usar selección manual
    if (kumiteWinner.value === "Empate") {
      if (!manualWinnerId.value) {
        alert("Hay empate. Por favor, selecciona al ganador usando el checkbox.");
        return;
      }
      winnerId = manualWinnerId.value;
    } else if (kumiteWinner.value === "Ambos descalificados") {
      alert("Ambos competidores están descalificados. No se puede registrar resultado.");
      return;
    } else {
      // Determinar winnerId basado en el nombre del ganador
      if (kumiteWinner.value === props.match.competitor1?.name) {
        winnerId = props.match.competitor1.id;
      } else if (kumiteWinner.value === props.match.competitor2?.name) {
        winnerId = props.match.competitor2.id;
      }
    }
  } else {
    // Kata
    if (kataWinner.value === "Empate") {
      if (!manualWinnerId.value) {
        alert("Hay empate. Por favor, selecciona al ganador usando el checkbox.");
        return;
      }
      winnerId = manualWinnerId.value;
    } else {
      // Determinar winnerId basado en el nombre del ganador
      if (kataWinner.value === props.match.competitor1?.name) {
        winnerId = props.match.competitor1.id;
      } else if (kataWinner.value === props.match.competitor2?.name) {
        winnerId = props.match.competitor2.id;
      }
    }
  }
  
  if (!winnerId) {
    alert("Error al determinar el ganador");
    return;
  }
  
  const scores = {
    scoreAkka: competitionType.value === 'kumite' ? tempScore1.value : tempRedFlags1.value,
    scoreAo: competitionType.value === 'kumite' ? tempScore2.value : tempBlueFlags2.value
  };
  
  emit('save', winnerId, scores);
};

const handleClickOutside = (event: MouseEvent) => {
  if (props.open && dialogContentRef.value && !dialogContentRef.value.contains(event.target as Node)) {
    handleClose();
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>
