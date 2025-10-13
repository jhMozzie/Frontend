<template>
  <div class="flex-1 space-y-6 p-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Usuarios</h1>
        <p class="text-gray-500 mt-1">
          Gestiona los usuarios del sistema y sus permisos
        </p>
      </div>
      <button
        @click="openCreate"
        class="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
      >
        <LucidePlus class="h-4 w-4" />
        Nuevo Usuario
      </button>
    </div>

    <!-- ✅ Cards estadísticas -->
    <div class="grid gap-4 md:grid-cols-4">
      <div
        v-for="card in stats"
        :key="card.label"
        class="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
      >
        <div class="flex items-center justify-between">
          <component :is="card.icon" :class="['h-5 w-5', card.color]" />
          <span class="text-sm font-medium text-gray-600">{{ card.label }}</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">{{ card.value }}</p>
          <p class="text-xs text-gray-500">{{ card.desc }}</p>
        </div>
      </div>
    </div>

    <!-- Tabla principal -->
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <!-- Header de la tabla -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 relative">
        <div>
          <h2 class="font-semibold text-gray-800 text-lg">Lista de Usuarios</h2>
          <p class="text-sm text-gray-500">
            {{ meta?.total || 0 }} usuario(s) en total • Mostrando página
            {{ meta?.page || 1 }} de {{ meta?.totalPages || 1 }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Buscador -->
          <div class="relative">
            <LucideSearch class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              v-model="searchTerm"
              placeholder="Buscar usuarios..."
              class="pl-8 w-[260px] border border-gray-300 rounded-md h-10 text-sm px-3 focus:ring-2 focus:ring-rose-400 outline-none"
            />
          </div>

          <!-- Botón de filtro -->
          <button
            @click="showFilter = !showFilter"
            class="border border-gray-300 rounded-md h-10 w-10 flex items-center justify-center hover:bg-gray-100 transition"
          >
            <LucideFilter class="h-4 w-4 text-gray-500" />
          </button>

          <!-- Dropdown flotante -->
          <div
            v-if="showFilter"
            class="absolute right-0 top-14 bg-white border border-gray-200 rounded-md shadow-lg p-2 z-20 animate-fade-in"
          >
            <select
              v-model="filters.role"
              class="w-40 border border-gray-300 rounded-md h-9 px-2 text-sm focus:ring-1 focus:ring-rose-400"
            >
              <option value="all">Todos los roles</option>
              <option value="Administrador">Administrador</option>
              <option value="Entrenador">Entrenador</option>
              <option value="Estudiante">Estudiante</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tabla reutilizable -->
      <DataTable
        :data="filteredUsers"
        :columns="[
          { key: 'username', label: 'Usuario' },
          { key: 'email', label: 'Email' },
          { key: 'role.description', label: 'Rol' },
          { key: 'phone', label: 'Teléfono' },
          { key: 'status', label: 'Estado' }
        ]"
      >
        <!-- 🎨 Rol -->
        <template #role.description="{ item }">
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-300 hover:scale-105"
            :class="getRoleColor(item.role?.description)"
          >
            <component :is="getRoleIcon(item.role?.description)" class="h-3.5 w-3.5" />
            {{ item.role?.description || 'Sin rol' }}
          </span>
        </template>

        <!-- 🎨 Estado -->
        <template #status="{ value }">
          <span
            class="px-2 py-1 rounded-md text-xs font-semibold"
            :class="value === 'Activo'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-200 text-gray-600'"
          >
            {{ value }}
          </span>
        </template>

        <!-- 🛠️ Acciones -->
        <template #actions="{ item }">
          <div class="flex justify-end gap-2">
            <button class="p-1 hover:text-yellow-500" @click="openEdit(item)">
              <LucideEdit class="h-4 w-4" />
            </button>
            <button class="p-1 hover:text-rose-500" @click="deleteUser(item.id)">
              <LucideTrash2 class="h-4 w-4" />
            </button>
          </div>
        </template>
      </DataTable>

      <!-- ✅ Paginación integrada (sin borde inferior) -->
      <div class="p-4 bg-white flex justify-center">
        <Pagination
          :current-page="meta?.page || 1"
          :total-pages="meta?.totalPages || 1"
          @page-change="goToPage"
        />
      </div>
    </div>

    <!-- Modal -->
    <UserDialog
      v-model:open="isDialogOpen"
      :user="selectedUser"
      @submit="handleUserCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import {
  LucidePlus,
  LucideSearch,
  LucideUser,
  LucideUserCog,
  LucideEdit,
  LucideTrash2,
  LucideShield,
  LucideUsers,
  LucideGraduationCap,
  LucideDumbbell,
  LucideFilter,
} from "lucide-vue-next";
import Pagination from "@/components/ui/Pagination.vue";
import UserDialog from "../components/UserDialog.vue";
import DataTable from "@/components/ui/DataTable.vue";
import { useUserStore } from "../stores/user.store";
import { storeToRefs } from "pinia";

const userStore = useUserStore();
const { users, meta } = storeToRefs(userStore);

const searchTerm = ref("");
const filters = ref({ role: "all" });
const showFilter = ref(false);
const isDialogOpen = ref(false);
const selectedUser = ref<any | null>(null);

// Íconos y colores
const rolIcons: Record<string, any> = {
  Administrador: LucideShield,
  Entrenador: LucideUserCog,
  Estudiante: LucideGraduationCap,
};
const rolColors: Record<string, string> = {
  Administrador: "bg-rose-50 text-rose-700 border-rose-300",
  Entrenador: "bg-sky-50 text-sky-700 border-sky-300",
  Estudiante: "bg-emerald-50 text-emerald-700 border-emerald-300",
};
const getRoleIcon = (roleDesc?: string) => rolIcons[roleDesc ?? ""] || LucideUser;
const getRoleColor = (roleDesc?: string) => rolColors[roleDesc ?? ""] || "bg-gray-100 text-gray-600";

const allUsers = computed(() => userStore.allUsers ?? []);
const totalUsuarios = computed(() => allUsers.value.length ?? 0);
const totalAdmins = computed(() => allUsers.value.filter(u => u.role?.description === "Administrador").length);
const totalEntrenadores = computed(() => allUsers.value.filter(u => u.role?.description === "Entrenador").length);
const totalEstudiantes = computed(() => allUsers.value.filter(u => u.role?.description === "Estudiante").length);

const stats = computed(() => [
  { label: "Total Usuarios", value: totalUsuarios.value, desc: "Registrados en el sistema", icon: LucideUsers, color: "text-red-500" },
  { label: "Administradores", value: totalAdmins.value, desc: "Con permisos completos", icon: LucideShield, color: "text-rose-400" },
  { label: "Entrenadores", value: totalEntrenadores.value, desc: "Activos en entrenamiento", icon: LucideDumbbell, color: "text-sky-400" },
  { label: "Estudiantes", value: totalEstudiantes.value, desc: "Registrados en academias", icon: LucideGraduationCap, color: "text-emerald-500" },
]);

onMounted(async () => {
  const page = meta.value?.page ?? 1;
  const limit = meta.value?.limit ?? 10;
  await userStore.fetchUsers(page, limit, filters.value.role);
  await userStore.fetchAllUsers();
  await nextTick();
});

watch(() => filters.value.role, async (newRole) => {
  const limit = meta.value?.limit ?? 10;
  await userStore.fetchUsers(1, limit, newRole);
});

const filteredUsers = computed(() => {
  const term = searchTerm.value.toLowerCase().trim();
  const list = users.value ?? [];
  if (!term) return list;
  return list.filter(
    (u) =>
      u.username?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      (u.role?.description ?? "").toLowerCase().includes(term)
  );
});

const goToPage = async (page: number) => {
  const limit = meta.value?.limit ?? 10;
  if (page < 1 || page > (meta.value?.totalPages ?? 1)) return;
  await userStore.fetchUsers(page, limit, filters.value.role);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const openCreate = () => {
  selectedUser.value = null;
  isDialogOpen.value = true;
};

const openEdit = (user: any) => {
  selectedUser.value = user;
  isDialogOpen.value = true;
};

const deleteUser = async (id: number) => {
  if (confirm("¿Seguro que deseas eliminar este usuario?")) {
    await userStore.deleteUser(id);
    await userStore.fetchUsers(meta.value?.page ?? 1, meta.value?.limit ?? 10, filters.value.role);
    await userStore.fetchAllUsers();
  }
};

const handleUserCreated = async () => {
  await userStore.fetchUsers(meta.value?.page ?? 1, meta.value?.limit ?? 10, filters.value.role);
  await userStore.fetchAllUsers();
};
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.15s ease-out;
}
</style>