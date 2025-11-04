<template>
  <div class="flex-1 space-y-6 p-8">
    <!-- 🧭 Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Estudiantes</h1>
        <p class="text-gray-500 mt-1">
          <template v-if="userRole === 'Entrenador'">
            Gestiona los estudiantes de tu academia
          </template>
          <template v-else>
            Gestiona los estudiantes registrados en las academias
          </template>
        </p>
      </div>
      <button
        @click="openCreate"
        class="inline-flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition"
      >
        <LucidePlus class="h-4 w-4" />
        Nuevo Estudiante
      </button>
    </div>

    <!-- 📊 Cards resumen -->
    <div class="grid gap-4 md:grid-cols-4">
      <div
        v-for="(card, i) in cards"
        :key="i"
        class="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
      >
        <div class="flex items-center justify-between">
          <component :is="card.icon" class="h-5 w-5" :class="card.color" />
          <span class="text-sm font-medium text-gray-600">{{ card.label }}</span>
        </div>
        <p class="text-2xl font-bold text-gray-800 mt-2">{{ card.value }}</p>
        <p class="text-xs text-gray-400">{{ card.sub }}</p>
      </div>
    </div>

    <!-- 📋 Contenedor de tabla -->
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <!-- 🧾 Header tabla -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 class="font-semibold text-gray-800 text-lg">Lista de Estudiantes</h2>
          <p class="text-sm text-gray-500">
            {{ meta.total }} estudiantes • Página {{ meta.page }} de {{ meta.totalPages }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <LucideSearch class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              v-model="q"
              placeholder="Buscar..."
              class="pl-8 w-[300px] border border-gray-300 rounded-md h-10 text-sm px-3 focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>
        </div>
      </div>

      <!-- ✅ Tabla -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Cinturón</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Academia</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Correo</th>
              <th class="px-4 py-3 text-right font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-for="s in filtered" :key="s.id" class="hover:bg-gray-50 transition">
              <td class="px-4 py-3 font-medium text-gray-800">
                {{ s.firstname }} {{ s.lastname }}
              </td>

              <td class="px-4 py-3">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    beltClass(s.belt?.kyuLevel),
                  ]"
                >
                  {{ formatKyu(s.belt?.kyuLevel) }}
                </span>
              </td>

              <td class="px-4 py-3">{{ s.academy?.name || "Sin academia" }}</td>
              <td class="px-4 py-3">{{ s.user?.email || "N/A" }}</td>

              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <button class="p-1 hover:text-yellow-600" @click="openEdit(s)">
                    <LucideEdit class="h-4 w-4" />
                  </button>
                  <button class="p-1 hover:text-rose-600" @click="deleteStudent(s.id)">
                    <LucideTrash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filtered.length === 0">
              <td colspan="5" class="text-center py-6 text-gray-400">
                No se encontraron estudiantes.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 📄 Paginación -->
      <div class="p-4 flex justify-center">
        <Pagination
          :current-page="meta.page"
          :total-pages="meta.totalPages"
          @page-change="goToPage"
        />
      </div>

      <!-- 🧱 Modal Crear/Editar -->
      <StudentsDialog
        :open="isDialogOpen"
        :student="selectedStudent"
        @update:open="isDialogOpen = $event"
        @saved="handleSaved"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { storeToRefs } from "pinia"
import {
  LucidePlus,
  LucideSearch,
  LucideEdit,
  LucideTrash2,
  LucideUsers,
  LucideUserCheck,
  LucideAward,
  LucideBarChart2,
} from "lucide-vue-next"
import Pagination from "@/components/ui/Pagination.vue"
import { useStudentStore } from "../store/students.store"
import StudentsDialog from "../components/StudentsDialog.vue"
import type { Student } from "../types/students.types"

// 🏪 Store
const studentStore = useStudentStore()
const { students, meta } = storeToRefs(studentStore)
const { fetchStudents, deleteStudent } = studentStore

// 👤 Obtener rol y academyId del usuario actual
const userRole = ref<string | null>(localStorage.getItem("userRole"))
const userAcademyId = ref<number | null>(
  localStorage.getItem("academyId") ? Number(localStorage.getItem("academyId")) : null
)

// � Debug: Ver qué valores tenemos
console.log("🔍 StudentsView - Estado de autenticación:", {
  userRole: userRole.value,
  userAcademyId: userAcademyId.value,
  academyIdRaw: localStorage.getItem("academyId"),
  user: localStorage.getItem("user"),
})

// �🔄 Cargar al montar (filtra por academia si es entrenador)
onMounted(() => {
  console.log("🔄 Montando StudentsView...")
  if (userRole.value === "Entrenador" && userAcademyId.value) {
    console.log(`✅ Filtrando por academyId: ${userAcademyId.value}`)
    fetchStudents(1, 10, userAcademyId.value)
  } else {
    console.log("⚠️ No se aplica filtro de academia:", {
      esEntrenador: userRole.value === "Entrenador",
      tieneAcademyId: !!userAcademyId.value
    })
    fetchStudents(1, 10)
  }
})

// 🔍 Búsqueda en tabla
const q = ref("")
const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return students.value
  return students.value.filter((s) =>
    [
      s.firstname,
      s.lastname,
      s.belt?.name ?? "",
      s.academy?.name ?? "",
      s.user?.email ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(term)
  )
})

// 📄 Paginación
const goToPage = (page: number) => {
  if (userRole.value === "Entrenador" && userAcademyId.value) {
    fetchStudents(page, meta.value.limit, userAcademyId.value)
  } else {
    fetchStudents(page, meta.value.limit)
  }
}

// 🧱 Modal
const isDialogOpen = ref(false)
const selectedStudent = ref<Student | null>(null)

const openCreate = () => {
  selectedStudent.value = null
  isDialogOpen.value = true
}

const openEdit = (student: Student) => {
  selectedStudent.value = student
  isDialogOpen.value = true
}

const handleSaved = async () => {
  if (userRole.value === "Entrenador" && userAcademyId.value) {
    await fetchStudents(meta.value.page, meta.value.limit, userAcademyId.value)
  } else {
    await fetchStudents(meta.value.page, meta.value.limit)
  }
  isDialogOpen.value = false
}

// 📊 Métricas
const totalNegros = computed(() =>
  students.value.filter((s) => s.belt?.kyuLevel === 0).length
)

const cards = computed(() => [
  {
    icon: LucideUsers,
    color: "text-rose-600",
    label: "Total Estudiantes",
    value: meta.value.total,
    sub: "Registrados",
  },
  {
    icon: LucideUserCheck,
    color: "text-green-600",
    label: "Activos",
    value: students.value.length,
    sub: "Entrenando",
  },
  {
    icon: LucideAward,
    color: "text-indigo-600",
    label: "Cinturones Negros",
    value: totalNegros.value,
    sub: "Dan certificados",
  },
  {
    icon: LucideBarChart2,
    color: "text-blue-600",
    label: "Edad Promedio",
    value: 15,
    sub: "Años",
  },
])

// 🥋 Funciones visuales
const formatKyu = (kyuLevel?: number) => {
  if (kyuLevel === undefined) return "Sin cinturón"
  if (kyuLevel === 11) return "Blanco"
  if (kyuLevel >= 1 && kyuLevel <= 10) return `${kyuLevel}º Kyu`
  if (kyuLevel === 0) return "1º Dan"
  if (kyuLevel < 0) return `${Math.abs(kyuLevel) + 1}º Dan`
  return "Dan avanzado"
}

const beltClass = (kyuLevel?: number) => {
  if (kyuLevel === undefined) return "bg-gray-200 text-gray-700"
  switch (kyuLevel) {
    case 11:
      return "bg-white text-gray-700 border border-gray-300"
    case 10:
      return "bg-cyan-100 text-cyan-700"
    case 9:
      return "bg-yellow-100 text-yellow-700"
    case 8:
      return "bg-orange-100 text-orange-700"
    case 7:
      return "bg-orange-200 text-green-700"
    case 6:
      return "bg-green-100 text-green-700"
    case 5:
      return "bg-green-200 text-blue-700"
    case 4:
      return "bg-blue-100 text-blue-700"
    case 3:
    case 2:
    case 1:
      return "bg-amber-800 text-white"
    default:
      return "bg-black text-yellow-300 font-semibold"
  }
}
</script>