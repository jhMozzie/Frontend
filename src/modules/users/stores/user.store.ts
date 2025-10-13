import { defineStore } from "pinia";
import { userService } from "../services/user.service";
import type { User, CreateUserDto, UpdateUserDto } from "../types/user.types";

export const useUserStore = defineStore("userStore", {
  state: () => ({
    users: [] as User[],
    allUsers: [] as User[], // 👈 NUEVO ESTADO
    loading: false,
    error: null as string | null,
    meta: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  }),

  actions: {
    async fetchUsers(page = 1, limit = 10, role = "all") {
      this.loading = true;
      try {
        const res = await userService.getAll(page, limit, role);
        this.users = res.data;
        this.meta = res.meta;
      } finally {
        this.loading = false;
      }
    },

    // 👇 NUEVO MÉTODO (para los totales globales)
    async fetchAllUsers() {
      try {
        const data = await userService.getAll(1, 9999, "all"); // usa el mismo servicio
        this.allUsers = data.data;
      } catch (error) {
        console.error("Error al cargar todos los usuarios:", error);
      }
    },

    async createUser(data: CreateUserDto) {
      try {
        const newUser = await userService.create(data);
        this.users.unshift(newUser); // lo agrega al inicio
        this.meta.total += 1;
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
        this.meta.total -= 1;
      } catch (err: any) {
        this.error = err.message;
      }
    },
  },
});
