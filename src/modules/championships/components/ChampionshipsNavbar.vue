<template>
  <div class="border-b border-gray-200 bg-white">
    <div class="flex items-center gap-1 px-6">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.name"
        :to="isDisabled(tab) ? '#' : tab.href" :event="isDisabled(tab) ? '' : 'click'" :aria-disabled="isDisabled(tab)" :class="[
          'relative px-4 py-3 text-sm font-medium transition-colors',
          // Estilo activo (sin cambios)
          route.path === tab.href || (route.path === parentPath && tab.name === 'Información')
            ? 'text-gray-900'
            : 'text-gray-500', // Color por defecto
          // 👇 Estilo deshabilitado
          isDisabled(tab)
            ? 'text-gray-400 cursor-not-allowed opacity-60' // Clases si está deshabilitado
            : 'hover:text-gray-900', // Efecto hover solo si está habilitado
        ]"
        @click="checkNavigation($event, tab)" >
        {{ tab.name }}
        <div
          v-if="route.path === tab.href || (route.path === parentPath && tab.name === 'Información')"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
        />
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

// 1. Aceptamos la nueva prop que viene del padre
const props = defineProps<{
  championshipId: string
  isRegistrationActive: boolean // <-- Nueva prop booleana
}>()

const route = useRoute()
const parentPath = computed(() => `/championships/${props.championshipId}`)

// Los datos de las pestañas no cambian
const tabs = computed(() => [
  { name: 'Información', href: `/championships/${props.championshipId}` },
  { name: 'Categorías', href: `/championships/${props.championshipId}/categorias` },
  { name: 'Competidores', href: `/championships/${props.championshipId}/competidores` },
  { name: 'Brackets', href: `/championships/${props.championshipId}/brackets` },
  { name: 'Medallero', href: `/championships/${props.championshipId}/medallero` },
])

// 2. Función para determinar si una pestaña debe estar deshabilitada
const isDisabled = (tab: { name: string; href: string }) => {
  // Se deshabilita solo si el registro NO está activo Y la pestaña NO es 'Información'
  return !props.isRegistrationActive && tab.name !== 'Información';
};

// 3. (Opcional pero recomendado) Función para prevenir explícitamente la navegación
const checkNavigation = (event: MouseEvent, tab: { name: string; href: string }) => {
  if (isDisabled(tab)) {
    event.preventDefault(); // Detiene la navegación del RouterLink
  }
};

</script>