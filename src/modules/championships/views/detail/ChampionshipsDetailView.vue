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
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ championshipData.name }}</h1>
            <p class="mt-1 text-sm text-gray-500">Información general del campeonato</p>
          </div>
          <ParticipateButton :status="registrationStatus" @click="handleParticipate" />
        </div>
        <div v-else-if="error" class="text-red-500 font-medium">Error al cargar: {{ error }}</div>
        <div v-else class="text-gray-500">Campeonato no encontrado.</div>
      </div>
    </div>

    <ChampionshipsNavbar
      class="mt-6"
      :championship-id="championshipId"
      :is-registration-active="registrationStatus !== 'none'"
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
        <component v-else :is="Component" :championship-data="championshipData" />
      </RouterView>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, RouterLink, RouterView } from 'vue-router'; // Importamos RouterView y RouterLink
import { useChampionshipStore } from '@/modules/championships/store/championships.store';
import { storeToRefs } from 'pinia';
import type { Championship } from '@/modules/championships/types/championships.types';
import { LucideLoader2, LucideAlertTriangle, LucideArrowLeft } from 'lucide-vue-next';
import ChampionshipsNavbar from '@/modules/championships/components/ChampionshipsNavbar.vue';
import ParticipateButton from '@/modules/championships/components/ChampionshipsParticipateButton.vue'; // Asegúrate que el nombre/ruta sea correcto

// --- Store y Estado ---
const championshipStore = useChampionshipStore();
const { loading, error } = storeToRefs(championshipStore);
const { fetchChampionshipById } = championshipStore;

type RegistrationStatus = "none" | "preRegistered" | "registered";
const registrationStatus = ref<RegistrationStatus>("none");

const route = useRoute();
const championshipId = computed(() => route.params.id as string);
const championshipData = ref<Championship | null>(null); // Datos cargados

// --- Fetch de Datos (Se hace aquí, en el layout padre) ---
onMounted(async () => {
  const idAsNumber = Number(championshipId.value);
  if (!isNaN(idAsNumber)) {
    loading.value = true;
    error.value = null;
    try {
      const data = await fetchChampionshipById(idAsNumber);
      championshipData.value = data ?? null;
      if (!data) error.value = "Campeonato no encontrado.";
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
const handleParticipate = () => {
  if (registrationStatus.value === "none") {
    registrationStatus.value = "preRegistered";
  } else if (registrationStatus.value === "preRegistered") {
    registrationStatus.value = "registered";
  }
};

// (No necesitamos formatDate ni datos hardcodeados aquí)

</script>