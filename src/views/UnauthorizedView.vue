<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
          <LucideShieldAlert class="w-10 h-10 text-red-600" />
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
        <p class="text-lg text-gray-600 mb-6">
          {{ errorMessage }}
        </p>
      </div>

      <div v-if="hasValidSession" class="bg-white rounded-lg border border-gray-200 p-6 mb-6 text-left">
        <h2 class="text-sm font-semibold text-gray-700 mb-2">Detalles:</h2>
        <ul class="text-sm text-gray-600 space-y-1">
          <li class="flex items-center gap-2">
            <span class="text-gray-400">•</span>
            <span>Tu rol actual: <strong class="text-gray-900">{{ userRole }}</strong></span>
          </li>
          <li class="flex items-center gap-2">
            <span class="text-gray-400">•</span>
            <span>Esta sección requiere permisos de <strong class="text-gray-900">Administrador</strong></span>
          </li>
        </ul>
      </div>

      <div v-else class="bg-red-50 rounded-lg border border-red-200 p-6 mb-6 text-left">
        <h2 class="text-sm font-semibold text-red-700 mb-2">⚠️ Sesión Inválida</h2>
        <p class="text-sm text-red-600">
          Tu sesión ha expirado o no tienes permisos válidos. Por favor, inicia sesión nuevamente.
        </p>
      </div>

      <div class="space-y-3">
        <button
          v-if="!hasValidSession"
          @click="goToLogin"
          class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
        >
          <LucideLogIn class="w-5 h-5" />
          Volver al Login
        </button>

        <template v-else>
          <button
            @click="goToDashboard"
            class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
          >
            <LucideHome class="w-5 h-5" />
            Volver al Dashboard
          </button>
          
          <button
            @click="goBack"
            class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            <LucideArrowLeft class="w-5 h-5" />
            Volver Atrás
          </button>
        </template>
      </div>

      <p class="text-xs text-gray-500 mt-8">
        {{ hasValidSession ? 'Si crees que esto es un error, contacta al administrador del sistema' : 'Necesitas iniciar sesión con credenciales válidas' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { LucideShieldAlert, LucideHome, LucideArrowLeft, LucideLogIn } from 'lucide-vue-next'

const router = useRouter()
const userRole = ref(localStorage.getItem('userRole') || null)
const isAuthenticated = ref(localStorage.getItem('isAuthenticated') === 'true')

// Verificar si tiene una sesión válida
const hasValidSession = computed(() => {
  return isAuthenticated.value && userRole.value !== null && userRole.value !== 'null'
})

// Mensaje de error dinámico
const errorMessage = computed(() => {
  if (!hasValidSession.value) {
    return 'Tu sesión ha expirado o no es válida'
  }
  return 'No tienes permisos para acceder a esta sección'
})

const goToDashboard = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}

const goToLogin = () => {
  // Limpiar sesión antes de ir al login
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('userRole')
  localStorage.removeItem('userRoleId')
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  
  router.push('/login')
}
</script>
