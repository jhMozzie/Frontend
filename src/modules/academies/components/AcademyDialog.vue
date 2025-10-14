<template>
  <Transition name="fade">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold">
              {{ isEditMode ? "Editar Academia" : "Agregar Nueva Academia" }}
            </h2>
            <p class="text-gray-500 text-sm">
              {{ isEditMode ? "Modifica la información de la academia" : "Completa la información de la nueva academia" }}
            </p>
          </div>
          <button @click="closeDialog" class="text-gray-500 hover:text-gray-700 text-lg">✕</button>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid gap-4 md:grid-cols-1">
            <!-- Nombre -->
            <div class="space-y-2">
              <label for="name" class="text-sm font-medium">Nombre de la Academia *</label>
              <input
                v-model="form.name"
                id="name"
                type="text"
                required
                placeholder="Ej: Dojo Central"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>

            <!-- Instructor -->
            <div class="space-y-2">
              <label class="text-sm font-medium">Instructor (Usuario Entrenador) *</label>

              <select
                v-model.number="form.userId"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-400 outline-none"
              >
                <option :value="null" disabled>Selecciona un entrenador</option>
                <option
                  v-for="coach in coaches"
                  :key="coach.id"
                  :value="coach.id"
                >
                  {{ coach.username }} — {{ coach.email }}
                </option>
              </select>

              <p v-if="form.userId" class="text-xs text-gray-500 mt-1">
                Entrenador seleccionado: <strong>{{ selectedCoachName }}</strong>
              </p>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" @click="closeDialog" class="px-4 py-2 text-sm border rounded-md hover:bg-gray-100">
              Cancelar
            </button>
            <button type="submit" class="px-4 py-2 text-sm text-white bg-rose-600 rounded-md hover:bg-rose-700">
              {{ isEditMode ? "Guardar Cambios" : "Crear Academia" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref, nextTick } from "vue"
import { api } from "@/services/api"
import type { Academy } from "../types/academy.types"

interface Coach {
  id: number
  username: string
  email: string
}

const props = defineProps<{
  open: boolean
  academy?: Academy | null     // OJO: en tu tabla NO trae userId
}>()

const emit = defineEmits(["update:open", "submit"])

const form = reactive({
  id: 0,
  name: "",
  userId: null as number | null,
})

const coaches = ref<Coach[]>([])

const isEditMode = computed(() => !!props.academy)

const selectedCoachName = computed(() => {
  const coach = coaches.value.find(c => c.id === form.userId)
  return coach ? coach.username : ""
})

const resetForm = () => {
  Object.assign(form, { id: 0, name: "", userId: null })
}

/** Carga entrenadores (ids numéricos) */
const fetchCoaches = async () => {
  const res = await api.get("/users", { params: { role: "Entrenador", page: 1, limit: 100 } })
  const arr = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : [])
  // Nos aseguramos de que los ids sean number
  coaches.value = arr.map((u: any) => ({ id: Number(u.id), username: u.username, email: u.email })) as Coach[]
}

/** Detalle de academia para edición (incluye userId o user.id) */
const fetchAcademyDetails = async (id: number) => {
  const { data } = await api.get(`/academies/${id}`)
  form.id   = Number(data.id)
  form.name = data.name ?? ""
  // coerción fuerte a number
  const uid = data.userId ?? data.user?.id ?? null
  form.userId = uid != null ? Number(uid) : null

  console.log("📘 Detalle academia:", { academyId: form.id, userId: form.userId, raw: data })

  // Opcional: log de rol
  if (form.userId != null) {
    try {
      const { data: userData } = await api.get(`/users/${form.userId}`)
      console.log("👤 Usuario relacionado:", {
        id: userData.id,
        username: userData.username,
        role: userData.role?.description
      })
    } catch (e) {
      console.warn("No se pudo obtener el rol del usuario:", e)
    }
  }
}

/** Al abrir el modal, cargamos lista + detalle (si edita) y preseleccionamos */
watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return
    resetForm()

    // Nombre visible que ya tienes en la tabla
    if (props.academy) {
      form.id = Number(props.academy.id)
      form.name = props.academy.name ?? ""
    }

    // 1) Cargar entrenadores y, si edita, detalle de academia
    if (props.academy?.id) {
      await Promise.all([ fetchCoaches(), fetchAcademyDetails(Number(props.academy.id)) ])
    } else {
      await fetchCoaches()
    }

    // 2) Asegúrate de que el userId esté como number y exista en las opciones
    if (form.userId != null) {
      const exists = coaches.value.some(c => c.id === form.userId)
      if (!exists) {
        console.warn("El userId de la academia no existe entre los entrenadores cargados:", form.userId)
        form.userId = null
      }
    }

    // Sincroniza el v-model con el DOM del select
    await nextTick()
  }
)

/** Si cambia la academia mientras está abierto, vuelve a sincronizar */
watch(
  () => props.academy?.id,
  async (id) => {
    if (!props.open || !id) return
    await Promise.all([ fetchCoaches(), fetchAcademyDetails(Number(id)) ])
    await nextTick()
  }
)

const closeDialog = () => {
  emit("update:open", false)
  resetForm()
}

const handleSubmit = () => {
  // 🔒 No enviamos "id" al crear. El store/llamada de create debe excluirlo.
  const payload = { name: form.name, userId: form.userId }
  emit("submit", isEditMode.value ? { ...form } : payload)
  emit("update:open", false)
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>