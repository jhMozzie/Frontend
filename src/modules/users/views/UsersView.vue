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
      <!-- Total general -->
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between">
          <LucideUsers class="h-5 w-5 text-red-500" />
          <span class="text-sm font-medium text-gray-600">Total Usuarios</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">{{ totalUsuarios }}</p>
          <p class="text-xs text-gray-500">Registrados en el sistema</p>
        </div>
      </div>

      <!-- Administradores -->
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between">
          <LucideShield class="h-5 w-5 text-rose-400" />
          <span class="text-sm font-medium text-gray-600">Administradores</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">{{ totalAdmins }}</p>
          <p class="text-xs text-gray-500">Con permisos completos</p>
        </div>
      </div>

      <!-- Entrenadores -->
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between">
          <LucideDumbbell class="h-5 w-5 text-sky-400" />
          <span class="text-sm font-medium text-gray-600">Entrenadores</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">{{ totalEntrenadores }}</p>
          <p class="text-xs text-gray-500">Activos en entrenamiento</p>
        </div>
      </div>

      <!-- Estudiantes -->
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between">
          <LucideGraduationCap class="h-5 w-5 text-emerald-500" />
          <span class="text-sm font-medium text-gray-600">Estudiantes</span>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-bold text-gray-800">{{ totalEstudiantes }}</p>
          <p class="text-xs text-gray-500">Registrados en academias</p>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 class="font-semibold text-gray-800 text-lg">Lista de Usuarios</h2>
          <!-- ✅ Protegido contra undefined -->
          <p class="text-sm text-gray-500">
            {{ meta?.total || 0 }} usuario(s) en total • Mostrando página
            {{ meta?.page || 1 }} de {{ meta?.totalPages || 1 }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Buscador -->
          <div class="relative">
            <LucideSearch class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              v-model="searchTerm"
              placeholder="Buscar usuarios..."
              class="pl-8 w-[300px] border border-gray-300 rounded-md h-10 text-sm px-3 focus:ring-2 focus:ring-rose-400 outline-none"
            />
          </div>

          <!-- Filtro simple -->
          <select
            v-model="filters.role"
            class="border border-gray-300 rounded-md h-10 px-2 text-sm"
          >
            <option value="all">Todos los roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Entrenador">Entrenador</option>
            <option value="Estudiante">Estudiante</option>
          </select>
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
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 transform hover:scale-105"
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

      <!-- Paginación -->
      <Pagination
        :current-page="meta?.page || 1"
        :total-pages="meta?.totalPages || 1"
        @page-change="goToPage"
      />
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
} from "lucide-vue-next";
import Pagination from "@/components/ui/Pagination.vue";
import UserDialog from "../components/UserDialog.vue";
import DataTable from "@/components/ui/DataTable.vue";
import { useUserStore } from "../stores/user.store";
import { storeToRefs } from "pinia";

// ✅ Store
const userStore = useUserStore();
const { users, loading, error, meta } = storeToRefs(userStore);

// ✅ fallback de seguridad
const safeMeta = computed(() => meta.value ?? { total: 0, page: 1, limit: 10, totalPages: 1 });
const allUsers = computed(() => userStore.allUsers ?? []);

// Estado local
const searchTerm = ref("");
const filters = ref({ role: "all" });
const isDialogOpen = ref(false);
const selectedUser = ref<any | null>(null);

// 🎨 Íconos y colores por rol
const rolIcons: Record<string, any> = {
  Administrador: LucideShield,
  Entrenador: LucideUserCog,
  Estudiante: LucideGraduationCap,
};
const rolColors: Record<string, string> = {
  Administrador: "bg-rose-100 text-rose-700 border border-rose-200",
  Entrenador: "bg-sky-100 text-sky-700 border border-sky-200",
  Estudiante: "bg-emerald-100 text-emerald-700 border border-emerald-200",
};
const getRoleIcon = (roleDesc?: string) => rolIcons[roleDesc ?? ""] || LucideUser;
const getRoleColor = (roleDesc?: string) => rolColors[roleDesc ?? ""] || "bg-gray-100 text-gray-600";

// 🚀 Carga inicial segura
onMounted(async () => {
  try {
    const page = meta.value?.page ?? 1;
    const limit = meta.value?.limit ?? 10;
    await userStore.fetchUsers(page, limit, filters.value.role);
    await userStore.fetchAllUsers();
    await nextTick(); // ✅ asegura que las refs estén listas antes del render
  } catch (err) {
    console.error("Error al montar UsersView:", err);
  }
});

// 👁️ Reactividad al cambiar el filtro
watch(
  () => filters.value.role,
  async (newRole) => {
    const limit = meta.value?.limit ?? 10;
    await userStore.fetchUsers(1, limit, newRole);
  }
);

// ✅ Totales globales (basados en allUsers)
const totalUsuarios = computed(() => allUsers.value?.length ?? 0);
const totalAdmins = computed(
  () => allUsers.value?.filter((u) => u.role?.description === "Administrador").length ?? 0
);
const totalEntrenadores = computed(
  () => allUsers.value?.filter((u) => u.role?.description === "Entrenador").length ?? 0
);
const totalEstudiantes = computed(
  () => allUsers.value?.filter((u) => u.role?.description === "Estudiante").length ?? 0
);

// 🔍 Filtro de búsqueda
const filteredUsers = computed(() => {
  const list = users.value ?? [];
  const term = searchTerm.value.toLowerCase().trim();
  if (!term) return list;
  return list.filter(
    (u) =>
      u.username?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      (u.role?.description ?? "").toLowerCase().includes(term)
  );
});

// 📄 Paginación
const goToPage = async (page: number) => {
  const limit = meta.value?.limit ?? 10;
  if (page < 1 || page > (meta.value?.totalPages ?? 1)) return;
  await userStore.fetchUsers(page, limit, filters.value.role);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// 🆕 Crear usuario
const openCreate = () => {
  selectedUser.value = null;
  isDialogOpen.value = true;
};

// ✏️ Editar usuario
const openEdit = (user: any) => {
  selectedUser.value = user;
  isDialogOpen.value = true;
};

// 🗑️ Eliminar usuario
const deleteUser = async (id: number) => {
  if (confirm("¿Seguro que deseas eliminar este usuario?")) {
    await userStore.deleteUser(id);
    await userStore.fetchUsers(meta.value?.page ?? 1, meta.value?.limit ?? 10, filters.value.role);
    await userStore.fetchAllUsers();
  }
};

// 🔄 Al crear/editar
const handleUserCreated = async () => {
  await userStore.fetchUsers(meta.value?.page ?? 1, meta.value?.limit ?? 10, filters.value.role);
  await userStore.fetchAllUsers();
};
</script>