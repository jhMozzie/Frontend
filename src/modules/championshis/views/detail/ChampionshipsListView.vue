<template>
  <div class="flex flex-col">
    <!-- Header -->
    <div class="border-b border-gray-200 bg-white">
      <div class="flex items-center justify-between px-6 py-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Campeonatos</h1>
          <p class="mt-1 text-sm text-gray-500">
            Gestiona todos los campeonatos y torneos
          </p>
        </div>
        <button
          class="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
        >
          <LucidePlus class="h-4 w-4" />
          Nuevo Campeonato
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-6">
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="champ in championships"
          :key="champ.id"
          :to="`/campeonatos/${champ.id}`"
          class="overflow-hidden border border-gray-200 bg-white rounded-lg shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          <div class="aspect-video w-full overflow-hidden bg-gray-100">
            <img
              :src="champ.image || '/placeholder.svg'"
              :alt="champ.name"
              class="h-full w-full object-cover"
            />
          </div>

          <div class="p-5">
            <div class="flex items-start justify-between gap-2 mb-3">
              <h3
                class="text-lg font-bold text-gray-900 line-clamp-2"
              >
                {{ champ.name }}
              </h3>
              <span
                class="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 whitespace-nowrap"
              >
                {{ champ.status }}
              </span>
            </div>

            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <LucideCalendar class="h-4 w-4" />
                {{ champ.date }}
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <LucideMapPin class="h-4 w-4" />
                {{ champ.location }}
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <LucideUsers class="h-4 w-4" />
                {{ champ.participants }} participantes
              </div>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LucidePlus, LucideCalendar, LucideMapPin, LucideUsers } from "lucide-vue-next"

// 📅 Datos simulados
const championships = [
  {
    id: "1",
    name: "Campeonato Nacional 2025",
    date: "15 de Marzo, 2025",
    location: "Madrid, España",
    participants: 156,
    status: "Activo",
    image: "/karate-tournament-arena.jpg",
  },
  {
    id: "2",
    name: "Torneo Regional Centro",
    date: "22 de Febrero, 2025",
    location: "Toledo, España",
    participants: 89,
    status: "Próximo",
    image: "/karate-dojo-competition.jpg",
  },
  {
    id: "3",
    name: "Copa Juvenil de Primavera",
    date: "5 de Abril, 2025",
    location: "Valencia, España",
    participants: 124,
    status: "Inscripción Abierta",
    image: "/young-karate-athletes.jpg",
  },
  {
    id: "4",
    name: "Campeonato Internacional",
    date: "10 de Mayo, 2025",
    location: "Barcelona, España",
    participants: 203,
    status: "Planificación",
    image: "/international-karate-championship.jpg",
  },
]
</script>