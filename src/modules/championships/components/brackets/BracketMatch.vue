<template>
  <!-- Match real (id positivo) -->
  <div
    v-if="match.id > 0"
    :class="[
      'bg-white border border-gray-300 rounded-md p-3 w-64 shadow-sm transition-shadow',
      'hover:shadow-lg cursor-pointer'
    ]"
    @click="$emit('openMatch', match)"
  >
    <div class="flex justify-between items-center mb-2">
      <span class="text-xs text-gray-500">Match #{{ match.matchNumber }}</span>
      <span :class="getStatusBadgeClasses(match.status)">
        {{ getStatusLabel(match.status) }}
      </span>
    </div>
    
    <div :class="getCompetitorClasses(match, match.competitor1)">
       <div class="flex-1 overflow-hidden mr-2">
        <p class="font-medium text-sm text-gray-900 truncate">{{ match.competitor1?.name || "Pendiente" }}</p>
        <p v-if="match.competitor1?.academy" class="text-xs text-gray-500 truncate">{{ match.competitor1.academy }}</p>
      </div>
      <span v-if="match.score1 !== null" class="font-bold text-lg">{{ match.score1 }}</span>
    </div>
    
    <div class="h-px bg-gray-200 my-1.5"></div>
    
    <div :class="getCompetitorClasses(match, match.competitor2)">
      <div class="flex-1 overflow-hidden mr-2">
        <p class="font-medium text-sm text-gray-900 truncate">{{ match.competitor2?.name || "Pendiente" }}</p>
        <p v-if="match.competitor2?.academy" class="text-xs text-gray-500 truncate">{{ match.competitor2.academy }}</p>
      </div>
      <span v-if="match.score2 !== null" class="font-bold text-lg">{{ match.score2 }}</span>
    </div>
  </div>
  
  <!-- Match BYE (fantasma vacío pero con estructura de match) -->
  <div v-else class="bg-white border border-gray-200 rounded-md p-3 w-64 shadow-sm opacity-70">
    <div class="flex justify-between items-center mb-2">
      <span class="text-xs text-gray-400 invisible">Match #0</span>
      <span class="text-xs text-gray-400 invisible">-</span>
    </div>
    
    <!-- Competidor 1 vacío -->
    <div class="flex items-center justify-between p-2 rounded bg-gray-50">
      <div class="flex-1 overflow-hidden mr-2">
        <p class="font-medium text-sm text-gray-300 truncate">-</p>
        <p class="text-xs text-gray-200 truncate">-</p>
      </div>
      <span class="font-bold text-lg text-gray-300 invisible">0</span>
    </div>
    
    <div class="h-px bg-gray-200 my-1.5"></div>
    
    <!-- Competidor 2 vacío -->
    <div class="flex items-center justify-between p-2 rounded bg-gray-50">
      <div class="flex-1 overflow-hidden mr-2">
        <p class="font-medium text-sm text-gray-300 truncate">-</p>
        <p class="text-xs text-gray-200 truncate">-</p>
      </div>
      <span class="font-bold text-lg text-gray-300 invisible">0</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

// --- Tipos Locales (Necesarios para el Match) ---
interface Competitor { id: number; name: string; academy?: string; }
interface MatchTransformed { 
  id: number; matchNumber: number; competitor1?: Competitor; competitor2?: Competitor; winner?: number;
  score1: number | null; score2: number | null; status: string; 
}
// ----------------------------------------------------

const props = defineProps({
  match: { type: Object as PropType<MatchTransformed>, required: true }
});

const emit = defineEmits(['openMatch']);

// --- FUNCIONES DE ESTILO ---

const getStatusLabel = (status: string): string => {
  const labels: { [key: string]: string } = { 
    Pendiente: "Pendiente", 
    Completado: "Finalizado", 
    BYE: "" 
  };
  return labels[status] || status;
};

const getStatusBadgeClasses = (status: string): string => {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold";
  const variants: { [key: string]: string } = {
    Pendiente: "bg-gray-100 text-gray-600",
    Completado: "bg-green-100 text-green-700",
    BYE: "hidden"
  };
  return `${base} ${variants[status] || variants.Pendiente}`;
};

const getCompetitorClasses = (match: MatchTransformed, competitor: Competitor | undefined): string => {
  const base = "flex items-center justify-between p-2 rounded";
  
  // Si el competidor es el ganador
  if (competitor && match.winner === competitor.id) {
    return `${base} bg-green-50 border-l-4 border-green-500`;
  }
  // Si el combate terminó y el competidor no es el ganador
  if (match.status === 'Completado' && competitor && match.winner !== competitor.id) {
    return `${base} bg-red-50 opacity-70`;
  }
  // Si es un slot vacío (Pendiente/BYE)
  if (!competitor) {
    return `${base} bg-gray-100`;
  }
  return `${base} bg-white`; 
};
</script>