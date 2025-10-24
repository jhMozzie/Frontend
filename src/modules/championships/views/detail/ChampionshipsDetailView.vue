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
          <ChampionshipsParticipateButton :status="registrationStatus" @click="handleParticipate" />
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

      <div v-else class="grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-6">
          <div class="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Detalles del Evento</h2>
             <div class="aspect-video w-full overflow-hidden rounded-lg bg-gray-200 mb-6">
              <img
                :src="championshipData.image?.trim() ? championshipData.image : '/international-karate-championship.jpg'"
                :alt="championshipData.name"
                class="h-full w-full object-cover"
              />
            </div>
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
                <p class="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                  {{ championshipData.description || 'Sin descripción' }}
                </p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Categorías (Ejemplo)</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="category in categories" :key="category"
                    class="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                  >{{ category }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
             <h2 class="text-xl font-bold text-gray-900 mb-4">Programa del Evento (Ejemplo)</h2>
            <div class="space-y-3">
              <div v-for="(item, index) in schedule" :key="index" class="flex items-start gap-4 pb-3 border-b border-gray-200 last:border-0">
                <span class="text-sm font-medium text-red-600 whitespace-nowrap">{{ item.time }}</span>
                <span class="text-sm text-gray-800">{{ item.event }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="space-y-6">
           <div class="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Información</h2>
             <div class="space-y-4">
              <div class="flex items-start gap-3">
                <Calendar class="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Fecha</p>
                  <p class="text-sm text-gray-500">{{ formatDate(championshipData.startDate) }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <MapPin class="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
                <div>
                   <p class="text-sm font-medium text-gray-900">Ubicación</p>
                  <p class="text-sm text-gray-500">{{ championshipData.location }}</p>
                  <p class="text-sm text-gray-500">
                    {{ championshipData.district && championshipData.district !== '—' ? `${championshipData.district}, ` : '' }}
                    {{ championshipData.province && championshipData.province !== '—' ? `${championshipData.province}, ` : '' }}
                    {{ championshipData.country && championshipData.country !== '—' ? championshipData.country : '' }}
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Users class="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Participantes (Ejemplo)</p>
                  <p class="text-sm text-gray-500">156 registrados</p>
                  <p class="text-sm text-gray-500">Capacidad: 200</p>
                </div>
              </div>
            </div>
          </div>
          <div class="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Estado (Ejemplo)</h2>
            <div class="space-y-3">
              <div v-for="item in statusInfo" :key="item.label" class="flex items-center justify-between">
                <span class="text-sm text-gray-500">{{ item.label }}</span>
                <span :class="['text-sm font-medium', item.valueClass || 'text-gray-900']">{{ item.value }}</span>
              </div>
            </div>
          </div>
           <div class="p-6 bg-red-50 border-red-200 rounded-lg shadow-sm">
             <h2 class="text-lg font-bold text-gray-900 mb-2">Acciones Rápidas</h2>
            <div class="space-y-2">
              <button class="w-full bg-transparent border border-gray-300 text-gray-700 h-9 px-3 text-sm rounded-md hover:bg-gray-50">Ver Brackets</button>
              <button class="w-full bg-transparent border border-gray-300 text-gray-700 h-9 px-3 text-sm rounded-md hover:bg-gray-50">Generar Reporte</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router' // Importamos RouterLink
import { useChampionshipStore } from '@/modules/championships/store/championships.store'
import { storeToRefs } from 'pinia'
import type { Championship } from '@/modules/championships/types/championships.types'
import { Calendar, MapPin, Users, LucideLoader2, LucideAlertTriangle, LucideArrowLeft } from 'lucide-vue-next' // Importamos ArrowLeft
import ChampionshipsNavbar from '@/modules/championships/components/ChampionshipsNavbar.vue'
import ChampionshipsParticipateButton from '@/modules/championships/components/ChampionshipsParticipateButton.vue' // Asegúrate que el nombre/ruta sea correcto

// --- Store y Estado ---
const championshipStore = useChampionshipStore()
const { loading, error } = storeToRefs(championshipStore)
const { fetchChampionshipById } = championshipStore

type RegistrationStatus = "none" | "preRegistered" | "registered";
const registrationStatus = ref<RegistrationStatus>("none");

const route = useRoute()
const championshipId = computed(() => route.params.id as string)
const championshipData = ref<Championship | null>(null)

// --- Fetch de Datos ---
onMounted(async () => {
  const idAsNumber = Number(championshipId.value)
  if (!isNaN(idAsNumber)) {
    loading.value = true
    error.value = null
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
})

// --- Handlers ---
const handleParticipate = () => {
  if (registrationStatus.value === "none") {
    registrationStatus.value = "preRegistered";
  } else if (registrationStatus.value === "preRegistered") {
    registrationStatus.value = "registered";
  }
};

// --- Formateo de Fechas ---
function formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return 'Fecha no disponible'
  try {
      // Usamos UTC para mostrar la fecha correcta
      return new Date(dateString).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: 'UTC' // <-- Corrección zona horaria
      })
  } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return "Fecha inválida";
  }
}

// --- Datos Hardcodeados (Se mantienen) ---
const categories = ["Kata Individual", "Kata por Equipos", "Kumite Individual", "Kumite por Equipos"];
const schedule = [
    { time: "09:00 - 10:00", event: "Registro y Acreditación" },
    { time: "10:00 - 10:30", event: "Ceremonia de Apertura" },
    { time: "10:30 - 13:00", event: "Eliminatorias Kata Individual" },
    { time: "13:00 - 14:30", event: "Almuerzo" },
    { time: "14:30 - 17:00", event: "Eliminatorias Kumite Individual" },
    { time: "17:00 - 18:30", event: "Finales" },
    { time: "18:30 - 19:00", event: "Ceremonia de Premiación" }
];
const statusInfo = [
    { label: "Inscripciones", value: "Abiertas", valueClass: "text-red-600 font-medium" },
    { label: "Categorías", value: "8 activas" },
    { label: "Árbitros", value: "12 asignados" },
    { label: "Tatamis", value: "4 disponibles" }
];

</script>