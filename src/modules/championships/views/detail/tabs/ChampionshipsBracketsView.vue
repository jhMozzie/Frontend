<template>
  <div> <div class="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
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

    <div class="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <div class="flex gap-8 min-w-max p-6">
          <div v-for="(round, roundIndex) in brackets" :key="round.round" class="flex flex-col justify-around min-h-[400px]">
             <div class="text-center mb-4 font-semibold text-gray-800">
              {{ getRoundName(roundIndex) }}
            </div>
            <div class="flex flex-col gap-10">
              <div v-for="match in round.matches" :key="match.id" class="relative">
                <div
                  class="bg-gray-50 border border-gray-200 rounded-lg p-3 w-64 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  @click="handleOpenMatch(match, roundIndex)"
                >
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-xs text-gray-500">Match #{{ match.id }}</span>
                    <span :class="getStatusBadgeClasses(match.status)">
                      {{ getStatusLabel(match.status) }}
                    </span>
                  </div>
                  <div :class="getCompetitorClasses(match, match.competitor1)">
                     <div class="flex-1 overflow-hidden mr-2">
                      <p class="font-medium text-sm text-gray-900 truncate">{{ match.competitor1?.name || "Pendiente" }}</p>
                      <p v-if="match.competitor1?.academy" class="text-xs text-gray-500 truncate">{{ match.competitor1.academy }}</p>
                    </div>
                    <span v-if="match.score1 !== undefined" class="font-bold text-lg">{{ match.score1 }}</span>
                  </div>
                  <div class="h-px bg-gray-200 my-1.5"></div>
                  <div :class="getCompetitorClasses(match, match.competitor2)">
                    <div class="flex-1 overflow-hidden mr-2">
                      <p class="font-medium text-sm text-gray-900 truncate">{{ match.competitor2?.name || "Pendiente" }}</p>
                      <p v-if="match.competitor2?.academy" class="text-xs text-gray-500 truncate">{{ match.competitor2.academy }}</p>
                    </div>
                    <span v-if="match.score2 !== undefined" class="font-bold text-lg">{{ match.score2 }}</span>
                  </div>
                </div>
                <div v-if="roundIndex < brackets.length - 1" class="absolute left-full top-1/2 w-8 h-px bg-gray-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDialog" class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md" ref="dialogContentRef">
        <div class="border-b border-gray-200 px-6 py-4"><h3 class="text-lg font-semibold text-gray-900">Registrar Resultado - Match #{{ selectedMatch?.id }}</h3></div>
        <div class="space-y-6 p-6">
          <div class="space-y-1">
            <div class="font-medium">{{ selectedMatch?.competitor1?.name || "Pendiente" }}</div>
            <div v-if="selectedMatch?.competitor1?.academy" class="text-sm text-gray-500">{{ selectedMatch.competitor1.academy }}</div>
            <div class="flex items-center gap-3 pt-1">
              <button @click="adjustScore('tempScore1', -1)" :disabled="tempScore1 <= 0"> <LucideMinus class="w-4 h-4" /> </button>
              <div class="text-3xl font-bold w-16 text-center tabular-nums">{{ tempScore1 }}</div>
              <button @click="adjustScore('tempScore1', 1)"> <LucidePlus class="w-4 h-4" /> </button>
            </div>
          </div>
          <div class="h-px bg-gray-200"></div>
          <div class="space-y-1">
            <div class="font-medium">{{ selectedMatch?.competitor2?.name || "Pendiente" }}</div>
            <div v-if="selectedMatch?.competitor2?.academy" class="text-sm text-gray-500">{{ selectedMatch.competitor2.academy }}</div>
            <div class="flex items-center gap-3 pt-1">
              <button @click="adjustScore('tempScore2', -1)" :disabled="tempScore2 <= 0"> <LucideMinus class="w-4 h-4" /> </button>
              <div class="text-3xl font-bold w-16 text-center tabular-nums">{{ tempScore2 }}</div>
              <button @click="adjustScore('tempScore2', 1)"> <LucidePlus class="w-4 h-4" /> </button>
            </div>
          </div>
           <div v-if="tempScore1 !== tempScore2" class="flex items-center gap-2 text-sm text-green-600 font-medium"> <LucideTrophy class="w-4 h-4" /> <span>Ganador: {{ tempScore1 > tempScore2 ? selectedMatch?.competitor1?.name : selectedMatch?.competitor2?.name }}</span> </div>
           <div v-else class="text-sm text-gray-500 italic"> El resultado es un empate. </div>
        </div>
        <div class="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
          <button @click="closeDialog">Cancelar</button>
          <button @click="handleSaveResult">Guardar Resultado</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
// (El script setup se mantiene exactamente igual que en la versión anterior)
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { LucidePlus, LucideMinus, LucideTrophy } from 'lucide-vue-next';

interface Competitor { id: number; name: string; academy?: string; seed?: number; }
interface Match { id: number; competitor1?: Competitor; competitor2?: Competitor; winner?: number; score1?: number; score2?: number; status: "pending" | "in_progress" | "finished"; }
interface BracketRound { round: number; matches: Match[]; }

const bracketsData: BracketRound[] = [ { round: 1, matches: [ { id: 1, competitor1: { id: 1, name: "Juan Pérez", academy: "Academia Dragón Rojo" }, competitor2: { id: 2, name: "Carlos Ruiz", academy: "Dojo Shotokan" }, winner: 1, score1: 8, score2: 5, status: "finished" }, { id: 2, competitor1: { id: 3, name: "Miguel Sanz", academy: "Club Tradicional" }, competitor2: { id: 4, name: "Pedro López", academy: "Escuela Marcial" }, winner: 3, score1: 7, score2: 4, status: "finished" }, ], }, { round: 2, matches: [ { id: 3, competitor1: { id: 1, name: "Juan Pérez", academy: "Academia Dragón Rojo" }, competitor2: { id: 3, name: "Miguel Sanz", academy: "Club Tradicional" }, status: "pending" }, ], }, { round: 3, matches: [ { id: 4, status: "pending" }, ], }, ];
const brackets = ref<BracketRound[]>(bracketsData);
const selectedCategory = ref("senior-m-75");
const selectedMatch = ref<Match | null>(null);
const tempScore1 = ref(0);
const tempScore2 = ref(0);
const showDialog = ref(false);
const dialogContentRef = ref<HTMLElement | null>(null);
const selectedRoundIndex = ref<number | null>(null);

const handleOpenMatch = (match: Match, roundIndex: number) => { if (!match.competitor1 || !match.competitor2) { alert("Aún no se han definido los competidores."); return; } selectedMatch.value = match; selectedRoundIndex.value = roundIndex; tempScore1.value = match.score1 ?? 0; tempScore2.value = match.score2 ?? 0; showDialog.value = true; };
const closeDialog = () => { showDialog.value = false; selectedMatch.value = null; selectedRoundIndex.value = null; };
const handleSaveResult = () => { if (!selectedMatch.value) return; const winnerId = tempScore1.value > tempScore2.value ? selectedMatch.value.competitor1?.id : tempScore1.value < tempScore2.value ? selectedMatch.value.competitor2?.id : undefined; const rIndex = selectedRoundIndex.value ?? brackets.value.findIndex(r => r.matches.some(m => m.id === selectedMatch.value?.id)); const matchIndex = brackets.value[rIndex]?.matches.findIndex(m => m.id === selectedMatch.value?.id) ?? -1; if (rIndex !== -1 && matchIndex !== -1) { const targetMatch = brackets.value[rIndex]?.matches[matchIndex]; if (targetMatch) { targetMatch.score1 = tempScore1.value; targetMatch.score2 = tempScore2.value; targetMatch.winner = winnerId as number | undefined; targetMatch.status = "finished" as const; console.log("Resultado guardado (localmente):", targetMatch); } else { console.error("Error al actualizar partido"); } } else { console.error("No se encontró el partido"); } closeDialog(); };
const handleClickOutsideDialog = (event: MouseEvent) => { if (showDialog.value && dialogContentRef.value && !dialogContentRef.value.contains(event.target as Node)) { closeDialog(); } };
onMounted(() => document.addEventListener('mousedown', handleClickOutsideDialog));
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutsideDialog));
const getRoundName = (index: number): string => { const totalRounds = brackets.value.length; if (index === totalRounds - 1) return "Final"; if (index === totalRounds - 2) return "Semifinal"; if (totalRounds >= 4 && index === totalRounds - 3) return "Cuartos de Final"; return `Ronda ${index + 1}`; };
const getStatusLabel = (status: Match["status"]): string => { const labels = { pending: "Pendiente", in_progress: "En Curso", finished: "Finalizado" }; return labels[status] || "Desconocido"; };
const getStatusBadgeClasses = (status: Match["status"]): string => { const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"; const variants = { pending: "bg-gray-100 text-gray-600", in_progress: "bg-blue-100 text-blue-700", finished: "bg-green-100 text-green-700" }; return `${base} ${variants[status] || variants.pending}`; };
const getCompetitorClasses = (match: Match, competitor?: Competitor): string => { const base = "flex items-center justify-between p-2 rounded"; if (competitor && match.winner === competitor.id) { return `${base} bg-green-50 border-l-4 border-green-500`; } if (competitor && match.status === 'finished' && match.winner !== competitor.id) { return `${base} bg-red-50 opacity-70`; } return `${base} bg-gray-100`; };
const adjustScore = (scoreRefKey: 'tempScore1' | 'tempScore2', amount: number) => { if (scoreRefKey === 'tempScore1') { tempScore1.value = Math.max(0, tempScore1.value + amount); } else { tempScore2.value = Math.max(0, tempScore2.value + amount); } };

</script>