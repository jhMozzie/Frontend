<template>
  <div class="flex min-h-screen bg-gray-50 text-gray-900">
    <!-- Sidebar -->
    <Sidebar :isOpen="sidebarOpen" :toggleSidebar="toggleSidebar" />

    <!-- Contenido -->
    <main
      class="flex-1 w-full transition-all duration-300"
      :class="{
        'lg:ml-64': true,          // deja espacio fijo cuando el sidebar está visible (>=1024px)
        'ml-0': sidebarOpen,       // sin espacio en móviles
      }"
    >
      <!-- Header (solo visible en móviles) -->
      <header
        class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:hidden"
      >
        <button
          @click="toggleSidebar"
          class="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
        >
          <LucideMenu class="h-5 w-5" />
        </button>
        <h1 class="text-lg font-semibold">Karate Admin</h1>
      </header>

      <section class="p-6">
        <RouterView />
      </section>
    </main>

    <!-- Botón flotante de AIQueryBot - Solo visible después del login -->
    <AIQueryBot v-if="isAuthenticated" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Sidebar from '../ui/Sidebar.vue'
import AIQueryBot from '@/modules/aiquerybot/components/AIQueryBot.vue'
import { LucideMenu } from 'lucide-vue-next'
import { getCurrentUserRole } from '@/utils/auth'

const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// Comprobar si el usuario está autenticado
const isAuthenticated = computed(() => {
  return getCurrentUserRole() !== null
})

// Cierra el sidebar al hacer clic fuera en móvil
const handleClickOutside = (event: MouseEvent) => {
  const sidebar = document.getElementById('sidebar')
  const target = event.target as Node

  if (sidebar && !sidebar.contains(target) && sidebarOpen.value) {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>