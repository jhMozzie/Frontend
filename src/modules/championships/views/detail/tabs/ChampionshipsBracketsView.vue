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
      <!-- Contenedor con altura fija y scroll -->
      <div class="overflow-auto" style="max-height: calc(100vh - 250px);">
        <div class="p-6 min-w-max">
          
          <!-- Encabezados dinámicos según profundidad del bracket -->
          <div class="flex gap-8 mb-6 sticky top-0 bg-white z-10 pb-4">
            <div 
              v-for="(header, index) in roundHeaders" 
              :key="index" 
              class="flex-shrink-0" 
              style="width: 314px;"
            >
              <div class="text-center font-bold text-gray-700 pb-2 border-b-2 border-red-500">
                {{ header }}
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
          
          <!-- Mensaje si no hay matches -->
          <div v-else-if="!championshipStore.matchesLoading" class="text-center py-12 text-gray-500">
            <p class="text-lg font-medium">No hay brackets disponibles</p>
            <p class="text-sm mt-2">Selecciona una categoría o genera los brackets para este campeonato</p>
          </div>
          
          <!-- Indicador de carga -->
          <div v-if="championshipStore.matchesLoading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <p class="mt-4 text-gray-600">Cargando brackets...</p>
          </div>

        </div>
      </div>
    </div>

    <!-- Diálogo mejorado para registrar resultados (Kumite y Kata) -->
    <div v-if="showDialog" class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" ref="dialogContentRef">
        <!-- Header -->
        <div class="border-b border-gray-200 px-6 py-4 space-y-1">
          <h3 class="text-xl font-semibold text-gray-900">Registrar Resultado - Match #{{ selectedMatch?.matchNumber }}</h3>
          <p v-if="selectedMatch?.categoryInfo" class="text-sm text-gray-500">{{ selectedMatch.categoryInfo }}</p>
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
              <div class="font-semibold text-lg text-gray-900">{{ selectedMatch?.competitor1?.name || "Pendiente" }}</div>
              <div v-if="selectedMatch?.competitor1?.academy" class="text-sm text-gray-500">{{ selectedMatch.competitor1.academy }}</div>
              
              <div class="space-y-3">
                <!-- Puntos -->
                <div>
                  <label class="text-xs text-gray-500 mb-2 block">Puntos</label>
                  <div class="flex items-center gap-3">
                    <button @click="tempScore1 = Math.max(0, tempScore1 - 1)" class="p-2 rounded-md bg-gray-100 hover:bg-gray-200">
                      <LucideMinus class="w-4 h-4" />
                    </button>
                    <div class="text-4xl font-bold w-20 text-center text-blue-600">{{ tempScore1 }}</div>
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
              <div class="font-semibold text-lg text-gray-900">{{ selectedMatch?.competitor2?.name || "Pendiente" }}</div>
              <div v-if="selectedMatch?.competitor2?.academy" class="text-sm text-gray-500">{{ selectedMatch.competitor2.academy }}</div>
              
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
            <div v-if="kumiteWinner" class="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <LucideTrophy class="w-5 h-5 text-blue-600" />
              <span class="font-semibold text-blue-700">Ganador: {{ kumiteWinner }}</span>
            </div>
          </template>

          <!-- Modo Kata -->
          <template v-else>
            <!-- Competidor 1 -->
            <div class="space-y-3 p-4 bg-white border-2 border-gray-200 rounded-lg">
              <div class="font-semibold text-lg text-gray-900">{{ selectedMatch?.competitor1?.name || "Pendiente" }}</div>
              <div v-if="selectedMatch?.competitor1?.academy" class="text-sm text-gray-500">{{ selectedMatch.competitor1.academy }}</div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    🚩 Banderas Rojas
                  </label>
                  <div class="flex items-center gap-2">
                    <button @click="tempRedFlags1 = Math.max(0, tempRedFlags1 - 1)" class="p-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
                      <LucideMinus class="w-3 h-3" />
                    </button>
                    <span class="text-3xl font-bold w-12 text-center text-red-600">{{ tempRedFlags1 }}</span>
                    <button @click="tempRedFlags1 = Math.min(5, tempRedFlags1 + 1)" class="p-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
                      <LucidePlus class="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <label class="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    🔵 Banderas Azules
                  </label>
                  <div class="flex items-center gap-2">
                    <button @click="tempBlueFlags1 = Math.max(0, tempBlueFlags1 - 1)" class="p-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
                      <LucideMinus class="w-3 h-3" />
                    </button>
                    <span class="text-3xl font-bold w-12 text-center text-blue-600">{{ tempBlueFlags1 }}</span>
                    <button @click="tempBlueFlags1 = Math.min(5, tempBlueFlags1 + 1)" class="p-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
                      <LucidePlus class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="text-center pt-2 border-t border-gray-200">
                <span class="text-sm text-gray-500">Total: </span>
                <span class="text-2xl font-bold text-blue-600">{{ tempRedFlags1 + tempBlueFlags1 }}</span>
              </div>
            </div>

            <div class="h-px bg-gray-200"></div>

            <!-- Competidor 2 -->
            <div class="space-y-3 p-4 bg-white border-2 border-gray-200 rounded-lg">
              <div class="font-semibold text-lg text-gray-900">{{ selectedMatch?.competitor2?.name || "Pendiente" }}</div>
              <div v-if="selectedMatch?.competitor2?.academy" class="text-sm text-gray-500">{{ selectedMatch.competitor2.academy }}</div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    🚩 Banderas Rojas
                  </label>
                  <div class="flex items-center gap-2">
                    <button @click="tempRedFlags2 = Math.max(0, tempRedFlags2 - 1)" class="p-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
                      <LucideMinus class="w-3 h-3" />
                    </button>
                    <span class="text-3xl font-bold w-12 text-center text-red-600">{{ tempRedFlags2 }}</span>
                    <button @click="tempRedFlags2 = Math.min(5, tempRedFlags2 + 1)" class="p-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
                      <LucidePlus class="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <label class="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    🔵 Banderas Azules
                  </label>
                  <div class="flex items-center gap-2">
                    <button @click="tempBlueFlags2 = Math.max(0, tempBlueFlags2 - 1)" class="p-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
                      <LucideMinus class="w-3 h-3" />
                    </button>
                    <span class="text-3xl font-bold w-12 text-center text-blue-600">{{ tempBlueFlags2 }}</span>
                    <button @click="tempBlueFlags2 = Math.min(5, tempBlueFlags2 + 1)" class="p-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
                      <LucidePlus class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="text-center pt-2 border-t border-gray-200">
                <span class="text-sm text-gray-500">Total: </span>
                <span class="text-2xl font-bold text-blue-600">{{ tempRedFlags2 + tempBlueFlags2 }}</span>
              </div>
            </div>

            <!-- Indicador de ganador para Kata -->
            <div v-if="kataWinner" class="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <LucideTrophy class="w-5 h-5 text-blue-600" />
              <span class="font-semibold text-blue-700">Ganador: {{ kataWinner }}</span>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
          <button @click="closeDialog" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancelar
          </button>
          <button @click="handleSaveResult" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 min-w-[150px]">
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

// --- Estado del diálogo ---
const showDialog = ref(false)
const selectedMatch = ref<MatchTransformed | null>(null)
const dialogContentRef = ref<HTMLElement | null>(null)

// Tipo de competencia
const competitionType = ref<'kumite' | 'kata'>('kumite')

// Variables para Kumite
const tempScore1 = ref(0)
const tempScore2 = ref(0)
const tempFouls1 = ref(0)
const tempFouls2 = ref(0)
const tempSenshu1 = ref(false)
const tempSenshu2 = ref(false)
const tempHansoku1 = ref(false)
const tempHansoku2 = ref(false)

// Variables para Kata
const tempRedFlags1 = ref(0)
const tempBlueFlags1 = ref(0)
const tempRedFlags2 = ref(0)
const tempBlueFlags2 = ref(0)

// Estado de categorías
const selectedCategoryId = ref<number | null>(null)

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
  modality?: 'Kumite' | 'Kata'; // Tipo de competencia detectado desde la categoría
  categoryInfo?: string; // Información adicional de la categoría
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
    nextMatchSide: match.nextMatchSide,
    modality: match.championshipCategory?.modality, // Detectar modalidad automáticamente
    categoryInfo: match.championshipCategory 
      ? `${match.championshipCategory.modality} ${match.championshipCategory.gender} - ${match.championshipCategory.ageRange.label}`
      : undefined
  };
}

// ⭐ FUNCIÓN PARA CALCULAR LA PROFUNDIDAD NECESARIA DEL BRACKET ⭐
function calculateBracketDepth(matches: MatchTransformed[]): number {
  const finalMatch = matches.find(m => m.nextMatchId === null);
  if (!finalMatch) {
    console.log('⚠️ No se encontró match final');
    return 1;
  }
  
  console.log('📊 Final match encontrado:', finalMatch);
  
  function getMaxDepth(matchId: number, currentDepth: number = 1): number {
    const children = matches.filter(m => m.nextMatchId === matchId && m.id > 0); // Solo matches reales
    
    console.log(`🌳 Depth ${currentDepth} - Match ID ${matchId} - Children:`, children.length);
    
    if (children.length === 0) {
      return currentDepth;
    }
    
    const childDepths = children.map(child => getMaxDepth(child.id, currentDepth + 1));
    return Math.max(...childDepths);
  }
  
  const depth = getMaxDepth(finalMatch.id);
  console.log('📏 Profundidad total calculada:', depth);
  return depth;
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
  
  console.log('🔍 DEBUG Brackets - Total matches from store:', championshipStore.matches.length);
  console.log('🔍 DEBUG Brackets - Selected category:', selectedCategoryId.value);
  console.log('🔍 DEBUG Brackets - Filtered matches count:', filteredMatches.length);
  console.log('🔍 DEBUG Brackets - Filtered matches:', filteredMatches);
  
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

// ⭐ FUNCIÓN PARA GENERAR NOMBRES DE RONDAS DINÁMICAMENTE ⭐
function getRoundName(depth: number, currentRound: number): string {
  const roundsFromFinal = depth - currentRound;
  
  switch (roundsFromFinal) {
    case 0: return 'Final';
    case 1: return 'Semifinal';
    case 2: return 'Cuartos de Final';
    case 3: return 'Octavos de Final';
    case 4: return 'Dieciseisavos de Final';
    case 5: return 'Treintaidosavos de Final';
    case 6: return 'Sesentaicuatroavos de Final';
    default: return `Ronda ${currentRound}`;
  }
}

// Generar array de nombres de rondas desde la primera hasta la final
const roundHeaders = computed(() => {
  const headers: string[] = [];
  for (let i = 1; i <= bracketDepth.value; i++) {
    headers.push(getRoundName(bracketDepth.value, i));
  }
  return headers;
});

// Determinar ganador en modo Kumite
const kumiteWinner = computed(() => {
  if (!selectedMatch.value) return null;
  
  const comp1 = selectedMatch.value.competitor1;
  const comp2 = selectedMatch.value.competitor2;
  
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

// Determinar ganador en modo Kata
const kataWinner = computed(() => {
  if (!selectedMatch.value) return null;
  
  const comp1 = selectedMatch.value.competitor1;
  const comp2 = selectedMatch.value.competitor2;
  
  if (!comp1 || !comp2) return null;
  
  const total1 = tempRedFlags1.value + tempBlueFlags1.value;
  const total2 = tempRedFlags2.value + tempBlueFlags2.value;
  
  if (total1 > total2) return comp1.name;
  if (total2 > total1) return comp2.name;
  
  return "Empate";
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
  
  // 🎯 DETECCIÓN AUTOMÁTICA: Usar la modalidad de la categoría
  competitionType.value = match.modality?.toLowerCase() === 'kata' ? 'kata' : 'kumite';
  
  // Kumite
  tempScore1.value = match.score1 || 0;
  tempScore2.value = match.score2 || 0;
  tempFouls1.value = 0;
  tempFouls2.value = 0;
  tempSenshu1.value = false;
  tempSenshu2.value = false;
  tempHansoku1.value = false;
  tempHansoku2.value = false;
  
  // Kata
  tempRedFlags1.value = 0;
  tempBlueFlags1.value = 0;
  tempRedFlags2.value = 0;
  tempBlueFlags2.value = 0;
  
  showDialog.value = true;
};

const closeDialog = () => { 
  showDialog.value = false; 
  selectedMatch.value = null; 
  
  // Reset Kumite
  tempScore1.value = 0;
  tempScore2.value = 0;
  tempFouls1.value = 0;
  tempFouls2.value = 0;
  tempSenshu1.value = false;
  tempSenshu2.value = false;
  tempHansoku1.value = false;
  tempHansoku2.value = false;
  
  // Reset Kata
  tempRedFlags1.value = 0;
  tempBlueFlags1.value = 0;
  tempRedFlags2.value = 0;
  tempBlueFlags2.value = 0;
  
  // Reset tipo de competencia
  competitionType.value = 'kumite';
};

const handleSaveResult = async () => {
  if (!selectedMatch.value) return;
  
  const currentMatch = selectedMatch.value;
  
  let winnerId: number | undefined;
  
  if (competitionType.value === 'kumite') {
    // Validar que no haya empate total
    if (kumiteWinner.value === "Empate" || kumiteWinner.value === "Ambos descalificados") {
      alert("Debe haber un ganador claro. No puede haber empate.");
      return;
    }
    
    // Determinar winnerId basado en el nombre del ganador
    if (kumiteWinner.value === currentMatch.competitor1?.name) {
      winnerId = currentMatch.competitor1.id;
    } else if (kumiteWinner.value === currentMatch.competitor2?.name) {
      winnerId = currentMatch.competitor2.id;
    }
  } else {
    // Modo Kata
    if (kataWinner.value === "Empate") {
      alert("Debe haber un ganador claro. No puede haber empate.");
      return;
    }
    
    // Determinar winnerId basado en el nombre del ganador
    if (kataWinner.value === currentMatch.competitor1?.name) {
      winnerId = currentMatch.competitor1.id;
    } else if (kataWinner.value === currentMatch.competitor2?.name) {
      winnerId = currentMatch.competitor2.id;
    }
  }
  
  if (!winnerId) {
    alert("Error al determinar el ganador");
    return;
  }
  
  try {
    // Actualizar resultado en el backend
    // Nota: Por ahora enviamos solo scoreAkka/scoreAo
    // TODO: Actualizar backend para aceptar fouls, senshu, hansoku, flags
    await championshipStore.updateMatchResult(currentMatch.id, winnerId, {
      scoreAkka: competitionType.value === 'kumite' ? tempScore1.value : tempRedFlags1.value + tempBlueFlags1.value,
      scoreAo: competitionType.value === 'kumite' ? tempScore2.value : tempRedFlags2.value + tempBlueFlags2.value
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