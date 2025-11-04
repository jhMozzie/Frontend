<template>
  <div 
    v-if="open" 
    class="fixed inset-0 z-50 flex items-center justify-center"
    @click.self="handleClose"
  >
    <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>

    <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-2">¿Confirmar inscripciones?</h2>
      <p class="text-sm text-gray-600 mb-4">
        Estás a punto de confirmar {{ draftCount }} participantes. Una vez confirmadas, no podrás eliminar
        ni modificar las inscripciones.
      </p>

      <div class="mb-6 max-h-48 overflow-y-auto rounded-lg bg-gray-50 p-3">
        <div class="space-y-2">
          <div 
            v-for="participant in participants" 
            :key="participant.id"
            class="text-sm p-2 rounded bg-white border border-gray-200"
          >
            <p class="font-medium text-gray-900">{{ participant.name }}</p>
            <p class="text-xs text-gray-500">{{ participant.category }}</p>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          @click="handleClose"
          :disabled="isLoading"
          class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="handleConfirm"
          :disabled="isLoading"
          class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <LucideLoader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
          Sí, confirmar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { LucideLoader2 } from 'lucide-vue-next';

interface Participant {
  id: number;
  name: string;
  category: string;
}

interface Props {
  open: boolean;
  participants: Participant[];
  draftCount: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  'confirm': [];
}>();

const isLoading = ref(false);

const handleClose = () => {
  if (!isLoading.value) {
    emit('update:open', false);
  }
};

const handleConfirm = async () => {
  isLoading.value = true;
  
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    emit('confirm');
    emit('update:open', false);
  } catch (error) {
    console.error('Error al confirmar:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>