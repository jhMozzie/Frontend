// src/modules/championships/store/championships.store.ts

import { defineStore } from "pinia"
import { ref } from "vue"

// --- 1. Importación de Servicios ---
import { championshipService } from "../services/championships.service"
import { championshipCategoryService } from "../services/championships-categories.service" 
import { participantService } from "../services/participants.service"
import { studentService } from '@/modules/students/services/students.service'

// --- 2. Importación de Tipos (Desde el index central) ---
import type {
  Championship,
  ChampionshipResponse,
  CreateChampionshipDto,
  UpdateChampionshipDto,
  ChampionshipCategoryListItem,
  PaginatedCategoriesResponse,
  CreateChampionshipCategoryPayload,
  UpdateChampionshipCategoryPayload,
  ParticipantStudentItem,
  PaginatedParticipantsResponse,
  CreateParticipantPayload,
  ParticipantListParams,
  Inscription
} from "../types"; 

// TIPOS ASUMIDOS
type StudentSearchResult = { id: number, name: string };
type StudentListResponse = { data: any[], meta: any }; 

// ===================================================================
// === FUNCIÓN DE AYUDA: AGRUPAR INSCRIPCIONES (FRONTEND MAPPER)
// ===================================================================
function groupInscriptions(data: any[]): ParticipantStudentItem[] {
    const grouped = new Map<number, ParticipantStudentItem>();

    for (const item of data) {
        const studentId = item.studentId;
        
        const inscription: Inscription = {
            participantId: item.id,
            categoryId: item.championshipCategoryId,
            categoryName: item.categoryName,
        };

        if (grouped.has(studentId)) {
            grouped.get(studentId)!.inscriptions.push(inscription);
        } else {
            grouped.set(studentId, {
                id: studentId,
                studentName: item.studentName,
                academyName: item.academyName,
                beltName: item.beltName,
                inscriptions: [inscription]
            });
        }
    }
    return Array.from(grouped.values());
}


export const useChampionshipStore = defineStore("championships", () => {
  
  // ===================================================================
  // === ESTADO (STATE)
  // ===================================================================

  const loading = ref(false) 
  const error = ref<string | null>(null)

  const championships = ref<Championship[]>([])
  const meta = ref<ChampionshipResponse["meta"]>({
    total: 0, page: 1, limit: 10, totalPages: 1,
  })

  const currentChampionship = ref<Championship | null>(null)
  
  const championshipCategories = ref<ChampionshipCategoryListItem[]>([])
  const categoriesMeta = ref<PaginatedCategoriesResponse["meta"]>({
    total: 0, page: 1, limit: 10, totalPages: 1,
  })
  const categoriesLoading = ref(false)
  const categoriesError = ref<string | null>(null)
  
  const championshipParticipants = ref<any[]>([]); 
  const participantsMeta = ref<PaginatedParticipantsResponse["meta"]>({
    total: 0, page: 1, limit: 10, totalPages: 1,
  })
  const participantsLoading = ref(false)
  const participantsError = ref<string | null>(null)

  const studentsResults = ref<StudentSearchResult[]>([]);
  const studentsLoading = ref(false);


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
    championshipCategories.value = []
    categoriesMeta.value = { total: 0, page: 1, limit: 10, totalPages: 1 }
    championshipParticipants.value = [] 
    participantsMeta.value = { total: 0, page: 1, limit: 10, totalPages: 1 } 

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
   * Carga los participantes (inscripciones individuales).
   */
  const fetchParticipants = async (params: ParticipantListParams) => {
    participantsLoading.value = true;
    participantsError.value = null;
    try {
      const response = await participantService.getPaginatedParticipants(params);
      
      // Asignamos los datos individuales tal cual vienen del backend
      championshipParticipants.value = response.data; 
      
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
  
  // 💥 ACCIÓN PARA BÚSQUEDA DE ESTUDIANTES
  const searchStudents = async (query: string) => {
    studentsLoading.value = true;
    studentsResults.value = []; 
    try {
        if (query.length < 3) {
            return;
        }
    const resp = await studentService.getAll(1, 50) as StudentListResponse;
    const list = resp.data || [];
    const q = query.toLowerCase();
    studentsResults.value = list
      .filter((s: any) => (`${s.firstname} ${s.lastname}`).toLowerCase().includes(q))
      .map((s: any) => ({ id: s.id, name: `${s.firstname} ${s.lastname}` }));

    } catch (err: any) {
        console.error("Error al buscar estudiantes:", err);
    } finally {
        studentsLoading.value = false;
    }
  }

  // 💥 ACCIÓN DE EDICIÓN GRANULAR (CORRECCIÓN)
  const updateParticipantInscription = async (
    participantId: number, 
    newCategoryId: number
  ) => {
      try {
        // 1. Llama al servicio para actualizar la única inscripción por Participant ID
        await participantService.updateParticipantInscription(participantId, {
            championshipCategoryId: newCategoryId
        });

        // 2. Recargamos la lista para ver los cambios
        await fetchParticipants({
          championshipId: currentChampionship.value!.id,
          page: participantsMeta.value.page,
          limit: participantsMeta.value.limit
        });

      } catch (err: any) {
          console.error("Error al actualizar la inscripción:", err);
          throw err;
      }
  }


  // ===================================================================
  // === EXPORTACIONES (RETURN)
  // ===================================================================
  return {
    loading, error,
    championships, meta, currentChampionship,
    fetchChampionships, fetchChampionshipById, createChampionship, updateChampionship, deleteChampionship,
    championshipCategories, categoriesMeta, categoriesLoading, categoriesError, fetchChampionshipCategories, createCategory, updateCategory, deleteCategory,
    championshipParticipants,
    participantsMeta,
    participantsLoading,
    participantsError,
    fetchParticipants,
    createParticipant,
    deleteParticipant,
    
    groupInscriptions, // Exportamos la función de agrupación para la vista de edición
    studentsResults,
    studentsLoading,
    searchStudents,
    updateParticipantInscription,
  }
})