<template>
  <div class="border-b border-gray-200 bg-white">
    <div class="flex items-center gap-1 px-6">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.name"
        :to="tab.href"
        :class="[
          'relative px-4 py-3 text-sm font-medium transition-colors',
          route.path === tab.href
            ? 'text-gray-900' // Clase activa
            : 'text-gray-500 hover:text-gray-900', // Clase inactiva
        ]"
      >
        {{ tab.name }}
        <div
          v-if="route.path === tab.href"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
        />
      </RouterLink>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

// useRoute() nos da acceso a la ruta actual (equivalente a usePathname)
const route = useRoute()

const tabs = [
  { name: 'Información', href: '/championships/new' },
  { name: 'Fechas', href: '/championships/new/fechas' },
  { name: 'Ubicación', href: '/championships/new/ubicacion' },
  { name: 'Categorías', href: '/championships/new/categorias' },
]
</script>