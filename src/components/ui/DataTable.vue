<template>
  <div class="overflow-hidden bg-white">
    <table class="w-full border-collapse text-sm">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3 text-left font-semibold text-gray-600"
          >
            {{ col.label }}
          </th>
          <th v-if="$slots.actions" class="px-4 py-3 text-right font-semibold text-gray-600">
            Acciones
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(item, index) in data"
          :key="item.id || index"
          class="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3 text-gray-700 whitespace-nowrap"
          >
            <slot
              v-if="$slots[col.key]"
              :name="col.key"
              :item="item"
              :value="getValue(item, col.key)"
            />
            <template v-else>{{ getValue(item, col.key) }}</template>
          </td>

          <td v-if="$slots.actions" class="px-4 py-3 text-right whitespace-nowrap">
            <slot name="actions" :item="item" />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Estado vacío -->
    <div v-if="!data || data.length === 0" class="p-6 text-center text-gray-500">
      No hay registros disponibles.
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: any[]
  columns: { key: string; label: string }[]
}>()

const getValue = (obj: any, path: string) => {
  if (!obj) return "—"
  try {
    return path.split(".").reduce((acc, key) => acc?.[key], obj) ?? "—"
  } catch {
    return "—"
  }
}
</script>

<style scoped>
table {
  border-spacing: 0;
  background-color: transparent;
}

/* ✅ Esquinas inferiores redondeadas limpias */
tbody tr:last-child td:first-child {
  border-bottom-left-radius: 0.5rem;
}
tbody tr:last-child td:last-child {
  border-bottom-right-radius: 0.5rem;
}

/* 🔹 Bordes sutiles, sin líneas negras */
tbody tr {
  border-color: rgb(229 231 235 / 0.6); /* = gray-200 con opacidad */
}

/* 🪶 Transición más suave al hacer hover */
tbody tr:hover td {
  background-color: rgb(249 250 251); /* gray-50 */
}
</style>