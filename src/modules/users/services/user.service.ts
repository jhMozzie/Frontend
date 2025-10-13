import { api } from "@/services/api";
import type { User, CreateUserDto, UpdateUserDto } from "../types/user.types";

export const userService = {
  async getAll(page = 1, limit = 10, role = "all") {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      role,
    });
    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  },

  async getById(id: number): Promise<User> {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  async create(payload: CreateUserDto): Promise<User> {
    const res = await api.post("/users", payload);
    return res.data;
  },

  async update(id: number, payload: UpdateUserDto): Promise<User> {
    const res = await api.put(`/users/${id}`, payload);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
