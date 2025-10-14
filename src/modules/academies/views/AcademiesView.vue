<template>
  <div class="flex-1 space-y-6 p-8">
    <!-- 🧭 Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Academias</h1>
        <p class="text-gray-500 mt-1">Gestiona todas las academias registradas</p>
      </div>
      <button
        @click="openCreate"
        class="inline-flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition"
      >
        <LucidePlus class="h-4 w-4" />
        Nueva Academia
      </button>
    </div>

    <!-- ✅ Cards resumen -->
    <div class="grid gap-4 md:grid-cols-4">
      <!-- Total academias -->
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between">
          <LucideBuilding2 class="h-5 w-5 text-blue-600" />
          <span class="text-sm font-medium text-gray-600">Total Academias</span>
        </div>
        <p class="text-2xl font-bold text-gray-800 mt-2">{{ academies.length }}</p>
        <p class="text-xs text-gray-400">Registradas en el sistema</p>
      </div>

      <!-- Activas -->
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between">
          <LucideCheckCircle2 class="h-5 w-5 text-green-600" />
          <span class="text-sm font-medium text-gray-600">Academias Activas</span>
        </div>
        <p class="text-2xl font-bold text-gray-800 mt-2">{{ activeCount }}</p>
        <p class="text-xs text-gray-400">Operando actualmente</p>
      </div>

      <!-- Inactivas -->
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between">
          <LucideXCircle class="h-5 w-5 text-gray-500" />
          <span class="text-sm font-medium text-gray-600">Academias Inactivas</span>
        </div>
        <p class="text-2xl font-bold text-gray-800 mt-2">{{ inactiveCount }}</p>
        <p class="text-xs text-gray-400">Pausadas o sin actividad</p>
      </div>

      <!-- Promedio alumnos -->
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between">
          <LucideBarChart2 class="h-5 w-5 text-indigo-600" />
          <span class="text-sm font-medium text-gray-600">Promedio por Academia</span>
        </div>
        <p class="text-2xl font-bold text-gray-800 mt-2">{{ averageStudents }}</p>
        <p class="text-xs text-gray-400">Estudiantes por academia</p>
      </div>
    </div>

    <!-- 📋 Contenedor de tabla -->
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <!-- 🧾 Header tabla -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 class="font-semibold text-gray-800 text-lg">Lista de Academias</h2>
          <p class="text-sm text-gray-500">
            {{ meta.total }} academias • Página {{ meta.page }} de {{ meta.totalPages }}
          </p>
        </div>
      </div>

      <!-- ✅ Tabla (sin columna Estado) -->
      <DataTable
        :data="academies"
        :columns="[
          { key: 'name', label: 'Nombre' },
          { key: 'instructor', label: 'Instructor' },
          { key: 'contact.email', label: 'Correo' },
          { key: 'contact.phone', label: 'Teléfono' },
          { key: 'students', label: 'Estudiantes' },
        ]"
      >
        <!-- 👥 Estudiantes con ícono y 0 por defecto -->
        <template #students="{ value }">
          <div class="flex items-center gap-1">
            <LucideUsers
              :class="[
                'h-4 w-4',
                value > 0 ? 'text-gray-400' : 'text-gray-300',
              ]"
            />
            <span
              :class="[
                'font-medium',
                value > 0 ? 'text-gray-800' : 'text-gray-400 italic',
              ]"
            >
              {{ value || 0 }}
            </span>
          </div>
        </template>

        <!-- ⚙️ Acciones -->
        <template #actions="{ item }">
          <div class="flex justify-end gap-2">
            <button class="p-1 hover:text-yellow-500" @click="openEdit(item)">
              <LucideEdit class="h-4 w-4" />
            </button>
            <button class="p-1 hover:text-rose-500" @click="deleteAcademy(item.id)">
              <LucideTrash2 class="h-4 w-4" />
            </button>
          </div>
        </template>
      </DataTable>

      <!-- 📄 Paginación -->
      <div class="p-4 flex justify-center">
        <Pagination
          :current-page="meta.page"
          :total-pages="meta.totalPages"
          @page-change="goToPage"
        />
      </div>

      <!-- 🧱 Modal Crear/Editar -->
      <AcademyDialog
        :open="isDialogOpen"
        :academy="selectedAcademy"
        @update:open="isDialogOpen = $event"
        @submit="saveAcademy"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import {
  LucidePlus,
  LucideEdit,
  LucideTrash2,
  LucideUsers,
  LucideBuilding2,
  LucideCheckCircle2,
  LucideXCircle,
  LucideBarChart2,
} from "lucide-vue-next";
import { useAcademyStore } from "../stores/academy.store";
import DataTable from "@/components/ui/DataTable.vue";
import Pagination from "@/components/ui/Pagination.vue";
import AcademyDialog from "../components/AcademyDialog.vue";

// 🏪 Store
const academyStore = useAcademyStore();
const { academies, meta } = storeToRefs(academyStore);
const { fetchAcademies, deleteAcademy } = academyStore;

// 🔄 Cargar al montar
onMounted(() => fetchAcademies(1, 10));

// 📄 Paginación
const goToPage = (page: number) => fetchAcademies(page, meta.value.limit);

// 🧱 Modal
const isDialogOpen = ref(false);
const selectedAcademy = ref<any | null>(null);

const openCreate = () => {
  selectedAcademy.value = null;
  isDialogOpen.value = true;
};

const openEdit = (academy: any) => {
  selectedAcademy.value = academy;
  isDialogOpen.value = true;
};

const saveAcademy = async (academyData: any) => {
  if (academyData.id) {
    await academyStore.updateAcademy(academyData.id, academyData);
  } else {
    await academyStore.createAcademy(academyData);
  }

  await fetchAcademies(meta.value.page, meta.value.limit);
  isDialogOpen.value = false;
};

// 📊 KPIs
const activeCount = computed(
  () => academies.value.filter((a) => a.status === "Activo").length
);
const inactiveCount = computed(
  () => academies.value.filter((a) => a.status !== "Activo").length
);
const averageStudents = computed(() => {
  const activeAcademies = academies.value.filter((a) => a.status === "Activo");
  const total = activeAcademies.length || 1;
  const totalStudentsActive = activeAcademies.reduce(
    (sum, a) => sum + (a.students || 0),
    0
  );
  return Math.round(totalStudentsActive / total);
});
</script>