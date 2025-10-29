<template>
  <div class="space-y-6">

    <div class="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <label for="category-select" class="block text-sm font-medium text-gray-700">
          Seleccionar Categoría para ver Brackets
        </label>
        <button v-if="selectedCategoryId" @click="selectedCategoryId = null" class="text-xs text-red-600 hover:underline">
          &larr; Volver a la lista
        </button>
      </div>

      <select
        id="category-select"
        v-model="selectedCategoryId"
        class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-red-500"
      >
        <option :value="null" disabled>Seleccione una categoría...</option>
        <option v-for="cat in availableCategories" :key="cat.id" :value="cat.id">
          {{ cat.code }} - {{ generateCategoryName(cat) }} ({{ cat.participantCount }} inscritos)
        </option>
      </select>
    </div>

    <div v-if="matchesLoading" class="text-center py-12 text-gray-500">
      <LucideLoader2 class="h-10 w-10 mx-auto mb-3 text-gray-400 animate-spin" />
      <p>Cargando brackets...</p>
    </div>
    <div v-else-if="matchesError" class="text-center py-12 text-red-500">
      <LucideAlertTriangle class="h-10 w-10 mx-auto mb-3" />
      <p>{{ matchesError }}</p>
    </div>
    <div v-else-if="!selectedCategoryId" class="text-center py-12 text-gray-500">
      <LucideInbox class="h-10 w-10 mx-auto mb-3 text-gray-400" />
      <p>Por favor, seleccione una categoría para ver sus combates.</p>
    </div>
    <div v-else-if="finalMatches.length === 0" class="text-center py-12 text-gray-500">
      <LucideInbox class="h-10 w-10 mx-auto mb-3 text-gray-400" />
      <p>No se han generado combates para esta categoría.</p>
    </div>

    <div v-else class="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <div class="flex justify-center min-w-max p-6">
          
          <div v-for="finalMatch in finalMatches" :key="finalMatch.id" class="flex flex-col justify-center">
            <BracketNode 
              :match="finalMatch" 
              :all-matches="transformedMatches"
              @open-match="handleOpenMatch"
            />
          </div>
          
        </div>
      </div>
    </div>
    
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useChampionshipStore } from '@/modules/championships/store/championships.store';
import type { ChampionshipCategoryListItem } from '@/modules/championships/types/championships-categories.types';
import type { Match, MatchParticipant } from '@/modules/championships/types'; 
import { LucideLoader2, LucideAlertTriangle, LucideInbox } from 'lucide-vue-next';
// 💥 Importar los nuevos componentes
import BracketNode from '@/modules/championships/components/brackets/BracketNode.vue'; 
// (BracketMatch.vue es usado solo dentro de BracketNode.vue)

// --- Tipos de Salida (Adaptados a tu template) ---
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
// ---------------------------------------------------------------------------

// --- Store y Estado ---
const route = useRoute();
const championshipStore = useChampionshipStore();

const { 
  championshipCategories,
  categoriesLoading, 
  matches, // Esta es la lista PLANA de la API
  matchesLoading,
  matchesError
} = storeToRefs(championshipStore) as any;

const { fetchChampionshipCategories, fetchMatches } = championshipStore as any; 

const championshipId = computed(() => Number(route.params.id));
const selectedCategoryId = ref<number | null>(null);

// --- Carga Inicial ---
onMounted(() => {
    if (championshipCategories.value.length === 0 && !categoriesLoading.value) {
        fetchChampionshipCategories(championshipId.value, 1, 999);
    }
});

// --- Lógica de Brackets y Transformación ---

const availableCategories = computed(() => {
  return championshipCategories.value.filter((cat: ChampionshipCategoryListItem) => cat.participantCount > 0);
});

// 2. Transforma el Match del backend al formato MatchTransformed
const transformedMatches = computed((): MatchTransformed[] => {
    return matches.value.map((match: Match) => {
        const mapParticipant = (p: MatchParticipant | null | undefined): Competitor | undefined => {
            if (!p) return undefined;
            return {
                id: p.id,
                name: `${p.student.firstname} ${p.student.lastname}`,
                academy: p.student.academy.name
            };
        };

        return {
            id: match.id,
            matchNumber: match.matchNumber,
            competitor1: mapParticipant(match.participantAkka),
            competitor2: mapParticipant(match.participantAo),
            winner: match.winnerId || undefined,
            score1: match.scoreAkka,
            score2: match.scoreAo,
            status: match.status,
            nextMatchId: match.nextMatchId,
            nextMatchSide: match.nextMatchSide
        };
    });
});

// 3. 💥 Encuentra la(s) Final(es) (los matches sin nextMatchId)
const finalMatches = computed(() => {
    return transformedMatches.value.filter(m => m.nextMatchId === null);
});


// 4. Watcher: Carga los brackets cuando el ID seleccionado cambia
watch(selectedCategoryId, (newId) => {
  if (newId) {
    fetchMatches(newId);
  } else {
    (championshipStore as any).matches = []; 
  }
});


// --- Funciones Auxiliares ---
function generateCategoryName(cat: ChampionshipCategoryListItem): string {
    let name = `${cat.modality} ${cat.gender} ${cat.ageRangeLabel}`;
    if (cat.modality === 'Kumite' && cat.weight) {
        name += ` ${cat.weight}`;
    }
    return name;
}

function getWinnerName(match: MatchTransformed): string {
    if (!match.winner) return "N/A";
    if (match.competitor1?.id === match.winner) return match.competitor1.name;
    if (match.competitor2?.id === match.winner) return match.competitor2.name;
    return "N/A";
}

// --- Handlers de Simulación (Dialog) ---
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
    alert(`Abrir diálogo para registrar resultado del Match #${match.matchNumber} (Akka: ${match.competitor1?.name}, Ao: ${match.competitor2?.name}).`);
};
</script>