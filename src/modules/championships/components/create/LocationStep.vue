<template>
  <div class="space-y-4">
    <div>
      <label for="location" class="block text-sm font-medium text-gray-700 mb-1"
        >Nombre del Lugar</label
      >
      <input
        id="location"
        type="text"
        v-model="model.location" 
        placeholder="Ej. Polideportivo Nacional"
        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="district" class="block text-sm font-medium text-gray-700 mb-1"
          >Ciudad / Distrito</label
        >
        <input
          id="district"
          type="text"
          v-model="model.district"
          placeholder="San Luis"
          class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
        />
      </div>
      <div>
        <label
          for="province"
          class="block text-sm font-medium text-gray-700 mb-1"
          >Provincia / Estado</label
        >
        <input
          id="province"
          type="text"
          v-model="model.province"
          placeholder="Lima"
          class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
        />
      </div>
    </div>

    <div>
      <label for="country" class="block text-sm font-medium text-gray-700 mb-1"
        >País</label
      >
      <input
        id="country"
        type="text"
        v-model="model.country"
        placeholder="Perú"
        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
      />
    </div>

    </div>
</template>

<script setup lang="ts">
// 'model' está conectado al 'v-model="formData"' del padre
const model = defineModel<any>()
</script>