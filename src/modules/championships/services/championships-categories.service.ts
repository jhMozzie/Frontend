// src/modules/championships/services/championship-categories.service.ts
import { api } from "@/services/api";
import type {
  PaginatedCategoriesResponse,
  ChampionshipCategoryListItem,
  CreateChampionshipCategoryPayload,
  UpdateChampionshipCategoryPayload
} from "../types/championships-categories.types";

// (Ya NO se define PaginationParams aquí)

/**
 * Servicio para el modelo 'ChampionshipCategory'
 */
export const championshipCategoryService = {
  
  /**
   * Obtiene categorías PAGINADAS para un campeonato
   */
  async getPaginatedCategories(championshipId: number, page = 1, limit = 10) {
    const { data } = await api.get<PaginatedCategoriesResponse>(
      // 👇 Construimos la URL manualmente, igual que en championshipService
      `/championships/${championshipId}/categories?page=${page}&limit=${limit}`
      // (Ya no pasamos el objeto 'params')
    );
    return data;
  },

  /**
   * Obtiene TODAS las categorías (sin paginar) para un campeonato
   */
  async getAllCategories(championshipId: number) {
    const { data } = await api.get<ChampionshipCategoryListItem[]>(
      `/championships/${championshipId}/categories/all` // Ruta de lista simple
    );
    return data;
  },
  
  /**
   * Obtiene una categoría específica por su ID
   */
  async getCategoryById(categoryId: number) {
    const { data } = await api.get<ChampionshipCategoryListItem>( 
      `/championship-categories/${categoryId}`
    );
    return data;
  },

  /**
   * Crea una nueva categoría
   */
  async createCategory(championshipId: number, payload: CreateChampionshipCategoryPayload) {
    const { data } = await api.post(
      `/championships/${championshipId}/categories`,
      payload
    );
    return data;
  },

  /**
   * Actualiza una categoría
   */
  async updateCategory(categoryId: number, payload: UpdateChampionshipCategoryPayload) {
    const { data } = await api.put(
      `/championship-categories/${categoryId}`,
      payload
    );
    return data;
  },

  /**
   * Elimina una categoría
   */
  async deleteCategory(categoryId: number) {
    const { data } = await api.delete(
      `/championship-categories/${categoryId}`
    );
    return data;
  }
};