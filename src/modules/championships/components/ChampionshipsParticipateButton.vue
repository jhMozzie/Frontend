<template>
  <button
    @click="$emit('click')"
    :disabled="buttonConfig.disabled"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2 text-base font-semibold text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
      // Clases dinámicas basadas en la prop 'status'
      status === 'none' && 'bg-[#DC2626] hover:bg-[#B91C1C] focus:ring-[#DC2626]', // Rojo
      status === 'preRegistered' && 'bg-[#F59E0B] hover:bg-[#D97706] focus:ring-[#F59E0B]', // Ámbar
      status === 'registered' && 'bg-[#10B981] hover:bg-[#059669] focus:ring-[#10B981]', // Verde
      'disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-opacity-100',
    ]"
  >
    <component :is="buttonConfig.iconComponent" class="h-5 w-5" />
    <span>{{ buttonConfig.label }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import { UserPlus, Clock, CheckCircle2 } from 'lucide-vue-next'

// Definimos el tipo para el estado (puede ser exportado desde types si se usa en más sitios)
type RegistrationStatus = "none" | "preRegistered" | "registered";

// 1. Definimos las props que el componente recibe
const props = defineProps<{
  status: RegistrationStatus // Recibe el estado actual
}>()

// 2. Definimos los eventos que emite (solo 'click')
const emit = defineEmits(['click'])

// 3. Mapeo de iconos (igual que antes, pero local al botón)

const iconComponents: Record<string, Component> = {
  UserPlus: UserPlus,
  Clock: Clock,
  CheckCircle2: CheckCircle2,
};

// 4. Configuración del botón basada en props.status (igual que antes)
const buttonConfig = computed(() => {
  switch (props.status) {
    case "none":
      return { label: "Participar", iconComponent: iconComponents['UserPlus'], disabled: false };
    case "preRegistered":
      return { label: "Pre Inscrito", iconComponent: iconComponents['Clock'], disabled: false };
    case "registered":
      return { label: "Inscrito", iconComponent: iconComponents['CheckCircle2'], disabled: true };
    default:
      return { label: "...", iconComponent: iconComponents['UserPlus'], disabled: true };
  }
});
</script>