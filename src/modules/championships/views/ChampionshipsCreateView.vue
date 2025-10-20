<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">
        Crear Nuevo Campeonato 🏆
      </h1>
      <p class="mt-1 text-sm text-gray-500">
        Esta es la vista de formulario para registrar un nuevo torneo.
      </p>
    </div>

    <div
      class="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center"
    >
      <div class="flex flex-col items-center justify-center">
        <LucideConstruction
          class="mb-4 h-10 w-10 text-yellow-500 animate-pulse"
        />
        <p class="text-xl font-semibold text-gray-700">
          Formulario de Creación en Construcción...
        </p>
        <p class="mt-2 text-sm text-gray-500">
          Si ves esta página, la redirección ha funcionado correctamente.
        </p>
        <RouterLink
          to="/championships"
          class="mt-4 inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition text-sm"
        >
          <LucideArrowLeft class="h-4 w-4" />
          Volver a Campeonatos
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LucideConstruction, LucideArrowLeft } from "lucide-vue-next"
</script>