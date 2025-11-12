<template>
  <div class="space-y-6">
    <!-- Header con información del campeonato -->
    <div class="p-6 bg-gradient-to-r from-yellow-50 via-gray-50 to-amber-50 rounded-lg border border-gray-200 shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy class="w-7 h-7 text-yellow-500" />
            Medallero
          </h2>
          <p class="text-sm text-gray-600 mt-1">Tabla de medallas por academia</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ totalAcademies }}</div>
            <div class="text-xs text-gray-500">Academias</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ totalMedals }}</div>
            <div class="text-xs text-gray-500">Medallas</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Podio (Top 3) -->
    <div v-if="medalTable.length > 0" class="grid grid-cols-3 gap-4">
      <!-- 2do Lugar -->
      <div v-if="medalTable[1]" class="order-1">
        <div class="relative pt-8">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <span class="text-2xl font-bold text-white">2</span>
          </div>
          <div class="bg-white rounded-lg border-2 border-gray-300 shadow-md p-4 pt-12 text-center">
            <h3 class="font-bold text-gray-900 text-lg mb-2">{{ medalTable[1].academy }}</h3>
            <div class="flex justify-center gap-3 mb-2">
              <div class="text-center">
                <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mb-1">
                  <Medal class="w-6 h-6 text-yellow-500" />
                </div>
                <span class="text-xl font-bold text-yellow-600">{{ medalTable[1].gold }}</span>
              </div>
              <div class="text-center">
                <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                  <Medal class="w-6 h-6 text-gray-400" />
                </div>
                <span class="text-xl font-bold text-gray-500">{{ medalTable[1].silver }}</span>
              </div>
              <div class="text-center">
                <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-1">
                  <Medal class="w-6 h-6 text-amber-600" />
                </div>
                <span class="text-xl font-bold text-amber-600">{{ medalTable[1].bronze }}</span>
              </div>
            </div>
            <div class="text-2xl font-bold text-gray-900">{{ medalTable[1].total }}</div>
            <div class="text-xs text-gray-500">Puntos</div>
          </div>
        </div>
      </div>

      <!-- 1er Lugar -->
      <div v-if="medalTable[0]" class="order-2">
        <div class="relative pt-10">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <Crown class="w-10 h-10 text-white" />
          </div>
          <div class="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-400 shadow-lg p-4 pt-12 text-center">
            <h3 class="font-bold text-gray-900 text-xl mb-2">{{ medalTable[0].academy }}</h3>
            <div class="flex justify-center gap-3 mb-2">
              <div class="text-center">
                <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-1">
                  <Medal class="w-7 h-7 text-yellow-500" />
                </div>
                <span class="text-2xl font-bold text-yellow-600">{{ medalTable[0].gold }}</span>
              </div>
              <div class="text-center">
                <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                  <Medal class="w-7 h-7 text-gray-400" />
                </div>
                <span class="text-2xl font-bold text-gray-500">{{ medalTable[0].silver }}</span>
              </div>
              <div class="text-center">
                <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-1">
                  <Medal class="w-7 h-7 text-amber-600" />
                </div>
                <span class="text-2xl font-bold text-amber-600">{{ medalTable[0].bronze }}</span>
              </div>
            </div>
            <div class="text-3xl font-bold text-yellow-600">{{ medalTable[0].total }}</div>
            <div class="text-xs text-gray-500">Puntos</div>
          </div>
        </div>
      </div>
      <!-- 3er Lugar -->
      <div v-if="medalTable[2]" class="order-3">
        <div class="relative pt-7">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <span class="text-xl font-bold text-white">3</span>
          </div>
          <div class="bg-white rounded-lg border-2 border-amber-600 shadow-md p-4 pt-9 text-center">
            <h3 class="font-bold text-gray-900 text-base mb-2">{{ medalTable[2].academy }}</h3>
            <div class="flex justify-center gap-2 mb-2">
              <div class="text-center">
                <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mb-1">
                  <Medal class="w-5 h-5 text-yellow-500" />
                </div>
                <span class="text-lg font-bold text-yellow-600">{{ medalTable[2].gold }}</span>
              </div>
              <div class="text-center">
                <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                  <Medal class="w-5 h-5 text-gray-400" />
                </div>
                <span class="text-lg font-bold text-gray-500">{{ medalTable[2].silver }}</span>
              </div>
              <div class="text-center">
                <div class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mb-1">
                  <Medal class="w-5 h-5 text-amber-600" />
                </div>
                <span class="text-lg font-bold text-amber-600">{{ medalTable[2].bronze }}</span>
              </div>
            </div>
            <div class="text-xl font-bold text-gray-900">{{ medalTable[2].total }}</div>
            <div class="text-xs text-gray-500">Puntos</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla completa -->
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posición
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Academia
              </th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <Medal class="w-5 h-5 text-yellow-500 inline" />
              </th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <Medal class="w-5 h-5 text-gray-400 inline" />
              </th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <Medal class="w-5 h-5 text-amber-600 inline" />
              </th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Puntos
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="flex justify-center items-center gap-2">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span class="text-gray-500">Cargando medallero...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="medalTable.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                No hay datos de medallas disponibles
              </td>
            </tr>
            <tr 
              v-else
              v-for="(item, index) in medalTable" 
              :key="item.academy"
              :class="[
                index === 0 ? 'bg-yellow-50' : index === 1 ? 'bg-gray-50' : index === 2 ? 'bg-amber-50' : '',
                'hover:bg-blue-50 transition-colors'
              ]"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-gray-900">{{ index + 1 }}</span>
                  <Crown v-if="index === 0" class="w-5 h-5 text-yellow-500" />
                  <Medal v-else-if="index === 1" class="w-5 h-5 text-gray-400" />
                  <Medal v-else-if="index === 2" class="w-5 h-5 text-amber-600" />
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ item.academy }}</div>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-lg font-bold text-yellow-600">{{ item.gold }}</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-lg font-bold text-gray-500">{{ item.silver }}</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-lg font-bold text-amber-600">{{ item.bronze }}</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-xl font-bold text-gray-900">{{ item.total }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Estadísticas adicionales -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-yellow-800">Puntos Totales</p>
            <p class="text-3xl font-bold text-yellow-600 mt-1">{{ totalPoints }}</p>
          </div>
          <Trophy class="w-12 h-12 text-yellow-500 opacity-50" />
        </div>
      </div>
      <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-800">Medallas Totales</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ totalMedals }}</p>
          </div>
          <Medal class="w-12 h-12 text-gray-600 opacity-50" />
        </div>
      </div>
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-blue-800">Academias Participantes</p>
            <p class="text-3xl font-bold text-blue-600 mt-1">{{ totalAcademies }}</p>
          </div>
          <Trophy class="w-12 h-12 text-blue-500 opacity-50" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Trophy, Medal, Crown } from 'lucide-vue-next';
import { useChampionshipStore } from '@/modules/championships/store/championships.store';

const route = useRoute();
const championshipStore = useChampionshipStore();

const loading = ref(false);

// Constantes de puntaje
const POINTS_GOLD = 5;
const POINTS_SILVER = 3;
const POINTS_BRONZE = 1;

interface MedalTableEntry {
  academy: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

const medalTable = ref<MedalTableEntry[]>([]);

// Computeds para estadísticas
const totalAcademies = computed(() => medalTable.value.length);
const totalMedals = computed(() => medalTable.value.reduce((sum, item) => sum + item.gold + item.silver + item.bronze, 0));
const totalPoints = computed(() => medalTable.value.reduce((sum, item) => sum + item.total, 0));

// Función para calcular el medallero desde los matches
const calculateMedalTable = async () => {
  loading.value = true;
  
  try {
    const championshipId = Number(route.params.id);
    
    // Cargar categorías del campeonato
    await championshipStore.fetchChampionshipCategories(championshipId);
    
    // Mapa para acumular medallas por academia
    const academyMedals = new Map<string, { gold: number; silver: number; bronze: number }>();
    
    // Cargar matches de cada categoría
    for (const category of championshipStore.championshipCategories) {
      await championshipStore.fetchMatches(category.id);
      
      // Encontrar el match final (el que no tiene nextMatchId)
      const finalMatch = championshipStore.matches.find(m => 
        m.championshipCategoryId === category.id && 
        m.nextMatchId === null &&
        m.status === 'Completado'
      );
      
      if (finalMatch && finalMatch.winnerId) {
        // Oro: ganador de la final
        const winner = finalMatch.participantAkkaId === finalMatch.winnerId 
          ? finalMatch.participantAkka 
          : finalMatch.participantAo;
        
        if (winner?.student?.academy?.name) {
          const academyName = winner.student.academy.name;
          if (!academyMedals.has(academyName)) {
            academyMedals.set(academyName, { gold: 0, silver: 0, bronze: 0 });
          }
          academyMedals.get(academyName)!.gold++;
        }
        
        // Plata: perdedor de la final
        const runnerUp = finalMatch.participantAkkaId === finalMatch.winnerId 
          ? finalMatch.participantAo 
          : finalMatch.participantAkka;
        
        if (runnerUp?.student?.academy?.name) {
          const academyName = runnerUp.student.academy.name;
          if (!academyMedals.has(academyName)) {
            academyMedals.set(academyName, { gold: 0, silver: 0, bronze: 0 });
          }
          academyMedals.get(academyName)!.silver++;
        }
      }
      
      // Bronce: Perdedores de semifinales
      const semifinals = championshipStore.matches.filter(m => 
        m.championshipCategoryId === category.id &&
        m.nextMatchId === finalMatch?.id &&
        m.status === 'Completado'
      );
      
      for (const semifinal of semifinals) {
        if (semifinal.winnerId) {
          // El perdedor de la semifinal gana bronce
          const bronzeWinner = semifinal.participantAkkaId === semifinal.winnerId 
            ? semifinal.participantAo 
            : semifinal.participantAkka;
          
          if (bronzeWinner?.student?.academy?.name) {
            const academyName = bronzeWinner.student.academy.name;
            if (!academyMedals.has(academyName)) {
              academyMedals.set(academyName, { gold: 0, silver: 0, bronze: 0 });
            }
            academyMedals.get(academyName)!.bronze++;
          }
        }
      }
    }
    
    // Convertir mapa a array y ordenar
    medalTable.value = Array.from(academyMedals.entries())
      .map(([academy, medals]) => ({
        academy,
        gold: medals.gold,
        silver: medals.silver,
        bronze: medals.bronze,
        total: (medals.gold * POINTS_GOLD) + (medals.silver * POINTS_SILVER) + (medals.bronze * POINTS_BRONZE)
      }))
      .sort((a, b) => {
        // Ordenar por: 1) Puntos totales, 2) Oros, 3) Platas, 4) Bronces
        if (b.total !== a.total) return b.total - a.total;
        if (b.gold !== a.gold) return b.gold - a.gold;
        if (b.silver !== a.silver) return b.silver - a.silver;
        if (b.bronze !== a.bronze) return b.bronze - a.bronze;
        return a.academy.localeCompare(b.academy);
      });
    
  } catch (error) {
    console.error('Error calculando medallero:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  calculateMedalTable();
});
</script>
