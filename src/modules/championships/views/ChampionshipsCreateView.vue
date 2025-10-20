<template>
  <div class="p-4 md:p-8 max-w-5xl mx-auto min-h-full bg-gray-50">
    <div class="mb-8">
      <RouterLink
        to="/championships"
        class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <LucideArrowLeft class="h-4 w-4" />
        Volver a Campeonatos
      </RouterLink>
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900">
        Nuevo Campeonato
      </h1>
      <p class="text-gray-500 mt-2 text-sm md:text-base">
        Completa la información para crear un nuevo campeonato
      </p>
    </div>

    <div class="mb-8">
      <ChampionshipStepper :steps="steps" :current-step="currentStep" />
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-6 md:p-8">
        <div class="mt-8">
          <div v-if="currentStep === 1" class="space-y-4">
            <div>
              <label
                for="name"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Nombre del Campeonato</label
              >
              <input
                id="name"
                type="text"
                placeholder="Ej. Copa Nacional de Primavera 2025"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
              />
            </div>

            <div>
              <label
                for="description"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Descripción</label
              >
              <textarea
                id="description"
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
                  v-if="!imagePreview"
                  htmlFor="image-upload"
                  class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <LucideUpload class="w-8 h-8 text-gray-400 mb-2" />
                  <span class="text-sm text-gray-500">
                    Click para subir una imagen
                  </span>
                  <span class="text-xs text-gray-400 mt-1">
                    PNG, JPG hasta 5MB
                  </span>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleImageChange"
                />
                <div
                  v-if="imagePreview"
                  class="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200"
                >
                  <img
                    :src="imagePreview"
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

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  for="price"
                  class="block text-sm font-medium text-gray-700 mb-1"
                  >Precio de Inscripción (€)</label
                >
                <input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
                />
              </div>
              <div>
                <label
                  for="type"
                  class="block text-sm font-medium text-gray-700 mb-1"
                  >Tipo de Campeonato</label
                >
                <div class="relative">
                  <select
                    id="type"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400 appearance-none pr-8 cursor-pointer"
                  >
                    <option value="" disabled selected>
                      Selecciona el tipo
                    </option>
                    <option value="kata">Kata</option>
                    <option value="kumite">Kumite</option>
                    <option value="mixto">Mixto</option>
                  </select>
                  <LucideChevronDown
                    class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                for="status"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Estado</label
              >
              <div class="relative">
                <select
                  id="status"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400 appearance-none pr-8 cursor-pointer"
                >
                  <option value="planificacion">Planificación</option>
                  <option value="inscripcion">Inscripción Abierta</option>
                  <option value="proximo">Próximo</option>
                  <option value="activo">Activo</option>
                </select>
                <LucideChevronDown
                  class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
          </div>

          <div v-if="currentStep === 2" class="space-y-4">
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
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
                />
              </div>
              <div>
                <label
                  for="end-date"
                  class="block text-sm font-medium text-gray-700 mb-1"
                  >Fecha de Fin</label
                >
                <input
                  id="end-date"
                  type="date"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
                />
              </div>
            </div>
            <div>
              <label
                for="schedule"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Horarios de Jornadas</label
              >
              <textarea
                id="schedule"
                placeholder="Día 1: 9:00 - 18:00&#10;Día 2: 9:00 - 18:00"
                :rows="4"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
              />
            </div>
          </div>

          <div v-if="currentStep === 3" class="space-y-4">
            <div>
              <label
                for="venue"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Nombre del Lugar</label
              >
              <input
                id="venue"
                type="text"
                placeholder="Ej. Polideportivo Nacional"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
              />
            </div>
            <div>
              <label
                for="address"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Dirección</label
              >
              <input
                id="address"
                type="text"
                placeholder="Calle, número..."
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  for="city"
                  class="block text-sm font-medium text-gray-700 mb-1"
                  >Ciudad</label
                >
                <input
                  id="city"
                  type="text"
                  placeholder="Madrid"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
                />
              </div>
              <div>
                <label
                  for="postal"
                  class="block text-sm font-medium text-gray-700 mb-1"
                  >Código Postal</label
                >
                <input
                  id="postal"
                  type="text"
                  placeholder="28001"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
                />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  for="province"
                  class="block text-sm font-medium text-gray-700 mb-1"
                  >Provincia/Estado</label
                >
                <input
                  id="province"
                  type="text"
                  placeholder="Madrid"
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
                  placeholder="España"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
                />
              </div>
            </div>
            <div>
              <label
                for="venue-description"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Descripción del Lugar</label
              >
              <textarea
                id="venue-description"
                placeholder="Información adicional sobre las instalaciones..."
                :rows="3"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
              />
            </div>
          </div>

          <div v-if="currentStep === 4" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Categorías del Campeonato</label
              >
              <div class="flex gap-2 mt-2">
                <input
                  v-model="newCategory"
                  type="text"
                  placeholder="Ej. Infantil Masculino -45kg"
                  @keypress.enter="handleAddCategory"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-0 focus:border-gray-400"
                />
                <button
                  @click="handleAddCategory"
                  class="whitespace-nowrap inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                >
                  <LucidePlus class="w-4 h-4" />
                  Agregar
                </button>
              </div>
            </div>

            <div v-if="categories.length > 0" class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Categorías agregadas ({{ categories.length }})</label
              >
              <div class="space-y-2">
                <div
                  v-for="(category, index) in categories"
                  :key="index"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <span class="font-medium text-sm text-gray-800">{{
                    category
                  }}</span>
                  <button
                    @click="handleRemoveCategory(index)"
                    class="text-sm text-red-600 hover:text-red-700 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-8 pt-6 border-t border-gray-200 p-6"
      >
        <div class="flex gap-3 order-2 sm:order-1">
          <RouterLink
            to="/championships"
            class="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition flex-1 sm:flex-none"
          >
            Cancelar
          </RouterLink>

          <button
            v-if="currentStep > 1"
            @click="handlePrevious"
            class="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition flex-1 sm:flex-none"
          >
            Anterior
          </button>
        </div>

        <div class="order-1 sm:order-2">
          <button
            v-if="currentStep < steps.length"
            @click="handleNext"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Siguiente
          </button>

          <button
            v-if="currentStep === steps.length"
            @click="handleSubmit"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Crear Campeonato
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import {
  LucideArrowLeft,
  LucidePlus,
  LucideUpload,
  LucideX,
  LucideChevronDown,
} from 'lucide-vue-next'
// Importamos el nuevo stepper
import ChampionshipStepper from '@/modules/championships/components/ChampionshipsStepper.vue'

// --- Estado Local (Hardcodeado) ---
const router = useRouter()

const currentStep = ref(1)
const steps = [
  'Información General',
  'Fechas y Horarios',
  'Ubicación',
  'Categorías',
]

// Estado para el preview de la imagen
const imagePreview = ref<string | null>(null)

// Estado para las categorías
const categories = ref<string[]>([])
const newCategory = ref('')

// --- Lógica de la Vista (Hardcodeada) ---

const handleNext = () => {
  if (currentStep.value < steps.length) {
    currentStep.value++
  }
}

const handlePrevious = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleImageChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onloadend = () => {
      imagePreview.value = reader.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleRemoveImage = () => {
  imagePreview.value = null
  const input = document.getElementById('image-upload') as HTMLInputElement
  if (input) input.value = ''
}

const handleAddCategory = () => {
  if (newCategory.value.trim()) {
    categories.value.push(newCategory.value.trim())
    newCategory.value = ''
  }
}

const handleRemoveCategory = (index: number) => {
  categories.value = categories.value.filter((_, i) => i !== index)
}

const handleSubmit = () => {
  // Aquí iría tu lógica de 'toast'
  console.log('Campeonato creado exitosamente (simulado)')
  // Aquí recopilarías todos los datos de los refs y los enviarías
  router.push('/championships')
}
</script>