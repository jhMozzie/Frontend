<template>
  <div class="space-y-4">
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1"
        >Nombre del Campeonato</label
      >
      <input
        id="name"
        type="text"
        v-model="model.name"
        placeholder="Ej. Copa Nacional de Primavera 2025"
        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
      />
    </div>

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
      <div>
        <label
          for="location"
          class="block text-sm font-medium text-gray-700 mb-1"
          >Ubicación</label
        >
        <input
          id="location"
          type="text"
          v-model="model.location"
          placeholder="Ej. Polideportivo Municipal"
          class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
        />
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div>
        <label
          for="district"
          class="block text-sm font-medium text-gray-700 mb-1"
          >Distrito</label
        >
        <input
          id="district"
          type="text"
          v-model="model.district"
          placeholder="Ej. San Isidro"
          class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
        />
      </div>
      <div>
        <label
          for="province"
          class="block text-sm font-medium text-gray-700 mb-1"
          >Provincia</label
        >
        <input
          id="province"
          type="text"
          v-model="model.province"
          placeholder="Ej. Lima"
          class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
        />
      </div>
      <div>
        <label
          for="country"
          class="block text-sm font-medium text-gray-700 mb-1"
          >País</label
        >
        <input
          id="country"
          type="text"
          v-model="model.country"
          placeholder="Ej. Perú"
          class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label
          for="referees"
          class="block text-sm font-medium text-gray-700 mb-1"
          >Número de Árbitros</label
        >
        <input
          id="referees"
          type="number"
          min="1"
          v-model.number="model.referees"
          placeholder="Ej. 10"
          class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
        />
      </div>
      <div>
        <label
          for="tatamis"
          class="block text-sm font-medium text-gray-700 mb-1"
          >Número de Tatamis</label
        >
        <input
          id="tatamis"
          type="number"
          min="1"
          v-model.number="model.tatamis"
          placeholder="Ej. 4"
          class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
        />
      </div>
    </div>


    <div>
      <label
        for="description"
        class="block text-sm font-medium text-gray-700 mb-1"
        >Descripción</label
      >
      <textarea
        id="description"
        v-model="model.description"
        placeholder="Describe el campeonato..."
        :rows="4"
        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
      />
    </div>

    <div>
      <label
        for="image-upload"
        class="block text-sm font-medium text-gray-700 mb-1"
        >Imagen del Campeonato</label
      >
      <div class="mt-2">
        <label
          v-if="!model.imagePreview"
          htmlFor="image-upload"
          class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <LucideUpload class="w-8 h-8 text-gray-400 mb-2" />
          <span class="text-sm text-gray-500"
            >Click para subir una imagen</span
          >
          <span class="text-xs text-gray-400 mt-1">PNG, JPG hasta 5MB</span>
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleImageChange"
        />
        <div
          v-if="model.imagePreview"
          class="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200"
        >
          <img
            :src="model.imagePreview"
            alt="Preview"
            class="w-full h-full object-cover"
          />
          <button
            @click="handleRemoveImage"
            class="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-all"
          >
            <LucideX class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <div>
      <label for="status" class="block text-sm font-medium text-gray-700 mb-1"
        >Estado</label
      >
      <div class="relative">
        <select
          id="status"
          v-model="model.status"
          class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400 appearance-none pr-8 cursor-pointer"
        >
          <option value="" disabled>Selecciona el estado del campeonato</option>
          <option value="Inscripción Cerrada">Inscripción Cerrada</option>
          <option value="Inscripción Abierta">Inscripción Abierta</option>
          <option value="En Curso">En Curso</option>
          <option value="Finalizado">Finalizado</option>
        </select>
        <LucideChevronDown
          class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LucideUpload, LucideX, LucideChevronDown } from 'lucide-vue-next'

const model = defineModel<any>()

const handleImageChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    model.value.imageFile = file
    const reader = new FileReader()
    reader.onloadend = () => {
      model.value.imagePreview = reader.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleRemoveImage = () => {
  model.value.imagePreview = null
  model.value.imageFile = null
}
</script>