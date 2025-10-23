<template>
  <RouterLink :to="`/campeonatos/${id}`">
    <div class="overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
      <div class="aspect-video w-full overflow-hidden">
        <img :src="image" :alt="name" class="w-full h-full object-cover" />
      </div>
      
      <div class="p-5">
        <div class="flex items-start justify-between mb-3">
          <h3 class="font-semibold text-lg text-foreground line-clamp-1">{{ name }}</h3>
          
          <span class="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-red-600 text-white">
            {{ status }}
          </span>
        </div>

        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <Calendar class="w-4 h-4" />
            <span>{{ date }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <MapPin class="w-4 h-4" />
            <span class="line-clamp-1">{{ location }}</span>
          </div>
          
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <Users class="w-4 h-4" />
            <span>{{ academy }}</span>
          </div>
        </div>

        <div class="flex gap-2 mt-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click.prevent.stop="handleEdit"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-3 flex-1 gap-2 border border-gray-300 bg-white hover:bg-gray-50"
          >
            <Pencil class="w-4 h-4" />
            Editar
          </button>
          
          <button
            type="button"
            @click.prevent.stop="handleDelete"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-3 flex-1 gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-red-600 hover:text-red-700"
          >
            <Trash2 class="w-4 h-4" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Calendar, MapPin, Users, Pencil, Trash2 } from 'lucide-vue-next'

// 1. Las props están correctas, esperan 'academy'
const props = defineProps<{
  id: number;
  name: string;
  image: string;
  status: string;
  date: string;
  location: string;
  academy: string; // Correcto
}>()

// 2. Los emits están correctos
const emit = defineEmits<{
  (e: 'edit', id: number): void
  (e: 'delete', id: number): void
}>()

// 3. Los manejadores están correctos
const handleEdit = () => {
  emit('edit', props.id)
}

const handleDelete = () => {
  emit('delete', props.id)
}
</script>