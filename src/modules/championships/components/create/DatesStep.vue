<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label
          for="start-date"
          class="block text-sm font-medium text-gray-700 mb-1"
          >Fecha de Inicio</label
        >
        <input
          id="start-date"
          type="date"
          v-model="model.startDate"
          class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
        />
      </div>
    </div>

    </div>
</template>

<script setup lang="ts">
// 💡 'model' está conectado al 'v-model="formData"' del padre
const model = defineModel<any>()
</script>