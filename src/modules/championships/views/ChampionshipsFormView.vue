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
        {{ title }}
      </h1>
      <p class="text-gray-500 mt-2 text-sm md:text-base">
        {{ subtitle }}
      </p>
    </div>

    <div class="mb-8">
      <ChampionshipStepper :steps="steps" :current-step="currentStep" />
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-6 md:p-8">
        <div class="mt-8">
          <InfoStep v-if="currentStep === 1" v-model="formData" />
          <LocationStep v-if="currentStep === 2" v-model="formData" />
          <CategoriesStep v-if="currentStep === 3" v-model="formData" />
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
            {{ submitButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 💡 Importamos computed, onMounted y useRoute
import { ref, computed, onMounted } from 'vue'
// 💡 Importamos useRoute para leer los parámetros de la URL
import { useRouter, RouterLink, useRoute } from 'vue-router'
import { LucideArrowLeft } from 'lucide-vue-next'
import ChampionshipStepper from '@/modules/championships/components/ChampionshipsStepper.vue'
import { useChampionshipStore } from '@/modules/championships/store/championships.store'
import InfoStep from '@/modules/championships/components/create/InfoStep.vue'
import LocationStep from '@/modules/championships/components/create/LocationStep.vue'
import CategoriesStep from '@/modules/championships/components/create/CategoriesStep.vue'

const router = useRouter()
const route = useRoute() // 💡 Obtenemos la ruta actual
const championshipStore = useChampionshipStore()

// --- ESTADO LOCAL ---
const currentStep = ref(1)
const steps = ['Información y Fecha', 'Ubicación', 'Categorías']

// 💡 Lógica para detectar el modo (Crear vs. Editar)
const championshipId = computed(() => route.params.id ? Number(route.params.id) : null)
const isEditMode = computed(() => !!championshipId.value)

// 💡 Textos dinámicos para la UI
const title = computed(() => 
  isEditMode.value ? 'Editar Campeonato' : 'Nuevo Campeonato'
)
const subtitle = computed(() =>
  isEditMode.value 
    ? 'Actualiza la información del campeonato' 
    : 'Completa la información para crear un nuevo campeonato'
)
const submitButtonText = computed(() => 
  isEditMode.value ? 'Guardar Cambios' : 'Crear Campeonato'
)

// --- FORMULARIO ---
// (Estado inicial vacío)
const formData = ref({
  name: '',
  description: '',
  imagePreview: null as string | null,
  imageFile: null as File | null,
  status: 'Planificación',
  startDate: '',
  location: '',
  address: '',
  district: '',
  postal: '',
  province: '',
  country: '',
  venueDescription: '',
  categories: [] as string[],
  newCategory: '',
})

// 💡 CORRECCIÓN AQUÍ:
// Hacemos que la función acepte valores 'undefined' o 'null'
const formatDateForInput = (dateString: string | Date | undefined | null) => {
  // Esta lógica ya maneja correctamente los valores nulos/undefined
  if (!dateString) return ''
  const date = new Date(dateString)
  // Ajusta por la zona horaria para evitar que se muestre el día anterior
  const offset = date.getTimezoneOffset() * 60000
  const localDate = new Date(date.getTime() - offset)
  return localDate.toISOString().split('T')[0] // Retorna 'YYYY-MM-DD'
}

// 💡 Hook onMounted para cargar datos si estamos en modo "Editar"
onMounted(async () => {
  if (isEditMode.value && championshipId.value) {
    try {
      // Usamos la acción del store que busca por ID
      const existingData = await championshipStore.fetchChampionshipById(championshipId.value)
      
      if (existingData) {
        // Llenamos el formData con los datos existentes
        formData.value.name = existingData.name
        formData.value.status = existingData.status
        // Ahora esta línea garantiza siempre un string, usando fallback cuando sea undefined
        formData.value.startDate = formatDateForInput(existingData.startDate) || ''
        formData.value.location = existingData.location
        formData.value.district = existingData.district || ''
        formData.value.province = existingData.province || ''
        formData.value.country = existingData.country || ''
        // (La imagen y la descripción no vienen de la API, se quedan como están)
      }
    } catch (error) {
      console.error("Error al cargar los datos del campeonato:", error)
      router.push('/championships') // Si falla, regresamos a la lista
    }
  }
})

// --- LÓGICA DE NAVEGACIÓN ---
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

// 💡 HANDLESUBMIT ACTUALIZADO (ahora maneja Crear y Editar)
const handleSubmit = async () => {
  // 1. Creamos el payload (igual que antes)
  const payload = {
    name: formData.value.name,
    startDate: formData.value.startDate,
    location: formData.value.location,
    district: formData.value.district,
    province: formData.value.province,
    country: formData.value.country,
    status: formData.value.status,
    image: "", // MVP
    academyId: 1 // MVP
  }

  console.log('Enviando payload:', payload)

  try {
    // 2. Decidimos qué acción del store llamar
    if (isEditMode.value && championshipId.value) {
      // --- MODO EDITAR ---
      await championshipStore.updateChampionship(championshipId.value, payload)
    } else {
      // --- MODO CREAR ---
      await championshipStore.createChampionship(payload)
    }

    // 3. Redirigimos a la lista
    router.push('/championships')

  } catch (error) {
    console.error('Error al guardar el campeonato:', error)
    // Aquí deberías mostrar una alerta o un toast al usuario
  }
}
</script>