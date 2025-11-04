<template>
    <div class="min-h-screen flex">
      <!-- Left side - Imagen -->
      <div class="hidden lg:flex lg:w-1/2 relative bg-black">
        <img
          src="../../../../public/karate-tournament-arena.jpg"
          alt="Karate Tournament"
          class="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
        <div class="relative z-10 flex flex-col justify-center px-16 text-white">
          <div class="flex items-center gap-3 mb-8">
            <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-red-600">
              <LucideTrophy class="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold">Karate Admin</h1>
              <p class="text-sm text-white/70">Sistema de Gestión de Campeonatos</p>
            </div>
          </div>
          <h2 class="text-4xl font-bold mb-4 text-balance">
            Gestiona tus campeonatos de karate de forma profesional
          </h2>
          <p class="text-lg text-white/80 text-pretty">
            Administra competidores, categorías, resultados y estadísticas en un solo lugar.
          </p>
        </div>
      </div>
  
      <!-- Right side - Login Form -->
      <div class="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div class="w-full max-w-md p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
          <!-- Mobile Logo -->
          <div class="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-red-600">
              <LucideTrophy class="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Karate Admin</h1>
            </div>
          </div>
  
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
            <p class="text-sm text-gray-500">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>
  
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Email -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                placeholder="admin@karate.com"
                v-model="email"
                required
                class="w-full h-11 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
  
            <!-- Password -->
            <div class="space-y-2">
              <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
              <div class="relative">
                <input
                  id="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  v-model="password"
                  required
                  class="w-full h-11 px-3 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="button"
                  @click="togglePassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <component :is="showPassword ? LucideEyeOff : LucideEye" class="h-4 w-4" />
                </button>
              </div>
            </div>
  
            <!-- Error -->
            <div v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {{ error }}
            </div>
  
            <!-- Submit -->
            <button
              type="submit"
              class="w-full h-11 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition"
              :disabled="isLoading"
            >
              {{ isLoading ? "Iniciando sesión..." : "Iniciar Sesión" }}
            </button>
  
            <div class="text-center">
              <button
                type="button"
                class="text-sm text-gray-500 hover:text-gray-800 transition"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
  
          <div class="mt-8 pt-6 border-t border-gray-200">
            <p class="text-xs text-center text-gray-500">
              Demo: Usa cualquier email y contraseña para acceder
            </p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue"
  import { useRouter } from "vue-router"
  import {
    LucideTrophy,
    LucideEye,
    LucideEyeOff,
  } from "lucide-vue-next"
  import { AuthService } from "../services/auth.service"
  
  const router = useRouter()
  
  const email = ref("")
  const password = ref("")
  const showPassword = ref(false)
  const isLoading = ref(false)
  const error = ref("")
  
  const togglePassword = () => {
    showPassword.value = !showPassword.value
  }
  
  const handleSubmit = async () => {
    error.value = ""
    isLoading.value = true
  
    try {
      const response = await AuthService.login({
        email: email.value,
        password: password.value
      })
      
      console.log('✅ Login exitoso - Respuesta COMPLETA:', JSON.stringify(response, null, 2))
      console.log('📋 Datos del usuario:', {
        id: response.user.id,
        email: response.user.email,
        username: response.user.username,
        role: response.user.role,
        academyId: response.user.academyId,
        tieneAcademyId: 'academyId' in response.user
      })
      
      // Verificar que la respuesta tenga la estructura correcta
      if (!response || !response.user || !response.user.role) {
        throw new Error('Respuesta del servidor inválida')
      }
      
      console.log('🔍 Verificando datos antes de guardar:', {
        hasResponse: !!response,
        hasUser: !!response.user,
        hasRole: !!response.user.role,
        roleValue: response.user.role,
        roleType: typeof response.user.role
      })
      
      // Guardar autenticación
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("userEmail", response.user.email)
      localStorage.setItem("userRole", response.user.role) // ← Es un string: "Administrador" o "Entrenador"
      localStorage.setItem("userId", String(response.user.id))
      localStorage.setItem("username", response.user.username)
      
      // 🆕 Guardar academyId si es entrenador
      if (response.user.academyId) {
        localStorage.setItem("academyId", String(response.user.academyId))
      }
      
      // Verificar inmediatamente después de guardar
      const savedRole = localStorage.getItem("userRole")
      console.log('✅ Sesión guardada:', {
        email: response.user.email,
        username: response.user.username,
        role: response.user.role,
        userId: response.user.id,
        academyId: response.user.academyId,
        savedRoleInLocalStorage: savedRole,
        savedRoleType: typeof savedRole
      })
      
      if (!savedRole || savedRole === "undefined" || savedRole === "null") {
        throw new Error('Error al guardar el rol en localStorage')
      }
      
      // Redireccionar al dashboard
      router.push("/")
    } catch (err: any) {
      console.error('❌ Error de login:', err)
      error.value = err.response?.data?.message || err.message || "Email o contraseña incorrectos"
    } finally {
      isLoading.value = false
    }
  }
  </script>