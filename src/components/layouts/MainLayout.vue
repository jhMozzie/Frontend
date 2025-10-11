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
  </div>
</template>

<script setup lang="ts">
import Sidebar from "@/components/ui/Sidebar.vue"
import { LucideMenu } from "lucide-vue-next"
import { ref } from "vue"

const sidebarOpen = ref(false)
const toggleSidebar = () => (sidebarOpen.value = !sidebarOpen.value)
</script>