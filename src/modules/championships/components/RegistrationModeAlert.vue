<template>
  <div 
    v-if="isVisible"
    class="border rounded-lg p-4 mb-6"
    :class="participationStatus === 'PreInscrito' 
      ? 'bg-blue-50 border-blue-200' 
      : 'bg-amber-50 border-amber-200'"
  >
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0 mt-0.5">
        <LucideCheckCircle 
          v-if="participationStatus === 'PreInscrito'"
          class="w-5 h-5 text-blue-600" 
        />
        <LucideAlertCircle 
          v-else
          class="w-5 h-5 text-amber-600" 
        />
      </div>

      <div class="flex-1">
        <!-- Mensaje para PRE_INSCRITO -->
        <template v-if="participationStatus === 'PreInscrito'">
          <h3 class="text-sm font-semibold text-blue-900 mb-1">
            Registro completado exitosamente
          </h3>
          <p class="text-sm text-blue-800 mb-3">
            Usted ha realizado el registro correctamente, podrá visualizar los brackets el día de la competencia. 
            Si desea hacer más inscripciones comuníquese con el organizador.
          </p>

          <!-- Contador de participantes -->
          <div class="flex items-center gap-2 text-sm">
            <LucideUsers class="w-4 h-4 text-blue-700" />
            <span class="font-medium text-blue-900">
              {{ totalParticipants }} {{ totalParticipants === 1 ? 'participante inscrito' : 'participantes inscritos' }}
            </span>
          </div>
        </template>

        <!-- Mensaje para PARTICIPANDO -->
        <template v-else>
          <h3 class="text-sm font-semibold text-amber-900 mb-1">
            Modo inscripción activo
          </h3>
          <p class="text-sm text-amber-800 mb-3">
            Puedes agregar, editar o eliminar participantes. 
            Cuando estés listo, presiona <span class="font-semibold">"Confirmar Participación"</span>.
          </p>

          <!-- Contador de participantes -->
          <div class="flex items-center gap-2 text-sm">
            <LucideUsers class="w-4 h-4 text-amber-700" />
            <span class="font-medium text-amber-900">
              {{ totalParticipants }} {{ totalParticipants === 1 ? 'participante inscrito' : 'participantes inscritos' }}
            </span>
          </div>

          <div v-if="totalParticipants === 0" class="mt-2 text-xs text-amber-700">
            No hay participantes inscritos aún. Comienza agregando estudiantes a las categorías.
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { LucideAlertCircle, LucideUsers, LucideCheckCircle } from 'lucide-vue-next';

interface Props {
  draftCount: number;
  totalParticipants?: number;
  participationStatus?: string;
}

withDefaults(defineProps<Props>(), {
  totalParticipants: 0,
  participationStatus: 'Participando'
});

const isVisible = ref(true);
</script>