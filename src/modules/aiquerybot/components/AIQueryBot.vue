<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { aiQueryService } from '../services/aiQuery.service';
import type { Message, QuickAction } from '../types/aiQuery.types';

// ============================================
// ESTADO
// ============================================
const isOpen = ref(false);
const messages = ref<Message[]>([
  {
    id: '1',
    type: 'bot',
    content: '¡Hola! 👋 Soy tu asistente IA de Karate.\n\nPuedes preguntarme sobre campeonatos, estudiantes, academias y más.\n\n¿En qué puedo ayudarte?',
    timestamp: new Date(),
  },
]);
const inputValue = ref('');
const isLoading = ref(false);
const scrollContainer = ref<HTMLElement | null>(null);

// ============================================
// QUICK ACTIONS
// ============================================
const quickActions: QuickAction[] = [
  { id: 'active-championships', label: 'Campeonatos activos', icon: '🏆' },
  { id: 'medal-table', label: 'Medallero', icon: '🥇' },
  { id: 'search-competitors', label: 'Competidores', icon: '🥋' },
  { id: 'upcoming-tournaments', label: 'Próximos torneos', icon: '📅' },
  { id: 'help', label: 'Ayuda', icon: '💡' },
];

// ============================================
// FUNCIONES
// ============================================

// Auto-scroll al final
const scrollToBottom = async () => {
  await nextTick();
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
};

watch(() => messages.value.length, scrollToBottom);

// ============================================
// FUNCIONES - AGREGAR MENSAJE
// ============================================
const addMessage = (
  type: 'user' | 'bot',
  content: string,
  sql?: string,
  data?: any[]
) => {
  messages.value.push({
    id: Date.now().toString(),
    type,
    content,
    sql,
    data,
    timestamp: new Date(),
  });
};

// Enviar mensaje del usuario (MODO AUTO)
const handleSendMessage = async () => {
  if (!inputValue.value.trim() || isLoading.value) return;

  const userQuery = inputValue.value;
  addMessage('user', userQuery);
  inputValue.value = '';
  isLoading.value = true;

  try {
    // 🚀 Usar endpoint /auto (1 solo paso)
    const result = await aiQueryService.autoQuery(userQuery);

    // Mostrar SOLO la interpretación en lenguaje natural
    const botContent = result.interpretation || 'No se pudo generar una respuesta.';

    addMessage('bot', botContent, result.sql, result.data);

  } catch (error: any) {
    addMessage(
      'bot',
      `❌ Error: ${error.response?.data?.error || error.message}`
    );
  } finally {
    isLoading.value = false;
  }
};

// Manejar quick actions
const handleQuickAction = async (actionId: string) => {
  const action = quickActions.find((a) => a.id === actionId);
  if (!action) return;

  addMessage('user', action.label);
  isLoading.value = true;

  try {
    const result = await aiQueryService.quickAction(actionId);

    if (result.type === 'help') {
      addMessage('bot', result.content || '');
    } else if (result.type === 'query') {
      // Mostrar SOLO la interpretación (si existe)
      const content = result.interpretation || 
                     `Encontré ${result.data?.length || 0} resultado(s)`;
      addMessage('bot', content, result.sql, result.data);
    }
  } catch (error: any) {
    addMessage(
      'bot',
      `❌ Error: ${error.response?.data?.error || error.message}`
    );
  } finally {
    isLoading.value = false;
  }
};

// Formatear tabla HTML
const formatDataAsTable = (data: any[]) => {
  if (!data || data.length === 0) return '';

  const keys = Object.keys(data[0]);
  let table = '<div class="overflow-x-auto"><table class="min-w-full text-xs border">';

  // Headers
  table += '<thead class="bg-gray-100"><tr>';
  keys.forEach((key) => {
    table += `<th class="border px-2 py-1 font-semibold">${key}</th>`;
  });
  table += '</tr></thead>';

  // Rows (máximo 10)
  table += '<tbody>';
  data.slice(0, 10).forEach((row) => {
    table += '<tr class="hover:bg-gray-50">';
    keys.forEach((key) => {
      table += `<td class="border px-2 py-1">${row[key] ?? '-'}</td>`;
    });
    table += '</tr>';
  });
  table += '</tbody></table></div>';

  if (data.length > 10) {
    table += `<p class="text-xs text-gray-500 mt-2">... y ${data.length - 10} filas más</p>`;
  }

  return table;
};
</script>

<template>
  <div>
    <!-- Botón flotante -->
    <button
      @click="isOpen = !isOpen"
      class="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center text-2xl"
    >
      <span v-if="!isOpen">🤖</span>
      <span v-else>✖️</span>
    </button>

    <!-- Ventana de chat -->
    <div
      v-if="isOpen"
      class="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200"
    >
      <!-- Cabecera -->
      <div
        class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between"
      >
        <div>
          <h3 class="font-semibold text-lg flex items-center gap-2">
            <span>🤖</span>
            <span>SenpaiBot IA</span>
          </h3>
          <p class="text-xs text-blue-100">Consulta datos con lenguaje natural</p>
        </div>
        <button
          @click="isOpen = false"
          class="text-white hover:bg-blue-800 rounded p-1 transition"
        >
          <span class="text-xl">✖️</span>
        </button>
      </div>

      <!-- Mensajes -->
      <div
        ref="scrollContainer"
        class="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4"
      >
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'flex',
            message.type === 'user' ? 'justify-end' : 'justify-start',
          ]"
        >
          <div
            :class="[
              'max-w-[85%] rounded-lg p-3 shadow',
              message.type === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-800 border border-gray-200',
            ]"
          >
            <!-- Contenido -->
            <div class="text-sm whitespace-pre-wrap" v-html="message.content"></div>

            <!-- Tabla de resultados -->
            <div
              v-if="message.data && message.data.length > 0"
              class="mt-3"
              v-html="formatDataAsTable(message.data)"
            ></div>

            <!-- Timestamp -->
            <p
              :class="[
                'text-xs mt-2',
                message.type === 'user' ? 'text-blue-200' : 'text-gray-500',
              ]"
            >
              {{
                message.timestamp.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}
            </p>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-start">
          <div class="bg-white rounded-lg p-3 shadow border">
            <div class="flex gap-2">
              <span class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
              <span
                class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style="animation-delay: 0.2s"
              ></span>
              <span
                class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style="animation-delay: 0.4s"
              ></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="p-3 border-t bg-white">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="action in quickActions"
            :key="action.id"
            @click="handleQuickAction(action.id)"
            :disabled="isLoading"
            class="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full border border-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ action.icon }} {{ action.label }}
          </button>
        </div>
      </div>

      <!-- Input -->
      <div class="p-4 border-t bg-white rounded-b-lg">
        <div class="flex gap-2">
          <input
            v-model="inputValue"
            @keyup.enter="handleSendMessage"
            :disabled="isLoading"
            placeholder="Escribe tu consulta..."
            class="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            @click="handleSendMessage"
            :disabled="isLoading || !inputValue.trim()"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            📤
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

/* Estilos para tablas de resultados */
:deep(table) {
  font-size: 11px;
}
</style>