<template>
  <div class="relative">
    <!-- 🔍 Campo editable -->
    <input
      v-model="search"
      @focus="openList"
      @input="filterItems"
      type="text"
      :placeholder="placeholder"
      class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-400 outline-none"
    />

    <!-- 📋 Lista de resultados -->
    <transition name="fade">
      <ul
        v-if="isOpen && filteredItems.length > 0"
        class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto"
      >
        <li
          v-for="item in filteredItems"
          :key="item[valueKey]"
          @click="selectItem(item)"
          class="px-3 py-2 cursor-pointer hover:bg-rose-100 text-sm flex flex-col"
        >
          <span class="font-medium text-gray-800">{{ item[labelKey] }}</span>
          <span v-if="subLabelKey" class="text-xs text-gray-500">
            {{ item[subLabelKey] }}
          </span>
        </li>
      </ul>

      <!-- 🚫 Sin resultados -->
      <p
        v-else-if="isOpen && search.trim().length > 0"
        class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md p-2 text-sm text-gray-500"
      >
        No se encontraron resultados
      </p>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import axios from "axios"

const props = defineProps<{
  modelValue: string | number | null
  endpoint?: string
  items?: any[]
  labelKey?: string
  valueKey?: string
  subLabelKey?: string
  placeholder?: string
}>()

const emit = defineEmits(["update:modelValue", "change"])

const search = ref("")
const isOpen = ref(false)
const allItems = ref<any[]>([])
const filteredItems = ref<any[]>([])

const labelKey = props.labelKey ?? "label"
const valueKey = props.valueKey ?? "id"
const subLabelKey = props.subLabelKey ?? "email"

// ✅ Obtener datos desde API o props
const fetchItems = async () => {
  if (!props.endpoint) return
  try {
    const { data } = await axios.get(props.endpoint)

    // ✅ Normaliza estructura { data, meta } o array directo
    const arr = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : []

    allItems.value = arr
    filteredItems.value = arr // 🔥 Mostrar todo por defecto
  } catch (err) {
    console.error("❌ Error al cargar datos:", err)
    allItems.value = []
    filteredItems.value = []
  }
}

// ✅ Inicializar
onMounted(() => {
  if (props.items) {
    allItems.value = props.items
    filteredItems.value = props.items
  } else {
    fetchItems()
  }

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement
    if (!target.closest(".relative")) isOpen.value = false
  })
})

// ✅ Mostrar lista al enfocar
const openList = () => {
  isOpen.value = true
  if (search.value.trim() === "") filteredItems.value = allItems.value
}

// ✅ Filtrar por texto
const filterItems = () => {
  const query = search.value.toLowerCase().trim()
  if (!Array.isArray(allItems.value)) return
  if (query === "") {
    filteredItems.value = allItems.value
  } else {
    filteredItems.value = allItems.value.filter((item) =>
      String(item[labelKey]).toLowerCase().includes(query)
    )
  }
}

// ✅ Seleccionar elemento
const selectItem = (item: any) => {
  emit("update:modelValue", item[valueKey])
  emit("change", item)
  search.value = item[labelKey]
  isOpen.value = false
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>