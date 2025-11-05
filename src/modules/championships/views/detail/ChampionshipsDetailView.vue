<template>
  <div class="flex flex-col p-8">
    <RouterLink
      to="/championships"
      class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 w-fit"
    >
      <LucideArrowLeft class="h-4 w-4" />
      Volver a Campeonatos
    </RouterLink>

    <div class="border-b border-gray-200 bg-white rounded-lg shadow-sm">
      <div class="px-6 py-6">
        <div v-if="loading && !championshipData" class="animate-pulse">
          <div class="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div v-else-if="championshipData" class="flex items-start justify-between">
          <!-- Título y descripción -->
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900">{{ championshipData.name }}</h1>
            <p class="mt-3 text-sm text-gray-500">Información general del campeonato</p>
          </div>
          
          <!-- Botones de acción (derecha) - Solo para Entrenadores -->
          <div v-if="userRole === 'Entrenador'" class="flex items-center gap-4 ml-8">
            <!-- Badge estado (solo cuando está participando o pre-inscrito) -->
            <div 
              v-if="participation?.status && participation.status !== ParticipationStatus.PARTICIPAR" 
              class="flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg border"
              :class="participation.status === ParticipationStatus.PARTICIPANDO 
                ? 'bg-amber-50 border-amber-200' 
                : participation.status === ParticipationStatus.PRE_INSCRITO
                ? 'bg-blue-50 border-blue-200'
                : 'bg-green-50 border-green-200'"
            >
              <LucideUsers 
                class="w-4 h-4" 
                :class="participation.status === ParticipationStatus.PARTICIPANDO 
                  ? 'text-amber-600' 
                  : participation.status === ParticipationStatus.PRE_INSCRITO
                  ? 'text-blue-600'
                  : 'text-green-600'"
              />
              <span 
                :class="participation.status === ParticipationStatus.PARTICIPANDO 
                  ? 'text-amber-800' 
                  : participation.status === ParticipationStatus.PRE_INSCRITO
                  ? 'text-blue-800'
                  : 'text-green-800'"
              >
                {{ participation.status === ParticipationStatus.PARTICIPANDO ? 'Participando' 
                  : participation.status === ParticipationStatus.PRE_INSCRITO ? 'Pre-inscrito'
                  : 'Confirmado' }}
              </span>
            </div>
            
            <!-- FLUJO DE BOTONES: Participar → Confirmar Inscripciones → Pre-inscrito -->
            
            <!-- 1. Botón "Participar" - Solo si NO existe participación -->
            <button
              v-if="!participation"
              @click="handleParticipate"
              :disabled="participationLoading"
              class="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md whitespace-nowrap"
              :class="participationLoading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-600 text-white'"
            >
              <LucideUserPlus class="w-5 h-5" />
              {{ participationLoading ? 'Cargando...' : 'Participar' }}
            </button>
            
            <!-- 2. Botón "Confirmar Inscripciones" - Estado PARTICIPANDO (clicable) -->
            <button
              v-else-if="participation.status === ParticipationStatus.PARTICIPANDO"
              @click="showConfirmDialog = true"
              class="px-6 py-2.5 rounded-lg font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
            >
              <LucideCheckCircle class="w-5 h-5" />
              Confirmar Inscripciones
            </button>
            
            <!-- 3. Botón "Pre-inscrito" - Estado PRE_INSCRITO (NO clicable) -->
            <button
              v-else-if="participation.status === ParticipationStatus.PRE_INSCRITO"
              disabled
              class="px-6 py-2.5 rounded-lg font-semibold bg-blue-500 text-white cursor-not-allowed opacity-90 flex items-center gap-2 shadow-md whitespace-nowrap"
            >
              <LucideClock class="w-5 h-5" />
              Pre-inscrito
            </button>
          </div>
        </div>
        <div v-else-if="error" class="text-red-500 font-medium">Error al cargar: {{ error }}</div>
        <div v-else class="text-gray-500">Campeonato no encontrado.</div>
      </div>
    </div>

    <ChampionshipsNavbar
      class="mt-6"
      :championship-id="String(championshipId)"
      :is-registration-active="isNavbarActive"
    />

    <!-- Alerta de Modo Inscripción - Solo para Entrenadores -->
    <RegistrationModeAlert 
      v-if="isParticipating && userRole === 'Entrenador'"
      :participation-status="participation?.status"
      class="mt-6"
    />

    <div class="flex-1 pt-6">
      <RouterView v-slot="{ Component }">
        <div v-if="loading" class="text-center py-10 text-gray-500">
          <LucideLoader2 class="h-8 w-8 animate-spin mx-auto" />
        </div>
        <div v-else-if="error && !championshipData" class="text-center py-10 text-red-500">
          <LucideAlertTriangle class="h-8 w-8 mx-auto mb-2" />
          No se pudieron cargar los detalles.
        </div>
        <div v-else-if="!championshipData" class="text-center py-10 text-gray-500">
          No hay información disponible para este campeonato.
        </div>
        <component 
          v-else 
          :is="Component" 
          :championship-data="championshipData"
          :is-participating="isParticipating"
          :participation-status="participation?.status"
        />
      </RouterView>
    </div>

    <!-- Dialog de Confirmación - Solo para Entrenadores -->
    <ConfirmRegistrationDialog 
      v-if="userRole === 'Entrenador'"
      v-model:open="showConfirmDialog"
      @confirm="handleConfirmRegistrations"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, RouterLink, RouterView } from 'vue-router';
import { useChampionshipStore } from '@/modules/championships/store/championships.store';
import { storeToRefs } from 'pinia';
import type { Championship } from '@/modules/championships/types/championships.types';
import { 
  LucideLoader2, 
  LucideAlertTriangle, 
  LucideArrowLeft,
  LucideCheckCircle,
  LucideUsers,
  LucideUserPlus,
  LucideClock
} from 'lucide-vue-next';
import ChampionshipsNavbar from '@/modules/championships/components/ChampionshipsNavbar.vue';
import ConfirmRegistrationDialog from '@/modules/championships/components/ConfirmRegistrationDialog.vue';
import RegistrationModeAlert from '@/modules/championships/components/RegistrationModeAlert.vue';
import { academyChampionshipService } from '@/modules/academies/services/academy-championships.service';
import { ParticipationStatus, type ParticipationResponse } from '@/modules/academies/types/academy-championships.types';

// --- Store y Estado ---
const championshipStore = useChampionshipStore();
const { loading, error } = storeToRefs(championshipStore);
const { fetchChampionshipById } = championshipStore;

// 🆕 Estado de participación desde el backend
const participation = ref<ParticipationResponse | null>(null);
const participationLoading = ref(false);

const showConfirmDialog = ref(false);

const route = useRoute();
const championshipId = computed(() => Number(route.params.id));
const championshipData = ref<Championship | null>(null);

// 👤 Obtener rol y academyId del usuario logueado
const userRole = ref<string | null>(localStorage.getItem("userRole"));
const userAcademyId = ref<number | null>(
  localStorage.getItem("academyId") ? Number(localStorage.getItem("academyId")) : null
);

// --- Computed ---
// isParticipating: true cuando está en PARTICIPANDO o PRE_INSCRITO (ambos estados muestran la alerta y el modo inscripción)
const isParticipating = computed(() => 
  participation.value?.status === ParticipationStatus.PARTICIPANDO ||
  participation.value?.status === ParticipationStatus.PRE_INSCRITO
);

// Navbar activo: siempre para admin, condicional para entrenador
const isNavbarActive = computed(() => {
  if (userRole.value === 'Administrador') return true;
  return isParticipating.value;
});

// --- Fetch de Datos ---
const fetchParticipation = async () => {
  // Solo para entrenadores
  if (userRole.value !== 'Entrenador') return;
  if (!userAcademyId.value || !championshipId.value) return;
  
  participationLoading.value = true;
  try {
    console.log('🔍 Buscando participación con:', {
      academyId: userAcademyId.value,
      championshipId: championshipId.value,
      url: `/academy-championships/${userAcademyId.value}/${championshipId.value}`
    });
    
    const data = await academyChampionshipService.getParticipation(
      userAcademyId.value,
      championshipId.value
    );
    participation.value = data;
    
    if (data) {
      console.log('✅ Participación encontrada:', data);
      console.log('📊 Estado:', data.status);
    } else {
      console.log('ℹ️ No hay participación previa en este campeonato');
    }
  } catch (err: any) {
    // Solo mostrar error si no es un 404 (404 es esperado cuando no hay participación)
    if (err.response?.status !== 404) {
      console.error('❌ Error al obtener participación:', err);
    }
  } finally {
    participationLoading.value = false;
  }
};

onMounted(async () => {
  if (!isNaN(championshipId.value)) {
    loading.value = true;
    error.value = null;
    try {
      const data = await fetchChampionshipById(championshipId.value);
      championshipData.value = data ?? null;
      if (!data) error.value = "Campeonato no encontrado.";
      
      // 🆕 Obtener estado de participación
      await fetchParticipation();
    } catch (err: any) {
       console.error("Error fetching championship details:", err);
       if (!error.value) error.value = "No se pudieron cargar los detalles.";
    } finally {
        loading.value = false;
    }
  } else {
    error.value = "ID inválido.";
    loading.value = false;
  }
});

// --- Handlers ---

const handleParticipate = async () => {
  if (!userAcademyId.value) {
    alert('❌ No se encontró tu academia. Por favor, inicia sesión nuevamente.');
    return;
  }

  participationLoading.value = true;
  try {
    // Crear participación con estado PARTICIPANDO
    const newParticipation = await academyChampionshipService.createParticipation({
      academyId: userAcademyId.value,
      championshipId: championshipId.value,
      status: ParticipationStatus.PARTICIPANDO
    });
    
    participation.value = newParticipation;
  } catch (err: any) {
    console.error('Error al iniciar participación:', err);
    alert('❌ Error al iniciar participación');
  } finally {
    participationLoading.value = false;
  }
};

const handleConfirmRegistrations = async () => {
  if (!userAcademyId.value) {
    alert('❌ No se encontró tu academia.');
    return;
  }

  try {
    // Avanzar al siguiente estado (PARTICIPANDO → PRE_INSCRITO)
    const response = await academyChampionshipService.advanceStatus(
      userAcademyId.value,
      championshipId.value
    );
    
    console.log('✅ Estado avanzado:', response);
    // El backend devuelve directamente el objeto ParticipationResponse
    participation.value = response;
    
    alert('✅ Inscripciones confirmadas exitosamente');
  } catch (err: any) {
    console.error('Error al confirmar inscripciones:', err);
    alert(`❌ ${err.response?.data?.message || 'Error al confirmar inscripciones'}`);
  }
};
</script>