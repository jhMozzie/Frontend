<template>
  <div>
    <div class="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
      <div>
        <h2 class="text-lg font-semibold text-gray-800">Visualización de Llaves</h2>
        <p class="text-sm text-gray-500">Selecciona una categoría para ver su bracket.</p>
      </div>
      <select v-model="selectedCategory" class="w-full sm:w-72 rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-0">
        <option value="senior-m-75">Senior Masculino -75kg</option>
        <option value="infantil-m-35">Infantil Masculino -35kg</option>
        <option value="infantil-f-35">Infantil Femenino -35kg</option>
        <option value="juvenil-m-68">Juvenil Masculino -68kg</option>
        <option value="juvenil-f-61">Juvenil Femenino -61kg</option>
        <option value="senior-f-61">Senior Femenino -61kg</option>
      </select>
    </div>

    <!-- Brackets con encabezados -->
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <div class="p-6">
          
          <!-- Encabezados hardcodeados -->
          <div class="flex gap-8 mb-6">
            <div class="flex-shrink-0" style="width: 314px;">
              <div class="text-center font-bold text-gray-700 pb-2 border-b-2 border-red-500">
                Octavos de Final
              </div>
            </div>
            <div class="flex-shrink-0" style="width: 314px;">
              <div class="text-center font-bold text-gray-700 pb-2 border-b-2 border-red-500">
                Cuartos de Final
              </div>
            </div>
            <div class="flex-shrink-0" style="width: 314px;">
              <div class="text-center font-bold text-gray-700 pb-2 border-b-2 border-red-500">
                Semifinal
              </div>
            </div>
            <div class="flex-shrink-0" style="width: 314px;">
              <div class="text-center font-bold text-gray-700 pb-2 border-b-2 border-red-500">
                Final
              </div>
            </div>
          </div>

          <!-- Bracket recursivo -->
          <div v-if="finalMatch" class="flex justify-start">
            <BracketNode 
              :match="finalMatch" 
              :all-matches="transformedMatches"
              @open-match="handleOpenMatch"
              :is-root="true"
            />
          </div>

        </div>
      </div>
    </div>

    <!-- Diálogo para registrar resultados -->
    <div v-if="showDialog" class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md" ref="dialogContentRef">
        <div class="border-b border-gray-200 px-6 py-4">
          <h3 class="text-lg font-semibold text-gray-900">Registrar Resultado - Match #{{ selectedMatch?.id }}</h3>
        </div>
        <div class="space-y-6 p-6">
          <div class="space-y-1">
            <div class="font-medium">{{ selectedMatch?.competitor1?.name || "Pendiente" }}</div>
            <div v-if="selectedMatch?.competitor1?.academy" class="text-sm text-gray-500">{{ selectedMatch.competitor1.academy }}</div>
            <div class="flex items-center gap-3 pt-1">
              <button @click="adjustScore('tempScore1', -1)" :disabled="tempScore1 <= 0" class="p-1 rounded-full bg-gray-100 hover:bg-gray-200">
                <LucideMinus class="w-4 h-4" />
              </button>
              <div class="text-3xl font-bold w-16 text-center tabular-nums">{{ tempScore1 }}</div>
              <button @click="adjustScore('tempScore1', 1)" class="p-1 rounded-full bg-gray-100 hover:bg-gray-200">
                <LucidePlus class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div class="h-px bg-gray-200"></div>
          <div class="space-y-1">
            <div class="font-medium">{{ selectedMatch?.competitor2?.name || "Pendiente" }}</div>
            <div v-if="selectedMatch?.competitor2?.academy" class="text-sm text-gray-500">{{ selectedMatch.competitor2.academy }}</div>
            <div class="flex items-center gap-3 pt-1">
              <button @click="adjustScore('tempScore2', -1)" :disabled="tempScore2 <= 0" class="p-1 rounded-full bg-gray-100 hover:bg-gray-200">
                <LucideMinus class="w-4 h-4" />
              </button>
              <div class="text-3xl font-bold w-16 text-center tabular-nums">{{ tempScore2 }}</div>
              <button @click="adjustScore('tempScore2', 1)" class="p-1 rounded-full bg-gray-100 hover:bg-gray-200">
                <LucidePlus class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div v-if="tempScore1 !== tempScore2" class="flex items-center gap-2 text-sm text-green-600 font-medium">
            <LucideTrophy class="w-4 h-4" />
            <span>Ganador: {{ tempScore1 > tempScore2 ? selectedMatch?.competitor1?.name : selectedMatch?.competitor2?.name }}</span>
          </div>
          <div v-else class="text-sm text-gray-500 italic">El resultado es un empate.</div>
        </div>
        <div class="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
          <button @click="closeDialog" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancelar
          </button>
          <button @click="handleSaveResult" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
            Guardar Resultado
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { LucidePlus, LucideMinus, LucideTrophy } from 'lucide-vue-next';
import BracketNode from '@/modules/championships/components/brackets/BracketNode.vue';

// --- Tipos ---
interface Competitor { 
  id: number; 
  name: string; 
  academy?: string; 
}

interface MatchTransformed { 
  id: number; 
  matchNumber: number; 
  competitor1?: Competitor; 
  competitor2?: Competitor; 
  winner?: number;
  score1: number | null; 
  score2: number | null; 
  status: string; 
  nextMatchId: number | null; 
  nextMatchSide: string | null;
}

// --- Datos hardcodeados ---
const hardcodedMatches: MatchTransformed[] = [
  // Ronda 1 - Octavos de final
  { id: 1, matchNumber: 1, competitor1: { id: 1, name: "Juan Pérez", academy: "Academia Dragón Rojo" }, competitor2: { id: 2, name: "Carlos Ruiz", academy: "Dojo Shotokan" }, winner: 1, score1: 8, score2: 5, status: "Completado", nextMatchId: 9, nextMatchSide: "Akka" },
  { id: 2, matchNumber: 2, competitor1: { id: 3, name: "Miguel Sanz", academy: "Club Tradicional" }, competitor2: { id: 4, name: "Pedro López", academy: "Escuela Marcial" }, winner: 3, score1: 7, score2: 4, status: "Completado", nextMatchId: 9, nextMatchSide: "Ao" },
  { id: 3, matchNumber: 3, competitor1: { id: 5, name: "Luis García", academy: "Centro Karate" }, competitor2: { id: 6, name: "Javier Martín", academy: "Dojo Central" }, winner: 5, score1: 6, score2: 3, status: "Completado", nextMatchId: 10, nextMatchSide: "Akka" },
  { id: 4, matchNumber: 4, competitor1: { id: 7, name: "David Torres", academy: "Academia Norte" }, competitor2: { id: 8, name: "Sergio Ramos", academy: "Club Este" }, winner: 7, score1: 9, score2: 2, status: "Completado", nextMatchId: 10, nextMatchSide: "Ao" },
  { id: 5, matchNumber: 5, competitor1: { id: 9, name: "Alejandro Díaz", academy: "Escuela Oeste" }, competitor2: { id: 10, name: "Roberto Silva", academy: "Dojo Sur" }, winner: 9, score1: 5, score2: 4, status: "Completado", nextMatchId: 11, nextMatchSide: "Akka" },
  { id: 6, matchNumber: 6, competitor1: { id: 11, name: "Fernando Cruz", academy: "Centro Tradicional" }, competitor2: { id: 12, name: "Ricardo Mora", academy: "Academia Elite" }, winner: 11, score1: 7, score2: 6, status: "Completado", nextMatchId: 11, nextMatchSide: "Ao" },
  { id: 7, matchNumber: 7, competitor1: { id: 13, name: "Gabriel Reyes", academy: "Club Karate" }, competitor2: { id: 14, name: "Esteban López", academy: "Dojo Samurai" }, winner: 13, score1: 8, score2: 7, status: "Completado", nextMatchId: 12, nextMatchSide: "Akka" },
  { id: 8, matchNumber: 8, competitor1: { id: 15, name: "Daniel Castro", academy: "Escuela Shoto" }, competitor2: { id: 16, name: "Andrés Mendoza", academy: "Academia Bushido" }, winner: 15, score1: 6, score2: 5, status: "Completado", nextMatchId: 12, nextMatchSide: "Ao" },
  
  // Ronda 2 - Cuartos de final
  { id: 9, matchNumber: 9, competitor1: { id: 1, name: "Juan Pérez", academy: "Academia Dragón Rojo" }, competitor2: { id: 3, name: "Miguel Sanz", academy: "Club Tradicional" }, winner: 1, score1: 5, score2: 3, status: "Completado", nextMatchId: 13, nextMatchSide: "Akka" },
  { id: 10, matchNumber: 10, competitor1: { id: 5, name: "Luis García", academy: "Centro Karate" }, competitor2: { id: 7, name: "David Torres", academy: "Academia Norte" }, winner: 5, score1: 4, score2: 2, status: "Completado", nextMatchId: 13, nextMatchSide: "Ao" },
  { id: 11, matchNumber: 11, competitor1: { id: 9, name: "Alejandro Díaz", academy: "Escuela Oeste" }, competitor2: { id: 11, name: "Fernando Cruz", academy: "Centro Tradicional" }, winner: 9, score1: 6, score2: 4, status: "Completado", nextMatchId: 14, nextMatchSide: "Akka" },
  { id: 12, matchNumber: 12, competitor1: { id: 13, name: "Gabriel Reyes", academy: "Club Karate" }, competitor2: { id: 15, name: "Daniel Castro", academy: "Escuela Shoto" }, winner: 13, score1: 7, score2: 5, status: "Completado", nextMatchId: 14, nextMatchSide: "Ao" },
  
  // Ronda 3 - Semifinales
  { id: 13, matchNumber: 13, competitor1: { id: 1, name: "Juan Pérez", academy: "Academia Dragón Rojo" }, competitor2: { id: 5, name: "Luis García", academy: "Centro Karate" }, status: "Pendiente", score1: null, score2: null, nextMatchId: 15, nextMatchSide: "Akka" },
  { id: 14, matchNumber: 14, competitor1: { id: 9, name: "Alejandro Díaz", academy: "Escuela Oeste" }, competitor2: { id: 13, name: "Gabriel Reyes", academy: "Club Karate" }, status: "Pendiente", score1: null, score2: null, nextMatchId: 15, nextMatchSide: "Ao" },
  
  // Ronda 4 - Final
  { id: 15, matchNumber: 15, status: "Pendiente", score1: null, score2: null, nextMatchId: null, nextMatchSide: null }
];

// --- Estado reactivo ---
const selectedCategory = ref("senior-m-75");
const selectedMatch = ref<MatchTransformed | null>(null);
const tempScore1 = ref(0);
const tempScore2 = ref(0);
const showDialog = ref(false);
const dialogContentRef = ref<HTMLElement | null>(null);

// --- Computed properties ---
const transformedMatches = computed(() => hardcodedMatches);

// Final match (el nodo raíz del bracket)
const finalMatch = computed(() => {
  return transformedMatches.value.find(m => m.id === 15);
});

// --- Handlers ---
const handleOpenMatch = (match: MatchTransformed) => { 
  if (match.id <= 0) return; 

  if(match.status === 'Completado') {
    alert(`Match #${match.matchNumber} ya ha finalizado. Ganador: ${getWinnerName(match)}`);
    return;
  }
  if (!match.competitor1 || !match.competitor2) {
    alert("Aún no se han definido los competidores."); 
    return; 
  }
  
  selectedMatch.value = match;
  tempScore1.value = match.score1 || 0;
  tempScore2.value = match.score2 || 0;
  showDialog.value = true;
};

const closeDialog = () => { 
  showDialog.value = false; 
  selectedMatch.value = null; 
  tempScore1.value = 0;
  tempScore2.value = 0;
};

const handleSaveResult = () => {
  if (!selectedMatch.value) return;
  
  const currentMatch = selectedMatch.value;
  
  // Actualizar el match hardcodeado con los nuevos resultados
  const matchIndex = hardcodedMatches.findIndex(m => m.id === currentMatch.id);
  if (matchIndex !== -1) {
    const match = hardcodedMatches[matchIndex];
    if (!match) return;
    
    const winnerId = tempScore1.value > tempScore2.value ? currentMatch.competitor1?.id : 
                    tempScore1.value < tempScore2.value ? currentMatch.competitor2?.id : undefined;
    
    match.score1 = tempScore1.value;
    match.score2 = tempScore2.value;
    match.status = 'Completado';
    match.winner = winnerId;
    
    // Si hay un siguiente match, actualizar los competidores
    if (match.nextMatchId) {
      const nextMatchIndex = hardcodedMatches.findIndex(m => m.id === match.nextMatchId);
      if (nextMatchIndex !== -1 && winnerId) {
        const nextMatch = hardcodedMatches[nextMatchIndex];
        if (!nextMatch) return;
        
        const winnerCompetitor = tempScore1.value > tempScore2.value ? currentMatch.competitor1 : currentMatch.competitor2;
        
        if (match.nextMatchSide === 'Akka') {
          nextMatch.competitor1 = winnerCompetitor;
        } else if (match.nextMatchSide === 'Ao') {
          nextMatch.competitor2 = winnerCompetitor;
        }
      }
    }
  }
  
  closeDialog();
};

const adjustScore = (scoreRefKey: 'tempScore1' | 'tempScore2', amount: number) => {
  if (scoreRefKey === 'tempScore1') {
    tempScore1.value = Math.max(0, tempScore1.value + amount);
  } else {
    tempScore2.value = Math.max(0, tempScore2.value + amount);
  }
};

// --- Funciones auxiliares ---
function getWinnerName(match: MatchTransformed): string {
  if (!match.winner) return "N/A";
  if (match.competitor1?.id === match.winner) return match.competitor1.name;
  if (match.competitor2?.id === match.winner) return match.competitor2.name;
  return "N/A";
}

const handleClickOutsideDialog = (event: MouseEvent) => {
  if (showDialog.value && dialogContentRef.value && !dialogContentRef.value.contains(event.target as Node)) {
    closeDialog();
  }
};

onMounted(() => document.addEventListener('mousedown', handleClickOutsideDialog));
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutsideDialog));
</script>