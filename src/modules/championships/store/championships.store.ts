import { defineStore } from "pinia"
import { ref } from "vue"

// --- 1. Importación de Servicios ---
import { championshipService } from "../services/championships.service"
import { championshipCategoryService } from "../services/championships-categories.service" 
import { participantService } from "../services/participants.service"

// --- 2. Importación de Tipos de Campeonato ---
import type {
  Championship,
  ChampionshipResponse,
  CreateChampionshipDto,
  UpdateChampionshipDto,
} from "../types/championships.types"

// --- 3. Importación de Tipos de Categoría ---
import type {
  ChampionshipCategoryListItem,
  PaginatedCategoriesResponse,
  CreateChampionshipCategoryPayload,
  UpdateChampionshipCategoryPayload
} from "../types/championships-categories.types"

// --- 4. Importación de Tipos de Participante (Actualizados) ---
import type {
    ParticipantStudentItem, // 👈 Usamos el tipo de Estudiante Agrupado
    PaginatedParticipantsResponse, // 👈 Usamos la respuesta paginada de Estudiantes
    CreateParticipantPayload,
    ParticipantListParams
} from "../types/participants.types"


export const useChampionshipStore = defineStore("championships", () => {
  
  // ===================================================================
  // === ESTADO (STATE)
  // ===================================================================

  // --- Estado General / Principal (Carga del Layout) ---
  const loading = ref(false) 
  const error = ref<string | null>(null)

  // --- Estado: Lista de Campeonatos (ListView) ---
  const championships = ref<Championship[]>([])
  const meta = ref<ChampionshipResponse["meta"]>({
    total: 0, page: 1, limit: 10, totalPages: 1,
  })

  // --- Estado: Detalle de Campeonato (DetailView) ---
  const currentChampionship = ref<Championship | null>(null)
  
  // --- Estado: Categorías ---
  const championshipCategories = ref<ChampionshipCategoryListItem[]>([])
  const categoriesMeta = ref<PaginatedCategoriesResponse["meta"]>({
    total: 0, page: 1, limit: 10, totalPages: 1,
  })
  const categoriesLoading = ref(false)
  const categoriesError = ref<string | null>(null)
  
  // --- 👇 Estado: Participantes (Corregido) ---
  const championshipParticipants = ref<ParticipantStudentItem[]>([]) // 👈 TIPO CORREGIDO
  const participantsMeta = ref<PaginatedParticipantsResponse["meta"]>({
    total: 0, page: 1, limit: 10, totalPages: 1,
  })
  const participantsLoading = ref(false)
  const participantsError = ref<string | null>(null)


  // ===================================================================
  // === ACCIONES: CAMPEONATO (ACTIONS: CHAMPIONSHIP)
  // ===================================================================

  const fetchChampionships = async (page = 1, limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const response = await championshipService.getAll(page, limit) 
      championships.value = response.data
      Object.assign(meta.value, response.meta)
    } catch (err: any) {
      error.value = err.message || "Error al obtener campeonatos"
    } finally {
      loading.value = false
    }
  }

  const fetchChampionshipById = async (id: number) => {
    loading.value = true
    error.value = null
    currentChampionship.value = null
    // Resetea todos los estados de detalle
    championshipCategories.value = []
    categoriesMeta.value = { total: 0, page: 1, limit: 10, totalPages: 1 }
    championshipParticipants.value = [] // 👈 Resetea participantes
    participantsMeta.value = { total: 0, page: 1, limit: 10, totalPages: 1 } // 👈 Resetea meta de participantes

    try {
      const data = await championshipService.getById(id)
      currentChampionship.value = data
      return data
    } catch (err: any) {
      error.value = err.message || "Error al obtener campeonato"
      return undefined
    } finally {
      loading.value = false
    }
  }

  const createChampionship = async (payload: CreateChampionshipDto) => {
    try {
      await championshipService.create(payload)
      await fetchChampionships(meta.value.page, meta.value.limit)
    } catch (err: any) {
      console.error(err);
      throw new Error(err.response?.data?.message || "Error al crear el campeonato");
    }
  }

  const updateChampionship = async (id: number, payload: UpdateChampionshipDto) => {
    try {
      await championshipService.update(id, payload)
      await fetchChampionships(meta.value.page, meta.value.limit)
    } catch (err: any) {
        console.error(err);
        throw new Error(err.response?.data?.message || "Error al actualizar el campeonato");
    }
  }

  const deleteChampionship = async (id: number) => {
     try {
        await championshipService.delete(id)
        await fetchChampionships(meta.value.page, meta.value.limit)
     } catch (err: any) {
        console.error(err);
        throw new Error(err.response?.data?.message || "Error al eliminar el campeonato");
     }
  }

  // ===================================================================
  // === ACCIONES: CATEGORÍAS (ACTIONS: CHAMPIONSHIP-CATEGORIES)
  // ===================================================================

  const fetchChampionshipCategories = async (championshipId: number, page = 1, limit = 10) => {
    categoriesLoading.value = true;
    categoriesError.value = null;
    try {
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

  const createCategory = async (championshipId: number, payload: CreateChampionshipCategoryPayload) => {
    try {
      await championshipCategoryService.createCategory(championshipId, payload);
      await fetchChampionshipCategories(
        championshipId, 
        categoriesMeta.value.page, 
        categoriesMeta.value.limit
      );
    } catch (err: any) {
      console.error("Error en createCategory (store):", err);
      throw err;
    }
  }
  
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
        throw err;
     }
  }

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
        throw err;
    }
  }

  // ===================================================================
  // === ACCIONES: PARTICIPANTES
  // ===================================================================

  /**
   * Carga los participantes PAGINADOS y filtrados (agrupados por estudiante).
   */
  const fetchParticipants = async (params: ParticipantListParams) => {
    participantsLoading.value = true;
    participantsError.value = null;
    try {
      const response = await participantService.getPaginatedParticipants(params);
      championshipParticipants.value = response.data; // 👈 Asigna ParticipantStudentItem[]
      Object.assign(participantsMeta.value, response.meta);
    } catch (err: any) {
      participantsError.value = err.message || "Error al obtener participantes";
      championshipParticipants.value = [];
    } finally {
      participantsLoading.value = false;
    }
  }

  /**
   * Crea (inscribe) un nuevo participante y recarga la lista
   */
  const createParticipant = async (payload: CreateParticipantPayload) => {
    if (!currentChampionship.value) throw new Error("Campeonato no seleccionado.");
    try {
      await participantService.createParticipant(payload);
      // Recargamos la página actual
      await fetchParticipants({
        championshipId: currentChampionship.value.id,
        page: participantsMeta.value.page,
        limit: participantsMeta.value.limit
      });
    } catch (err: any) {
      console.error("Error en createParticipant (store):", err);
      throw err;
    }
  }

  /**
   * Elimina una inscripción y recarga la lista
   */
  const deleteParticipant = async (participantId: number) => {
    if (!currentChampionship.value) throw new Error("Campeonato no seleccionado.");
    try {
      await participantService.deleteParticipant(participantId);
      // Recargamos
      await fetchParticipants({
        championshipId: currentChampionship.value.id,
        page: participantsMeta.value.page,
        limit: participantsMeta.value.limit,
      });
    } catch (err: any) {
      console.error("Error en deleteParticipant (store):", err);
      throw err;
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
    // --- Acciones Campeonato ---
    fetchChampionships,
    fetchChampionshipById,
    createChampionship,
    updateChampionship,
    deleteChampionship,

    // --- Categorías ---
    championshipCategories,
    categoriesMeta,
    categoriesLoading,
    categoriesError,
    // --- Acciones Categorías ---
    fetchChampionshipCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    
    // --- Participantes ---
    championshipParticipants,
    participantsMeta,
    participantsLoading,
    participantsError,
    // --- Acciones Participantes ---
    fetchParticipants,
    createParticipant,
    deleteParticipant,
  }
})