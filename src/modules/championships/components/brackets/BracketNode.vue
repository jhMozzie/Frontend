<template>
  <div class="flex flex-row-reverse">
    
    <div 
      class="relative ml-[50px] flex items-center"
    >
      <div 
        v-if="!isRoot" 
        class="absolute w-[25px] h-0.5 left-0 top-1/2 bg-gray-300 -translate-x-full"
      ></div>

      <BracketMatch :match="match" @open-match="$emit('openMatch', $event)" />
    </div>

    <div v-if="childAkka || childAo" class="flex flex-col justify-center">
      
      <div 
        class="flex items-start justify-end my-[10px] relative
               before:content-[''] before:absolute before:bg-gray-300 before:right-0 before:top-1/2 before:translate-x-full before:w-[25px] before:h-0.5"
      >
        <div 
          class="absolute w-0.5 bg-gray-300 right-[-25px] top-1/2 h-[calc(50%+22px)]"
          :class="{ 
             // 💡 El hijo Akka (superior) NUNCA es 'last-child' en la iteración recursiva
             'translate-y-0': true 
          }"
        ></div>
        
        <BracketNode 
          v-if="childAkka" 
          :match="childAkka" 
          :all-matches="allMatches" 
          @open-match="$emit('openMatch', $event)" 
          :is-root="false"
        />
        <div v-else class="w-64 h-24 opacity-0"></div>
      </div>
      
      <div 
        class="flex items-start justify-end my-[10px] relative
               before:content-[''] before:absolute before:bg-gray-300 before:right-0 before:top-1/2 before:translate-x-full before:w-[25px] before:h-0.5"
      >
        <div 
          class="absolute w-0.5 h-[calc(50%+22px)] bg-gray-300 right-[-25px] top-1/2 -translate-y-full"
        ></div>
        
        <BracketNode 
          v-if="childAo" 
          :match="childAo" 
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
// ----------------------------------------------------

const props = defineProps({
  match: { type: Object as PropType<MatchTransformed>, required: true },
  allMatches: { type: Array as PropType<MatchTransformed[]>, required: true },
  isRoot: { type: Boolean, default: true }, 
  // ❌ Eliminamos isLastChild de props porque no se usa en este componente
});

defineEmits(['openMatch']);

// Lógica recursiva: Encontrar los combates que alimentan este
const childAkka = computed(() => {
  return props.allMatches.find(m => m.nextMatchId === props.match.id && m.nextMatchSide === 'Akka');
});

const childAo = computed(() => {
  return props.allMatches.find(m => m.nextMatchId === props.match.id && m.nextMatchSide === 'Ao');
});
</script>