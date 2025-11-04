<template>
  <button
    @click="$emit('click')"
    :class="[
      'px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2',
      buttonClasses
    ]"
  >
    <LucideUserPlus class="w-5 h-5" />
    {{ buttonText }}
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { LucideUserPlus } from 'lucide-vue-next';

type RegistrationStatus = "none" | "preRegistered" | "registered";

interface Props {
  status: RegistrationStatus;
}

const props = defineProps<Props>();
defineEmits<{ click: [] }>();

const buttonText = computed(() => {
  switch (props.status) {
    case "none":
      return "Participar";
    case "preRegistered":
      return "Inscribiendo";
    case "registered":
      return "Inscrito";
    default:
      return "Participar";
  }
});

const buttonClasses = computed(() => {
  switch (props.status) {
    case "none":
      return "bg-red-600 hover:bg-red-700 text-white";
    case "preRegistered":
      return "bg-amber-500 hover:bg-amber-600 text-white";
    case "registered":
      return "bg-green-600 hover:bg-green-700 text-white cursor-default";
    default:
      return "bg-red-600 hover:bg-red-700 text-white";
  }
});
</script>