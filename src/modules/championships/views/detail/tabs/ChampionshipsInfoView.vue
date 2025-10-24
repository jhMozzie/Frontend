<template>
  <div v-if="championshipData" class="grid gap-6 lg:grid-cols-3">
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
              <span v-for="category in categories" :key="category" class="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {{ category }}
              </span>
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
                {{ locationDetails }}
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
  <div v-else class="text-center py-10 text-gray-500">
    No se recibieron datos del campeonato.
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Championship } from '@/modules/championships/types/championships.types';
import { Calendar, MapPin, Users } from 'lucide-vue-next';

// 1. Define la prop que este componente espera recibir del layout padre
const props = defineProps<{
  championshipData: Championship | null;
}>();

// 2. Crea computeds para usar los datos de la prop de forma segura
const locationDetails = computed(() => {
    if (!props.championshipData) return '';
    const parts = [
        props.championshipData.district && props.championshipData.district !== '—' ? props.championshipData.district : null,
        props.championshipData.province && props.championshipData.province !== '—' ? props.championshipData.province : null,
        props.championshipData.country && props.championshipData.country !== '—' ? props.championshipData.country : null,
    ].filter(Boolean); // Filtra los nulos o vacíos
    return parts.join(', ');
});

// 3. Función formatDate (igual que antes)
function formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return 'Fecha no disponible'
  try {
      return new Date(dateString).toLocaleDateString("es-PE", {
        day: "2-digit", month: "long", year: "numeric", timeZone: 'UTC'
      })
  } catch (e) { return "Fecha inválida"; }
}

// 4. Datos hardcodeados (se quedan aquí)
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