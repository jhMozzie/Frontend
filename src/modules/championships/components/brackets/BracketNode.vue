<template>
  <div class="flex flex-row-reverse">
    <!-- Match actual (solo si NO es BYE) -->
    <div 
      class="relative ml-[50px] flex items-center"
    >
      <div 
        v-if="hasChildren" 
        class="absolute w-[25px] h-0.5 left-0 top-1/2 bg-gray-300 -translate-x-full"
      ></div>
      <BracketMatch :match="match" @open-match="$emit('openMatch', $event)" />
    </div>

    <!-- Hijos (matches anteriores) -->
    <div v-if="childAkka || childAo" class="flex flex-col justify-center">
      <!-- Hijo Akka (superior) -->
      <div 
        class="flex items-start justify-end my-[10px] relative
               before:content-[''] before:absolute before:bg-gray-300 before:right-0 before:top-1/2 before:translate-x-full before:w-[25px] before:h-0.5"
      >
        <div 
          class="absolute w-0.5 bg-gray-300 right-[-25px] top-1/2 h-[calc(50%+22px)]"
          :class="{ 'translate-y-0': true }"
        ></div>
        
        <!-- 💥 NUEVO: Si el hijo es BYE, saltar al siguiente nivel -->
        <BracketNode 
          v-if="effectiveChildAkka" 
          :match="effectiveChildAkka" 
          :all-matches="allMatches" 
          @open-match="$emit('openMatch', $event)" 
          :is-root="false"
        />
        <div v-else class="w-64 h-24 opacity-0"></div>
      </div>

      <!-- Hijo Ao (inferior) -->
      <div 
        class="flex items-start justify-end my-[10px] relative
               before:content-[''] before:absolute before:bg-gray-300 before:right-0 before:top-1/2 before:translate-x-full before:w-[25px] before:h-0.5"
      >
        <div 
          class="absolute w-0.5 h-[calc(50%+22px)] bg-gray-300 right-[-25px] top-1/2 -translate-y-full"
        ></div>
        
        <!-- 💥 NUEVO: Si el hijo es BYE, saltar al siguiente nivel -->
        <BracketNode 
          v-if="effectiveChildAo" 
          :match="effectiveChildAo" 
          :all-matches="allMatches"
          @open-match="$emit('openMatch', $event)"
          :is-root="false"
        />
        <div v-else class="w-64 h-24 opacity-0"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import BracketMatch from './BracketMatch.vue';

// --- Tipos ---
interface Competitor { id: number; name: string; academy?: string; }
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

const props = defineProps({
  match: { type: Object as PropType<MatchTransformed>, required: true },
  allMatches: { type: Array as PropType<MatchTransformed[]>, required: true },
  isRoot: { type: Boolean, default: true },
});

defineEmits(['openMatch']);

// --- LÓGICA ORIGINAL ---
const childAkka = computed(() => {
  return props.allMatches.find(m => m.nextMatchId === props.match.id && m.nextMatchSide === 'Akka');
});

const childAo = computed(() => {
  return props.allMatches.find(m => m.nextMatchId === props.match.id && m.nextMatchSide === 'Ao');
});

// --- 💥 NUEVA LÓGICA: SALTAR MATCHES CON BYE ---

/**
 * Función recursiva que busca el primer match real (sin BYE) en la cadena
 * Si un match tiene BYE, salta a sus hijos hasta encontrar un match real
 */
function getEffectiveMatch(match: MatchTransformed | undefined): MatchTransformed | null {
  if (!match) return null;
  
  // Si el match tiene BYE (solo un participante y está completado), saltar a sus hijos
  const isByeMatch = match.status === 'BYE' || 
                     (match.status === 'Completado' && 
                      ((match.competitor1 && !match.competitor2) || 
                       (!match.competitor1 && match.competitor2)));
  
  if (isByeMatch) {
    // Buscar los hijos de este match con BYE
    const byeChildAkka = props.allMatches.find(m => m.nextMatchId === match.id && m.nextMatchSide === 'Akka');
    const byeChildAo = props.allMatches.find(m => m.nextMatchId === match.id && m.nextMatchSide === 'Ao');
    
    // Intentar obtener el match efectivo de cualquiera de los hijos
    const effectiveFromAkka = getEffectiveMatch(byeChildAkka);
    if (effectiveFromAkka) return effectiveFromAkka;
    
    const effectiveFromAo = getEffectiveMatch(byeChildAo);
    if (effectiveFromAo) return effectiveFromAo;
    
    return null; // No hay match real detrás del BYE
  }
  
  // Si no es BYE, retornar el match actual
  return match;
}

// Computed que retorna el match efectivo (saltando BYEs)
const effectiveChildAkka = computed(() => {
  return getEffectiveMatch(childAkka.value);
});

const effectiveChildAo = computed(() => {
  return getEffectiveMatch(childAo.value);
});

// Verificar si este nodo tiene hijos visuales (después de saltar BYEs)
const hasChildren = computed(() => {
  return effectiveChildAkka.value || effectiveChildAo.value;
});
</script>