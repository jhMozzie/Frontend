import { defineStore } from "pinia";
import { userService } from "../services/user.service";
import type { User, CreateUserDto, UpdateUserDto } from "../types/user.types";

export const useUserStore = defineStore("userStore", {
  state: () => ({
    users: [] as User[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      try {
        this.users = await userService.getAll();
      } catch (err: any) {
        this.error = err.message || "Error al obtener usuarios";
      } finally {
        this.loading = false;
      }
    },

    async createUser(data: CreateUserDto) {
      try {
        const newUser = await userService.create(data);
        this.users.push(newUser);
      } catch (err: any) {
        this.error = err.message;
      }
    },

    async updateUser(id: number, data: UpdateUserDto) {
      try {
        const updated = await userService.update(id, data);
        const idx = this.users.findIndex((u) => u.id === id);
        if (idx !== -1) this.users[idx] = updated;
      } catch (err: any) {
        this.error = err.message;
      }
    },

    async deleteUser(id: number) {
      try {
        await userService.delete(id);
        this.users = this.users.filter((u) => u.id !== id);
      } catch (err: any) {
        this.error = err.message;
      }
    },
  },
});