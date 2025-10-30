<template>
  <div>
    <div class="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
      <div>
        <h2 class="text-lg font-semibold text-gray-800">Visualización de Llaves</h2>
        <p class="text-sm text-gray-500">Selecciona una categoría para ver su bracket.</p>
      </div>
      <select v-model="selectedCategoryId" class="w-full sm:w-72 rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-0" @change="handleCategoryChange">
        <option :value="null" disabled>Selecciona una categoría</option>
        <option v-for="category in championshipStore.championshipCategories" :key="category.id" :value="category.id">
          {{ category.modality }} {{ category.gender }} - {{ category.weight || category.ageRangeLabel }}
        </option>
      </select>
    </div>

    <!-- Brackets con encabezados -->
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <div class="p-6">
          
          <!-- Encabezados dinámicos según profundidad del bracket -->
          <div class="flex gap-8 mb-6">
            <div v-if="bracketDepth >= 4" class="flex-shrink-0" style="width: 314px;">
              <div class="text-center font-bold text-gray-700 pb-2 border-b-2 border-red-500">
                Octavos de Final
              </div>
            </div>
            <div v-if="bracketDepth >= 3" class="flex-shrink-0" style="width: 314px;">
              <div class="text-center font-bold text-gray-700 pb-2 border-b-2 border-red-500">
                Cuartos de Final
              </div>
            </div>
            <div v-if="bracketDepth >= 2" class="flex-shrink-0" style="width: 314px;">
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
              :all-matches="allMatches"
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
          <h3 class="text-lg font-semibold text-gray-900">Registrar Resultado - Match #{{ selectedMatch?.matchNumber }}</h3>
        </div>
        <div class="space-y-6 p-6">
          <div class="space-y-1">
            <div class="font-medium">{{ selectedMatch?.competitor1?.name || "Pendiente" }}</div>
            <div v-if="selectedMatch?.competitor1?.academy" class="text-sm text-gray-500">{{ selectedMatch.competitor1.academy }}</div>
            <div class="flex items-center gap-3 pt-1">
              <button @click="adjustScore('tempScore1', -1)" :disabled="tempScore1 <= 0" class="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
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
              <button @click="adjustScore('tempScore2', -1)" :disabled="tempScore2 <= 0" class="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
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
import { useRoute } from 'vue-router';
import { LucidePlus, LucideMinus, LucideTrophy } from 'lucide-vue-next';
import BracketNode from '@/modules/championships/components/brackets/BracketNode.vue';
import { useChampionshipStore } from '@/modules/championships/store/championships.store';
import type { Match } from '@/modules/championships/types';

const route = useRoute();
const championshipStore = useChampionshipStore();

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

// ⭐ FUNCIÓN PARA TRANSFORMAR MATCHES DEL BACKEND AL FORMATO DEL COMPONENTE ⭐
function transformMatchFromAPI(match: Match): MatchTransformed {
  return {
    id: match.id,
    matchNumber: match.matchNumber,
    competitor1: match.participantAkka ? {
      id: match.participantAkka.id,
      name: `${match.participantAkka.student.firstname} ${match.participantAkka.student.lastname}`,
      academy: match.participantAkka.student.academy.name
    } : undefined,
    competitor2: match.participantAo ? {
      id: match.participantAo.id,
      name: `${match.participantAo.student.firstname} ${match.participantAo.student.lastname}`,
      academy: match.participantAo.student.academy.name
    } : undefined,
    winner: match.winnerId || undefined,
    score1: match.scoreAkka,
    score2: match.scoreAo,
    status: match.status,
    nextMatchId: match.nextMatchId,
    nextMatchSide: match.nextMatchSide
  };
}

// ⭐ FUNCIÓN PARA CALCULAR LA PROFUNDIDAD NECESARIA DEL BRACKET ⭐
function calculateBracketDepth(matches: MatchTransformed[]): number {
  const finalMatch = matches.find(m => m.nextMatchId === null);
  if (!finalMatch) return 1;
  
  function getMaxDepth(matchId: number, currentDepth: number = 1): number {
    const children = matches.filter(m => m.nextMatchId === matchId && m.id > 0); // Solo matches reales
    
    if (children.length === 0) {
      return currentDepth;
    }
    
    const childDepths = children.map(child => getMaxDepth(child.id, currentDepth + 1));
    return Math.max(...childDepths);
  }
  
  return getMaxDepth(finalMatch.id);
}

// ⭐ FUNCIÓN MEJORADA PARA GENERAR BRACKET COMPLETO CON BYE MATCHES ⭐
function generateCompleteBracket(realMatches: MatchTransformed[]): MatchTransformed[] {
  const allMatches: MatchTransformed[] = [...realMatches];
  let byeIdCounter = -1;
  
  // Calcular profundidad necesaria basada en matches reales
  const maxDepth = calculateBracketDepth(realMatches);
  
  // Encontrar el match final (sin nextMatchId)
  const finalMatch = realMatches.find(m => m.nextMatchId === null);
  if (!finalMatch) return allMatches;
  
  // Función recursiva para completar el árbol
  function ensureChildren(parentMatch: MatchTransformed, depth: number = 1): void {
    const children = allMatches.filter(m => m.nextMatchId === parentMatch.id);
    
    // Solo generar hijos si no hemos alcanzado la profundidad máxima
    if (children.length === 0 && depth < maxDepth) {
      // Crear dos hijos fantasma
      const childAkka: MatchTransformed = {
        id: byeIdCounter--,
        matchNumber: 0,
        status: "BYE",
        score1: null,
        score2: null,
        nextMatchId: parentMatch.id,
        nextMatchSide: "Akka"
      };
      
      const childAo: MatchTransformed = {
        id: byeIdCounter--,
        matchNumber: 0,
        status: "BYE",
        score1: null,
        score2: null,
        nextMatchId: parentMatch.id,
        nextMatchSide: "Ao"
      };
      
      allMatches.push(childAkka, childAo);
      
      // Recursivamente completar sus hijos
      ensureChildren(childAkka, depth + 1);
      ensureChildren(childAo, depth + 1);
      
    } else if (children.length === 1) {
      // Si solo hay un hijo, crear el que falta
      const existingChild = children[0]!;
      const missingSide = existingChild.nextMatchSide === 'Akka' ? 'Ao' : 'Akka';
      
      const missingChild: MatchTransformed = {
        id: byeIdCounter--,
        matchNumber: 0,
        status: "BYE",
        score1: null,
        score2: null,
        nextMatchId: parentMatch.id,
        nextMatchSide: missingSide
      };
      
      allMatches.push(missingChild);
      
      // Recursivamente completar los hijos
      ensureChildren(existingChild, depth + 1);
      ensureChildren(missingChild, depth + 1);
      
    } else if (children.length === 2) {
      // Ya tiene los dos hijos, seguir con la recursión solo si no hemos llegado al máximo
      if (depth < maxDepth) {
        children.forEach(child => ensureChildren(child, depth + 1));
      }
    }
  }
  
  // Iniciar desde el match final con depth = 1
  ensureChildren(finalMatch, 1);
  
  return allMatches;
}

// --- Estado reactivo ---
const selectedCategoryId = ref<number | null>(null);
const selectedMatch = ref<MatchTransformed | null>(null);
const tempScore1 = ref(0);
const tempScore2 = ref(0);
const showDialog = ref(false);
const dialogContentRef = ref<HTMLElement | null>(null);

// --- Computed properties ---
// Transformar matches del API a formato del componente
const realMatches = computed(() => {
  if (!championshipStore.matches || championshipStore.matches.length === 0) {
    return [];
  }
  
  // Filtrar por categoría seleccionada si existe
  const filteredMatches = selectedCategoryId.value 
    ? championshipStore.matches.filter(m => m.championshipCategoryId === selectedCategoryId.value)
    : championshipStore.matches;
  
  return filteredMatches.map(transformMatchFromAPI);
});

// Generar bracket completo con BYE matches
const allMatches = computed(() => {
  if (realMatches.value.length === 0) return [];
  return generateCompleteBracket(realMatches.value);
});

// Final match (el nodo raíz del bracket - el que no tiene nextMatchId)
const finalMatch = computed(() => {
  return allMatches.value.find(m => m.nextMatchId === null);
});

// Profundidad del bracket (para mostrar encabezados dinámicamente)
const bracketDepth = computed(() => {
  if (realMatches.value.length === 0) return 1;
  return calculateBracketDepth(realMatches.value);
});

// --- Handlers ---
const handleOpenMatch = (match: MatchTransformed) => { 
  // No permitir clicks en matches BYE (vacíos) o con ID negativo
  if (match.id <= 0 || match.status === 'BYE') return; 

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

const handleSaveResult = async () => {
  if (!selectedMatch.value) return;
  
  const currentMatch = selectedMatch.value;
  
  // Determinar el ganador
  const winnerId = tempScore1.value > tempScore2.value ? currentMatch.competitor1?.id : 
                  tempScore1.value < tempScore2.value ? currentMatch.competitor2?.id : undefined;
  
  if (!winnerId) {
    alert("Debe haber un ganador (no puede haber empate)");
    return;
  }
  
  try {
    // Actualizar resultado en el backend
    await championshipStore.updateMatchResult(currentMatch.id, winnerId, {
      scoreAkka: tempScore1.value,
      scoreAo: tempScore2.value
    });
    
    // Recargar matches de la categoría actual
    if (selectedCategoryId.value) {
      await championshipStore.fetchMatches(selectedCategoryId.value);
    }
    
    closeDialog();
  } catch (error) {
    console.error('Error al guardar resultado:', error);
    alert('Error al guardar el resultado del combate');
  }
};

// Handler para cambio de categoría
const handleCategoryChange = async () => {
  if (selectedCategoryId.value) {
    await championshipStore.fetchMatches(selectedCategoryId.value);
  }
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

// Cargar categorías y matches al montar
onMounted(async () => {
  document.addEventListener('mousedown', handleClickOutsideDialog);
  
  const championshipId = Number(route.params.id);
  
  // Cargar categorías del campeonato
  if (championshipId) {
    await championshipStore.fetchChampionshipCategories(championshipId);
    
    // Seleccionar la primera categoría automáticamente
    if (championshipStore.championshipCategories.length > 0) {
      const firstCategory = championshipStore.championshipCategories[0];
      if (firstCategory) {
        selectedCategoryId.value = firstCategory.id;
        await championshipStore.fetchMatches(selectedCategoryId.value);
      }
    }
  }
});

onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutsideDialog));
</script>

<style scoped>
/* Estilos adicionales si es necesario */
</style>