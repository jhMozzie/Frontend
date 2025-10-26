import { defineStore } from "pinia"
import { ref } from "vue"

// --- 1. Importación de Servicios ---
import { championshipService } from "../services/championships.service"
import { championshipCategoryService } from "../services/championships-categories.service" 

import type {
// --- 2. Importación de Tipos de Campeonato ---
  Championship,
  ChampionshipResponse,
  CreateChampionshipDto,
  UpdateChampionshipDto,
// --- 3. Importación de Tipos de Categoría ---
  ChampionshipCategoryListItem,
  PaginatedCategoriesResponse,
  CreateChampionshipCategoryPayload,
  UpdateChampionshipCategoryPayload
} from "../types/index.ts"
// (Como solicitaste, no importamos PaginationParams)


export const useChampionshipStore = defineStore("championships", () => {
  
  // ===================================================================
  // === ESTADO (STATE)
  // ===================================================================

  // --- Estado General / Principal ---
  /** Loading para la carga de la lista principal y el layout de detalle */
  const loading = ref(false) 
  /** Error para la carga de la lista principal y el layout de detalle */
  const error = ref<string | null>(null)

  // --- Estado: Lista de Campeonatos (ListView) ---
  /** Almacena la lista paginada de campeonatos */
  const championships = ref<Championship[]>([])
  /** Metadatos de paginación para la lista de campeonatos */
  const meta = ref<ChampionshipResponse["meta"]>({
    total: 0, page: 1, limit: 10, totalPages: 1,
  })

  // --- Estado: Detalle de Campeonato (DetailView) ---
  /** El campeonato que se está viendo actualmente */
  const currentChampionship = ref<Championship | null>(null)
  /** Las categorías del campeonato actual */
  const championshipCategories = ref<ChampionshipCategoryListItem[]>([])
  /** Los metadatos de paginación de las categorías */
  const categoriesMeta = ref<PaginatedCategoriesResponse["meta"]>({
    total: 0, page: 1, limit: 10, totalPages: 1,
  })
  
  /** Loading separado SOLO para el contenido de las pestañas (Categorías, etc.) */
  const categoriesLoading = ref(false)
  /** Error separado SOLO para el contenido de las pestañas */
  const categoriesError = ref<string | null>(null)
  
  // ===================================================================
  // === ACCIONES: CAMPEONATO (ACTIONS: CHAMPIONSHIP)
  // ===================================================================

  /**
   * Carga la lista paginada de campeonatos
   */
  const fetchChampionships = async (page = 1, limit = 10) => {
    loading.value = true // <-- Usa loading principal
    error.value = null
    try {
      const response = await championshipService.getAll(page, limit) 
      championships.value = response.data
      Object.assign(meta.value, response.meta)
    } catch (err: any) {
      error.value = err.message || "Error al obtener campeonatos"
    } finally {
      loading.value = false // <-- Usa loading principal
    }
  }

  /**
   * Carga un campeonato específico por ID y lo guarda en 'currentChampionship'
   * Este método usa el 'loading' principal porque carga el layout.
   */
  const fetchChampionshipById = async (id: number) => {
    loading.value = true // <-- CORRECCIÓN: Tu original no ponía loading aquí
    error.value = null
    currentChampionship.value = null // Limpia el estado anterior
    
    // Resetea los datos de las pestañas al cambiar de campeonato
    championshipCategories.value = []
    categoriesMeta.value = { total: 0, page: 1, limit: 10, totalPages: 1 }

    try {
      const data = await championshipService.getById(id)
      currentChampionship.value = data // 👈 CORRECCIÓN: Guarda el campeonato
      return data
    } catch (err: any) {
      error.value = err.message || "Error al obtener campeonato"
      return undefined // Devuelve undefined en caso de error
    } finally {
      loading.value = false // <-- CORRECCIÓN: Usa loading principal
    }
  }

  /**
   * Crea un nuevo campeonato y recarga la lista
   */
  const createChampionship = async (payload: CreateChampionshipDto) => {
    // (Tu lógica original está bien)
    await championshipService.create(payload)
    await fetchChampionships(meta.value.page, meta.value.limit)
  }

  /**
   * Actualiza un campeonato y recarga la lista
   */
  const updateChampionship = async (id: number, payload: UpdateChampionshipDto) => {
    // (Tu lógica original está bien)
    await championshipService.update(id, payload)
    await fetchChampionships(meta.value.page, meta.value.limit)
  }

  /**
   * Elimina un campeonato y recarga la lista
   */
  const deleteChampionship = async (id: number) => {
    // (Tu lógica original está bien)
    await championshipService.delete(id)
    await fetchChampionships(meta.value.page, meta.value.limit)
  }

  // ===================================================================
  // === ACCIONES: CATEGORÍAS (ACTIONS: CHAMPIONSHIP-CATEGORIES)
  // ===================================================================

  /**
   * Carga las categorías paginadas para un campeonato específico.
   * Usa los 'loading'/'error' secundarios.
   */
  const fetchChampionshipCategories = async (championshipId: number, page = 1, limit = 10) => {
    categoriesLoading.value = true;
    categoriesError.value = null;
    try {
      // 👇 Llama al servicio con (id, page, limit)
      const response = await championshipCategoryService.getPaginatedCategories(championshipId, page, limit);
      championshipCategories.value = response.data;
      Object.assign(categoriesMeta.value, response.meta);
    } catch (err: any) {
      categoriesError.value = err.message || "Error al obtener las categorías";
      championshipCategories.value = [];
    } finally {
      categoriesLoading.value = false;
    }
  }

  /**
   * Crea una nueva categoría y recarga la lista actual de categorías
   */
  const createCategory = async (championshipId: number, payload: CreateChampionshipCategoryPayload) => {
    try {
      await championshipCategoryService.createCategory(championshipId, payload);
      // Recargamos la página actual de categorías
      await fetchChampionshipCategories(
        championshipId, 
        categoriesMeta.value.page, 
        categoriesMeta.value.limit
      );
    } catch (err: any) {
      console.error("Error en createCategory (store):", err);
      // Lanza el error para que el componente lo atrape (ej. mostrar toast)
      throw err;
    }
  }
  
  /**
   * Actualiza una categoría y recarga la lista actual de categorías
   */
  const updateCategory = async (categoryId: number, payload: UpdateChampionshipCategoryPayload) => {
     try {
       await championshipCategoryService.updateCategory(categoryId, payload);
       if (currentChampionship.value) {
         await fetchChampionshipCategories(
           currentChampionship.value.id, 
           categoriesMeta.value.page, 
           categoriesMeta.value.limit
         );
       }
     } catch (err: any) {
        console.error("Error en updateCategory (store):", err);
        throw err; // Lanza el error
     }
  }

  /**
   * Elimina una categoría y recarga la lista actual de categorías
   */
  const deleteCategory = async (categoryId: number) => {
    try {
      await championshipCategoryService.deleteCategory(categoryId);
       if (currentChampionship.value) {
         await fetchChampionshipCategories(
           currentChampionship.value.id, 
           categoriesMeta.value.page, 
           categoriesMeta.value.limit
         );
       }
    } catch (err: any) {
        console.error("Error en deleteCategory (store):", err);
        throw err; // Lanza el error
    }
  }

  // ===================================================================
  // === EXPORTACIONES (RETURN)
  // ===================================================================
  return {
    // --- Estado General ---
    loading,
    error,

    // --- Campeonato ---
    championships,
    meta,
    currentChampionship,
    
    // --- Categorías ---
    championshipCategories,
    categoriesMeta,
    categoriesLoading,
    categoriesError,

    // --- Acciones Campeonato ---
    fetchChampionships,
    fetchChampionshipById,
    createChampionship,
    updateChampionship,
    deleteChampionship,

    // --- Acciones Categorías ---
    fetchChampionshipCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})