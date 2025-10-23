<template>
  <div class="w-full">
    <div class="md:hidden mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-500">
          Paso {{ currentStep }} de {{ steps.length }}
        </span>
        <span class="text-sm font-semibold text-gray-900">
          {{ steps[currentStep - 1] }}
        </span>
      </div>
      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-red-600 transition-all duration-300"
          :style="{ width: `${(currentStep / steps.length) * 100}%` }"
        />
      </div>
    </div>

    <div class="hidden md:block">
      <div class="flex items-start justify-between relative">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="flex items-start flex-1 relative"
        >
          <div class="flex flex-col items-center w-full">
            <div class="relative z-10">
              <div
                :class="[
                  'flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-300',
                  stepNumber(index) < currentStep &&
                    'bg-red-50 border-red-600 shadow-sm',
                  stepNumber(index) === currentStep &&
                    'bg-red-600 border-red-600 shadow-lg scale-110',
                  stepNumber(index) > currentStep &&
                    'bg-white border-gray-300',
                ]"
              >
                <div
                  v-if="stepNumber(index) < currentStep"
                  class="flex items-center justify-center w-6 h-6 rounded-full bg-red-600"
                >
                  <Check class="w-4 h-4 text-white" />
                </div>
                <component
                  v-else
                  :is="stepIcons[index]"
                  :class="[
                    'w-6 h-6 transition-colors',
                    stepNumber(index) === currentStep
                      ? 'text-white'
                      : 'text-gray-400',
                  ]"
                />
              </div>
            </div>

            <div class="mt-3 text-center">
              <p
                :class="[
                  'text-xs font-medium mb-1 transition-colors',
                  stepNumber(index) === currentStep
                    ? 'text-red-600'
                    : 'text-gray-500',
                  stepNumber(index) > currentStep && 'text-gray-400',
                ]"
              >
                Paso {{ stepNumber(index) }}
              </p>
              <p
                :class="[
                  'text-sm font-semibold max-w-[120px] transition-colors',
                  stepNumber(index) === currentStep
                    ? 'text-gray-900'
                    : 'text-gray-500',
                  stepNumber(index) > currentStep && 'text-gray-400',
                ]"
              >
                {{ step }}
              </p>
            </div>
          </div>

          <div
            v-if="index < steps.length - 1"
            class="absolute top-7 left-[50%] right-[-50%] flex items-center z-0"
          >
            <div class="w-full h-0.5 bg-gray-300 relative overflow-hidden">
              <div
                :class="[
                  'absolute top-0 left-0 h-full bg-red-600 transition-all duration-500',
                  stepNumber(index) < currentStep ? 'w-full' : 'w-0',
                ]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 👇 Importamos solo los iconos necesarios para 3 pasos
import { Check, Info, MapPin, Tag } from 'lucide-vue-next'
import { shallowRef } from 'vue'
import type { Component } from 'vue'

defineProps<{
  steps: string[] // Espera un array de 3 strings
  currentStep: number // Espera 1, 2 o 3
}>()

// 👇 Actualizamos el array de iconos a 3
const stepIcons = shallowRef<Component[]>([Info, MapPin, Tag])

const stepNumber = (index: number) => index + 1
</script>