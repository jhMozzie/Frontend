// src/modules/championships/types/championship-categories.types.ts

/**
 * DTO para cada categoría en la lista (lo que devuelve tu API paginada)
 */
export interface ChampionshipCategoryListItem {
  id: number;
  code: string | null;
  modality: string;
  gender: string;
  weight: string | null;
  ageRangeLabel: string;
  beltMinName: string;
  beltMaxName: string;
  participantCount: number;
}

/**
 * DTO para la respuesta paginada de la API de categorías
 */
export interface PaginatedCategoriesResponse {
  data: ChampionshipCategoryListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Payload para CREAR una categoría (lo que la API espera)
 */
export interface CreateChampionshipCategoryPayload {
  code?: string;
  modality: string;
  gender: string;
  weight?: string | null;
  beltMinId: number;
  beltMaxId: number;
  ageRangeId: number;
}

/**
 * Payload para ACTUALIZAR una categoría
 */
export type UpdateChampionshipCategoryPayload = Partial<CreateChampionshipCategoryPayload>;