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

    <!-- Modal para registrar resultados -->
    <BracketModal 
      :open="showDialog"
      :match="selectedMatch"
      @close="closeDialog"
      @save="handleSaveResult"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BracketNode from '@/modules/championships/components/brackets/BracketNode.vue';
import BracketModal from '@/modules/championships/components/brackets/BracketModal.vue';
import { useChampionshipStore } from '@/modules/championships/store/championships.store';
import type { Match } from '@/modules/championships/types';

const route = useRoute();
const championshipStore = useChampionshipStore();

// --- Estado del diálogo ---
const showDialog = ref(false)
const selectedMatch = ref<MatchTransformed | null>(null)

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

// --- Handlers ---
const handleOpenMatch = (match: MatchTransformed) => { 
  console.log('🎯 Abriendo match:', {
    id: match.id,
    matchNumber: match.matchNumber,
    status: match.status,
    competitor1: match.competitor1?.name,
    competitor2: match.competitor2?.name
  });
  
  // No permitir clicks en matches BYE (vacíos) o con ID negativo
  if (match.id <= 0 || match.status === 'BYE') {
    console.warn('⚠️ Match no válido (BYE o ID <= 0)');
    return; 
  }

  // Verificar si el usuario es administrador
  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole === "Administrador";

  // Solo permitir abrir modal a administradores
  if (!isAdmin) {
    // alert('Solo los administradores pueden registrar o editar resultados de los combates.');
    return;
  }

  if(match.status === 'Completado') {
    // Administrador puede editar match completado
    console.log('🔧 Administrador puede editar match completado');
  }
  
  if (!match.competitor1 || !match.competitor2) {
    alert("Aún no se han definido los competidores."); 
    return; 
  }
  
  selectedMatch.value = match;
  showDialog.value = true;
};

const closeDialog = () => { 
  showDialog.value = false; 
  selectedMatch.value = null; 
};

const handleSaveResult = async (winnerId: number, scores: { scoreAkka: number; scoreAo: number }) => {
  if (!selectedMatch.value) return;
  
  const currentMatch = selectedMatch.value;
  
  // Validación adicional del ID del match
  if (!currentMatch.id || currentMatch.id <= 0) {
    alert(`Error: ID de match inválido (${currentMatch.id}). No se puede guardar el resultado.`);
    console.error('Match inválido:', currentMatch);
    return;
  }
  
  console.log('Guardando resultado para match:', {
    matchId: currentMatch.id,
    matchNumber: currentMatch.matchNumber,
    winnerId,
    scores
  });
  
  try {
    // Actualizar resultado en el backend
    await championshipStore.updateMatchResult(currentMatch.id, winnerId, scores);
    
    // Recargar matches de la categoría actual
    if (selectedCategoryId.value) {
      await championshipStore.fetchMatches(selectedCategoryId.value);
    }
    
    closeDialog();
  } catch (error) {
    console.error('Error al guardar resultado:', error);
    alert(`Error al guardar el resultado del combate. Match ID: ${currentMatch.id}, Error: ${error instanceof Error ? error.message : 'Desconocido'}`);
  }
};

// Handler para cambio de categoría
const handleCategoryChange = async () => {
  if (selectedCategoryId.value) {
    await championshipStore.fetchMatches(selectedCategoryId.value);
    
    console.log('📋 Matches cargados para categoría:', selectedCategoryId.value);
    console.log('📊 Total matches:', championshipStore.matches.length);
    console.log('🔢 IDs de matches disponibles:', championshipStore.matches.map(m => m.id));
  }
};

// Cargar categorías y matches al montar
onMounted(async () => {
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
        
        console.log('📋 Matches iniciales cargados');
        console.log('📊 Total matches:', championshipStore.matches.length);
        console.log('🔢 IDs de matches disponibles:', championshipStore.matches.map(m => m.id));
      }
    }
  }
});
</script>

<style scoped>
/* Estilos adicionales si es necesario */
</style>