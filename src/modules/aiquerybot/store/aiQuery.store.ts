import { defineStore } from 'pinia';
import type { Message } from '../types/aiQuery.types';

export const useAIQueryStore = defineStore('aiQuery', {
  state: () => ({
    messages: [] as Message[],
    isOpen: false,
  }),

  actions: {
    addMessage(message: Message) {
      this.messages.push(message);
    },

    clearMessages() {
      this.messages = [];
    },

    toggleChat() {
      this.isOpen = !this.isOpen;
    },
  },
});