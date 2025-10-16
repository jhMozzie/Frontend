<script setup lang="ts">
import { ref, watch, onMounted } from "vue"
import { studentService } from "../services/students.service"
import type {
  CreateStudentDto,
  UpdateStudentDto,
  Student,
  Belt,
  Academy,
} from "../types/students.types"

const props = defineProps<{
  open: boolean
  student?: Student | null
}>()

const emit = defineEmits(["update:open", "saved"])

// --- helpers seguros ---
function toDateInputString(v: string | Date | null | undefined): string {
  if (!v) return ""
  const d = new Date(v)
  if (isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

// --- estado modal ---
const isOpen = ref(props.open)
watch(() => props.open, (v) => (isOpen.value = v))
watch(isOpen, (v) => emit("update:open", v))

const isEdit = ref(!!props.student)

// --- form ---
const form = ref<CreateStudentDto>({
  firstname: "",
  lastname: "",
  birthdate: "",
  beltId: "",
  academyId: "",
  userId: undefined,
})

// 🔄 Sincroniza cuando cambia el estudiante (abrir/editar)
watch(
  () => props.student,
  (student) => {
    if (student) {
      isEdit.value = true

      // 💡 Adaptamos los campos al formato del formulario
      const next: CreateStudentDto = {
        firstname: student.firstname ?? "",
        lastname: student.lastname ?? "",
        birthdate: toDateInputString(student.birthdate),
        beltId: student.belt?.id?.toString() ?? "",
        academyId: student.academy?.id?.toString() ?? "",
        userId: student.user?.id,
      }

      form.value = next
    } else {
      isEdit.value = false
      form.value = {
        firstname: "",
        lastname: "",
        birthdate: "",
        beltId: "",
        academyId: "",
        userId: undefined,
      }
    }
  },
  { immediate: true }
)

// --- catálogos ---
const belts = ref<Belt[]>([])
const academies = ref<Academy[]>([])
const loading = ref(false)
const errorMessage = ref("")

onMounted(async () => {
  try {
    const [b, a] = await Promise.all([
      studentService.getBelts(),
      studentService.getAcademies(),
    ])
    belts.value = b
    academies.value = a
  } catch (err) {
    console.error("Error cargando catálogos:", err)
  }
})

// --- validación ---
const validateForm = () => {
  if (!form.value.firstname.trim() || !form.value.lastname.trim()) {
    errorMessage.value = "El nombre y apellido son obligatorios."
    return false
  }
  if (!form.value.birthdate) {
    errorMessage.value = "La fecha de nacimiento es obligatoria."
    return false
  }
  if (!form.value.beltId) {
    errorMessage.value = "Debe seleccionar un cinturón."
    return false
  }
  if (!form.value.academyId) {
    errorMessage.value = "Debe seleccionar una academia."
    return false
  }
  errorMessage.value = ""
  return true
}

// --- submit ---
const handleSubmit = async () => {
  if (!validateForm()) return
  loading.value = true

  // 👇 Convertimos los IDs a número antes de enviar al backend
  const payload = {
    ...form.value,
    beltId: Number(form.value.beltId),
    academyId: Number(form.value.academyId),
  }

  try {
    if (isEdit.value && props.student) {
      await studentService.update(props.student.id, payload as UpdateStudentDto)
    } else {
      await studentService.create(payload)
    }
    emit("saved")
    closeDialog()
  } catch (error) {
    errorMessage.value = "No se pudo guardar el estudiante."
    console.error(error)
  } finally {
    loading.value = false
  }
}

const closeDialog = () => {
  isOpen.value = false
}
</script>

<template>
  <transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      @click.self="closeDialog"
    >
      <transition name="scale">
        <div class="bg-white w-[450px] rounded-lg shadow-lg p-6 space-y-4">
          <h2 class="text-xl font-semibold text-gray-800">
            {{ isEdit ? "Editar Estudiante" : "Nuevo Estudiante" }}
          </h2>

          <p
            v-if="errorMessage"
            class="bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm"
          >
            {{ errorMessage }}
          </p>

          <form class="space-y-3" @submit.prevent="handleSubmit">
            <div>
              <label class="text-sm text-gray-700 font-medium">Nombre</label>
              <input
                v-model="form.firstname"
                type="text"
                required
                class="w-full border rounded-md px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label class="text-sm text-gray-700 font-medium">Apellido</label>
              <input
                v-model="form.lastname"
                type="text"
                required
                class="w-full border rounded-md px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label class="text-sm text-gray-700 font-medium">Fecha de nacimiento</label>
              <input
                v-model="form.birthdate"
                type="date"
                required
                class="w-full border rounded-md px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label class="text-sm text-gray-700 font-medium">Cinturón</label>
              <select
                v-model="form.beltId"
                required
                class="w-full border rounded-md px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="" disabled>Seleccionar cinturón</option>
                <option v-for="b in belts" :key="b.id" :value="b.id.toString()">
                  {{ b.name }} ({{ b.kyuLevel }}º Kyu)
                </option>
              </select>
            </div>

            <div>
              <label class="text-sm text-gray-700 font-medium">Academia</label>
              <select
                v-model="form.academyId"
                required
                class="w-full border rounded-md px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="" disabled>Seleccionar academia</option>
                <option v-for="a in academies" :key="a.id" :value="a.id.toString()">
                  {{ a.name }}
                </option>
              </select>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeDialog"
                class="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-60"
              >
                <span v-if="!loading">
                  {{ isEdit ? "Guardar cambios" : "Crear" }}
                </span>
                <span v-else>Cargando...</span>
              </button>
            </div>
          </form>
        </div>
      </transition>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scale-enter-active, .scale-leave-active { transition: transform 0.25s ease, opacity 0.25s ease; }
.scale-enter-from, .scale-leave-to { transform: scale(0.9); opacity: 0; }
</style>