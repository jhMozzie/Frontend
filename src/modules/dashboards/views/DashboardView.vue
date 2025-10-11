<template>
  <div class="flex flex-col">
    <!-- Header -->
    <div class="border-b border-border bg-white">
      <div class="px-6 py-6">
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <p class="mt-1 text-sm text-gray-500">
          Bienvenido al sistema de gestión de campeonatos de karate
        </p>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.name"
        class="p-6 bg-white rounded-lg shadow-sm border"
      >
        <div class="flex items-center justify-between">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
            <component :is="stat.icon" class="h-6 w-6 text-red-600" />
          </div>
        </div>
        <div class="mt-4">
          <p class="text-sm font-medium text-gray-500">{{ stat.name }}</p>
          <p class="mt-2 text-3xl font-bold">{{ stat.value }}</p>
          <p
            class="mt-2 text-sm"
            :class="{
              'text-red-600': stat.changeType === 'positive',
              'text-gray-400': stat.changeType !== 'positive'
            }"
          >
            {{ stat.change }}
          </p>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="px-6 pb-6">
      <h2 class="text-xl font-bold mb-4">Actividad Reciente</h2>
      <div class="bg-white p-6 rounded-lg shadow-sm border space-y-4">
        <div
          v-for="activity in activities"
          :key="activity.event"
          class="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0"
        >
          <div class="flex h-2 w-2 mt-2 rounded-full bg-red-600"></div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium">{{ activity.event }}</p>
            <p class="text-sm text-gray-500">{{ activity.detail }}</p>
          </div>
          <span class="text-xs text-gray-400 whitespace-nowrap">{{ activity.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LucideTrophy, LucideUsers, LucideCalendar, LucideTrendingUp } from "lucide-vue-next"

const stats = [
  { name: "Campeonatos Activos", value: "12", icon: LucideTrophy, change: "+2 este mes", changeType: "positive" },
  { name: "Total Competidores", value: "348", icon: LucideUsers, change: "+23 nuevos", changeType: "positive" },
  { name: "Próximos Eventos", value: "5", icon: LucideCalendar, change: "En 30 días", changeType: "neutral" },
  { name: "Tasa de Participación", value: "87%", icon: LucideTrendingUp, change: "+5% vs anterior", changeType: "positive" },
]

const activities = [
  { event: "Nuevo campeonato creado", detail: "Campeonato Nacional 2025", time: "Hace 2 horas" },
  { event: "Competidor registrado", detail: "Juan Pérez - Categoría Senior", time: "Hace 4 horas" },
  { event: "Resultados actualizados", detail: "Torneo Regional - Semifinales", time: "Hace 1 día" },
  { event: "Nueva categoría añadida", detail: "Kata Juvenil Femenino", time: "Hace 2 días" },
]
</script>