<template>
  <nav
    role="navigation"
    aria-label="pagination"
    class="mx-auto flex w-full justify-center py-4"
  >
    <ul class="flex flex-row items-center gap-1">
      <!-- Botón Primero -->
      <li>
        <button
          class="h-9 w-9 flex items-center justify-center rounded-md border hover:bg-gray-100 disabled:opacity-50"
          :disabled="currentPage === 1"
          @click="goToPage(1)"
        >
          <ChevronsLeft class="h-4 w-4" />
        </button>
      </li>

      <!-- Botón Anterior -->
      <li>
        <button
          class="flex items-center gap-1 px-3 py-2 text-sm rounded-md border hover:bg-gray-100 disabled:opacity-50"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <ChevronLeft class="h-4 w-4" />
          <span>Anterior</span>
        </button>
      </li>

      <!-- Números -->
      <li v-for="page in visiblePages" :key="page">
        <button
          @click="goToPage(page)"
          class="flex h-9 w-9 items-center justify-center rounded-md border text-sm transition-all"
          :class="[
            currentPage === page
              ? 'bg-rose-600 text-white border-rose-600'
              : 'hover:bg-gray-100'
          ]"
        >
          {{ page }}
        </button>
      </li>

      <!-- Botón Siguiente -->
      <li>
        <button
          class="flex items-center gap-1 px-3 py-2 text-sm rounded-md border hover:bg-gray-100 disabled:opacity-50"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <span>Siguiente</span>
          <ChevronRight class="h-4 w-4" />
        </button>
      </li>

      <!-- Botón Último -->
      <li>
        <button
          class="h-9 w-9 flex items-center justify-center rounded-md border hover:bg-gray-100 disabled:opacity-50"
          :disabled="currentPage === totalPages"
          @click="goToPage(totalPages)"
        >
          <ChevronsRight class="h-4 w-4" />
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-vue-next"

interface Props {
  currentPage: number
  totalPages: number
}
const props = defineProps<Props>()
const emit = defineEmits(["page-change"])

// 🔢 Genera las páginas visibles (2 a cada lado)
const visiblePages = computed(() => {
  const total = props.totalPages
  const current = props.currentPage
  const range = 2
  const start = Math.max(1, current - range)
  const end = Math.min(total, current + range)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// 🚀 Navegar a otra página
const goToPage = (page: number) => {
  if (page < 1 || page > props.totalPages) return
  emit("page-change", page)
}
</script>