`<template>
  <!-- Fondo oscuro al abrir en móviles -->
  <div
    v-if="isOpen"
    @click="toggleSidebar"
    class="fixed inset-0 bg-black/40 z-30 lg:hidden"
  ></div>

  <aside
    :class="[
      'fixed top-0 left-0 z-40 h-screen w-64 flex flex-col border-r transition-transform duration-300',
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      'bg-neutral-900 border-neutral-800 text-gray-100'
    ]"
  >
    <!-- Header -->
    <header class="border-b border-neutral-800">
      <div class="flex h-16 items-center gap-3 px-6">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600">
          <LucideTrophy class="h-6 w-6 text-white" />
        </div>
        <div class="flex flex-col">
          <span class="text-lg font-bold">Karate Admin</span>
          <span class="text-xs text-gray-400">Sistema de Gestión</span>
        </div>
      </div>
    </header>

    <!-- Navigation -->
    <section class="flex-1 overflow-y-auto">
      <nav class="space-y-1 p-4">
        <RouterLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
          :class="isActive(item.href)
            ? 'bg-red-700 text-white'
            : 'text-gray-400 hover:bg-red-800 hover:text-white'"
        >
          <component :is="item.icon" class="h-5 w-5" />
          {{ item.name }}
        </RouterLink>
      </nav>
    </section>

    <!-- Footer -->
    <footer class="border-t border-neutral-800 p-4 space-y-3">
      <div class="flex items-center gap-3 rounded-lg bg-red-800/50 px-3 py-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
          AD
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">Admin User</p>
          <p class="text-xs text-gray-400 truncate">admin@karate.com</p>
        </div>
      </div>

      <!-- Logout button -->
      <button
        @click="logout"
        class="w-full flex items-center justify-start gap-2 rounded-lg border border-neutral-700 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-red-800 hover:text-white transition"
      >
        <LucideLogOut class="h-4 w-4" />
        Cerrar Sesión
      </button>
    </footer>
  </aside>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import {
  LucideHome,
  LucideTrophy,
  LucideBuilding2,
  LucideUsers,
  LucideUserCircle,
} from "lucide-vue-next"

const props = defineProps<{ isOpen: boolean; toggleSidebar: () => void }>()

const navigation = [
  { name: "Dashboard", href: "/", icon: LucideHome },
  { name: "Campeonatos", href: "/championships", icon: LucideTrophy },
  { name: "Academias", href: "/academies", icon: LucideBuilding2 },
  { name: "Estudiantes", href: "/students", icon: LucideUsers },
  { name: "Usuarios", href: "/users", icon: LucideUserCircle },
]

const router = useRouter()
const route = useRoute()

const isActive = (href: string) =>
  route.path === href || (href !== "/" && route.path.startsWith(href))

const handleLogout = () => {
  if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
    alert("Sesión cerrada exitosamente")
  }
}


const logout = async () => {
  const confirmLogout = confirm("¿Estás seguro que deseas cerrar sesión?")
  if (!confirmLogout) return

  // 🔹 Limpiar sesión
  localStorage.removeItem("isAuthenticated")
  localStorage.removeItem("userEmail")

  // 🔹 Redirigir al login
  await router.push("/login")

  // 🔹 Refrescar el estado de la app (asegura desmontaje del MainLayout)
  window.location.reload()
}
</script>