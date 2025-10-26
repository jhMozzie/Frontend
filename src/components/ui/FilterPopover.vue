<template>
  <div class="relative" ref="popoverRef">
    <div @click="toggle">
      <slot name="trigger" :isOpen="isOpen"></slot>
    </div>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        :class="[
          'absolute z-20 mt-2 rounded-md border border-gray-200 bg-white shadow-lg',
          'p-4', // Padding por defecto, como en tu código
          widthClass,
          alignClass
        ]"
      >
        <slot name="content" :close="close"></slot>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = withDefaults(defineProps<{
  align?: 'left' | 'right' // Alineación del popover
  width?: string          // Ancho (ej: 'w-48', 'w-72')
}>(), {
  align: 'right',
  width: 'w-56' // Ancho por defecto (224px)
})

const isOpen = ref(false)
const popoverRef = ref<HTMLElement | null>(null) // Ref para el elemento principal

const toggle = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

// --- Clases computadas ---
const alignClass = computed(() => {
  return props.align === 'left' ? 'left-0' : 'right-0'
})
const widthClass = computed(() => props.width)

// --- Lógica para cerrar al hacer click fuera ---
const handleClickOutside = (event: MouseEvent) => {
  // Si el popover está abierto y el click NO fue dentro de él
  if (isOpen.value && popoverRef.value && !popoverRef.value.contains(event.target as Node)) {
    close()
  }
}

onMounted(() => {
  // Usamos 'true' (capture phase) para detectar el click antes que otros eventos
  document.addEventListener('click', handleClickOutside, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside, true)
})
</script>