<template>
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div class="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold">
              {{ isEditMode ? "Editar Usuario" : "Agregar Nuevo Usuario" }}
            </h2>
            <p class="text-gray-500 text-sm">
              {{
                isEditMode
                  ? "Modifica la información del usuario"
                  : "Completa la información del nuevo usuario"
              }}
            </p>
          </div>
          <button @click="closeDialog" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid gap-4 md:grid-cols-2">
            <!-- Nombre -->
            <div class="space-y-2">
              <label for="nombre" class="text-sm font-medium">Nombre Completo *</label>
              <input
                v-model="formData.nombre"
                id="nombre"
                type="text"
                required
                placeholder="Ej: Juan Pérez"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>

            <!-- Email -->
            <div class="space-y-2">
              <label for="email" class="text-sm font-medium">Email *</label>
              <input
                v-model="formData.email"
                id="email"
                type="email"
                required
                placeholder="usuario@ejemplo.com"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>

            <!-- Teléfono -->
            <div class="space-y-2">
              <label for="telefono" class="text-sm font-medium">Teléfono</label>
              <input
                v-model="formData.telefono"
                id="telefono"
                type="tel"
                placeholder="+51 900 000 000"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>

            <!-- Rol -->
            <div class="space-y-2">
              <label for="rol" class="text-sm font-medium">Rol *</label>
              <select
                v-model="formData.rolId"
                id="rol"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-400 outline-none"
              >
                <option disabled value="">Selecciona un rol</option>
                <option value="1">Administrador</option>
                <option value="2">Entrenador</option>
                <option value="3">Estudiante</option>
              </select>
            </div>

            <!-- Academia -->
            <div class="space-y-2">
              <label for="academia" class="text-sm font-medium">Academia Asignada *</label>
              <select
                v-model="formData.academia"
                id="academia"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-400 outline-none"
              >
                <option disabled value="">Selecciona una academia</option>
                <option value="Todas">Todas las academias</option>
                <option value="Dojo Central">Dojo Central</option>
                <option value="Karate Kids">Karate Kids</option>
                <option value="Academia Bushido">Academia Bushido</option>
              </select>
            </div>

            <!-- Password (solo crear) -->
            <div class="space-y-2" v-if="!isEditMode">
              <label for="password" class="text-sm font-medium">Contraseña *</label>
              <input
                v-model="formData.password"
                id="password"
                type="password"
                required
                minlength="8"
                placeholder="Mínimo 8 caracteres"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>

            <!-- Confirmación (solo crear) -->
            <div class="space-y-2" v-if="!isEditMode">
              <label for="confirmPassword" class="text-sm font-medium">Confirmar Contraseña *</label>
              <input
                v-model="formData.confirmPassword"
                id="confirmPassword"
                type="password"
                required
                minlength="8"
                placeholder="Repite la contraseña"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>
          </div>

          <!-- Botones -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" @click="closeDialog" class="px-4 py-2 text-sm border rounded-md hover:bg-gray-100">
              Cancelar
            </button>
            <button type="submit" class="px-4 py-2 text-sm text-white bg-rose-600 rounded-md hover:bg-rose-700">
              {{ isEditMode ? "Guardar Cambios" : "Crear Usuario" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from "vue";
import { useUserStore } from "../stores/user.store";

const props = defineProps<{
  open: boolean;
  user?: any;
}>();

const emit = defineEmits(["update:open", "submit"]);
const userStore = useUserStore();

// Estado del formulario
const formData = reactive({
  nombre: "",
  email: "",
  telefono: "",
  rolId: "",
  academia: "",
  password: "",
  confirmPassword: "",
});

const isEditMode = computed(() => !!props.user);

// ✅ Mover resetForm antes del watch
const resetForm = () => {
  Object.assign(formData, {
    nombre: "",
    email: "",
    telefono: "",
    rolId: "",
    academia: "",
    password: "",
    confirmPassword: "",
  });
};

// 👁️ Sincroniza el formulario cuando llega un usuario para editar
watch(
  () => props.user,
  (user) => {
    if (user) {
      Object.assign(formData, {
        nombre: user.username || "",
        email: user.email || "",
        telefono: user.phone || "",
        rolId: user.role?.id ? String(user.role.id) : "",
        academia: user.academia || "",
        password: "",
        confirmPassword: "",
      });
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

const closeDialog = () => {
  emit("update:open", false);
};

// ✅ Crear o Editar usuario
const handleSubmit = async () => {
  if (!isEditMode.value) {
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    await userStore.createUser({
      username: formData.nombre,
      email: formData.email,
      password: formData.password,
      phone: formData.telefono,
      roleId: Number(formData.rolId),
      status: "Activo",
    });
  } else {
    await userStore.updateUser(props.user.id, {
      username: formData.nombre,
      email: formData.email,
      phone: formData.telefono,
      roleId: Number(formData.rolId),
      status: props.user.status || "Activo",
    });
  }

  emit("submit");
  emit("update:open", false);
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>