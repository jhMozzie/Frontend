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
              {{ displayTotal }} {{ displayTotal === 1 ? 'participante inscrito' : 'participantes inscritos' }}
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
              {{ displayTotal }} {{ displayTotal === 1 ? 'participante inscrito' : 'participantes inscritos' }}
            </span>
          </div>

          <div v-if="displayTotal === 0" class="mt-2 text-xs text-amber-700">
            No hay participantes inscritos aún. Comienza agregando estudiantes a las categorías.
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { LucideAlertCircle, LucideUsers, LucideCheckCircle } from 'lucide-vue-next';
import { useChampionshipStore } from '@/modules/championships/store/championships.store';
import { storeToRefs } from 'pinia';

interface Props {
  draftCount?: number;
  totalParticipants?: number;
  participationStatus?: string;
}

const props = withDefaults(defineProps<Props>(), {
  draftCount: 0,
  totalParticipants: 0,
  participationStatus: 'Participando'
});

const isVisible = ref(true);
const route = useRoute();

// Obtener el total de participantes del store
const championshipStore = useChampionshipStore();
const { participantsMeta } = storeToRefs(championshipStore);
const { fetchParticipants } = championshipStore;

// Cargar participantes cuando se monta el componente
const loadParticipantCount = async () => {
  const championshipId = Number(route.params.id);
  const userAcademyId = localStorage.getItem("academyId") ? Number(localStorage.getItem("academyId")) : null;
  
  if (!championshipId || !userAcademyId) return;
  
  try {
    await fetchParticipants({
      championshipId,
      academyId: userAcademyId,
      page: 1,
      limit: 1 // Solo necesitamos el total, no los datos
    });
  } catch (error) {
    console.error('Error cargando contador de participantes:', error);
  }
};

// Cargar al montar y cuando cambia el estado de participación
onMounted(() => {
  loadParticipantCount();
});

watch(() => props.participationStatus, () => {
  loadParticipantCount();
});

// Usar el total del store o el prop si está disponible
const displayTotal = computed(() => {
  return participantsMeta.value.total || props.totalParticipants || 0;
});
</script>