<template>
  <div class="overflow-x-auto rounded-lg shadow-sm bg-white">
    <table class="min-w-full divide-y divide-gray-200 text-sm">
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

      <tbody class="divide-y divide-gray-100">
        <tr
          v-for="(item, index) in data"
          :key="item.id || index"
          class="hover:bg-gray-50 transition"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3 text-gray-700"
          >
            <!-- 👇 Si hay slot personalizado, úsalo -->
            <slot
              v-if="$slots[col.key]"
              :name="col.key"
              :item="item"
              :value="getValue(item, col.key)"
            />
            <!-- 👇 Si no, renderiza texto normal -->
            <template v-else>{{ getValue(item, col.key) }}</template>
          </td>

          <td v-if="$slots.actions" class="px-4 py-3 text-right">
            <slot name="actions" :item="item" />
          </td>
        </tr>
      </tbody>
    </table>

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