// src/modules/championships/store/championships.store.ts

import { defineStore } from "pinia"
import { ref } from "vue"

// --- 1. Importación de Servicios ---
import { championshipService } from "../services/championships.service"
import { championshipCategoryService } from "../services/championships-categories.service" 
import { participantService } from "../services/participants.service"
import { studentService } from '@/modules/students/services/students.service'
import { matchService } from "../services/matches.service" // Asumiendo 'match.service.ts'

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
  Inscription,
  Match
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

  // 💥 NUEVO ESTADO PARA BRACKETS/MATCHES
  const matches = ref<Match[]>([]);
  const matchesLoading = ref(false);
  const matchesError = ref<string | null>(null);

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

  const fetchParticipants = async (params: ParticipantListParams) => {
    participantsLoading.value = true;
    participantsError.value = null;
    try {
      const response = await participantService.getPaginatedParticipants(params);
      championshipParticipants.value = response.data; 
      Object.assign(participantsMeta.value, response.meta);
    } catch (err: any) {
      participantsError.value = err.message || "Error al obtener participantes";
      championshipParticipants.value = [];
    } finally {
      participantsLoading.value = false;
    }
  }

  const createParticipant = async (payload: CreateParticipantPayload) => {
    if (!currentChampionship.value) throw new Error("Campeonato no seleccionado.");
    try {
      await participantService.createParticipant(payload);
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

  const deleteParticipant = async (participantId: number) => {
    if (!currentChampionship.value) throw new Error("Campeonato no seleccionado.");
    try {
      await participantService.deleteParticipant(participantId);
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
  
  const searchStudents = async (query: string) => {
    studentsLoading.value = true;
    studentsResults.value = []; 
    try {
        if (query.length < 3) {
            return;
        }
    console.log('🔍 Buscando estudiantes con query:', query);
    
    // 🆕 Obtener academyId del localStorage si el usuario es entrenador
    const userRole = localStorage.getItem("userRole");
    const userAcademyId = localStorage.getItem("academyId") ? Number(localStorage.getItem("academyId")) : undefined;
    
    console.log('👤 Rol:', userRole);
    console.log('🏫 AcademyId:', userAcademyId);
    
    // Si es entrenador, filtrar por su academia desde el backend
    const resp = await studentService.getAll(1, 50, userRole === "Entrenador" ? userAcademyId : undefined) as StudentListResponse;
    const list = resp.data || [];
    console.log('📋 Total estudiantes obtenidos del backend:', list.length);
    console.log('📋 Datos completos:', list);
    
    const q = query.toLowerCase();
    // Incluir academyId en los resultados para el filtrado por academia
    studentsResults.value = list
      .filter((s: any) => (`${s.firstname} ${s.lastname}`).toLowerCase().includes(q))
      .map((s: any) => ({ 
        id: s.id, 
        name: `${s.firstname} ${s.lastname}`,
        academyId: s.academyId 
      }));

    console.log('✅ Estudiantes filtrados por query:', studentsResults.value);

    } catch (err: any) {
        console.error("❌ Error al buscar estudiantes:", err);
    } finally {
        studentsLoading.value = false;
    }
  }

  const updateParticipantInscription = async (
    participantId: number, 
    newCategoryId: number
  ) => {
      try {
        await participantService.updateParticipantInscription(participantId, {
            championshipCategoryId: newCategoryId
        });

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
  // === ACCIONES: BRACKETS (MATCHES)
  // ===================================================================

  const fetchMatches = async (categoryId: number) => {
    matchesLoading.value = true;
    matchesError.value = null;
    try {
      matches.value = await matchService.getBracketsByCategory(categoryId);
    } catch (err: any) {
      matchesError.value = err.message || "Error al cargar los brackets.";
      matches.value = [];
    } finally {
      matchesLoading.value = false;
    }
  }

  const updateMatchResult = async (
    matchId: number, 
    winnerId: number, 
    scores?: { scoreAkka: number; scoreAo: number }
  ) => {
    try {
      const result = await matchService.updateMatchResult(matchId, winnerId, scores);
      
      // Actualizar el match en el estado local
      const matchIndex = matches.value.findIndex(m => m.id === matchId);
      if (matchIndex !== -1) {
        const match = matches.value[matchIndex];
        if (match && scores) {
          match.winnerId = winnerId;
          match.scoreAkka = scores.scoreAkka;
          match.scoreAo = scores.scoreAo;
          match.status = 'Completado';
        }
      }
      
      return result;
    } catch (err: any) {
      console.error("Error al actualizar resultado del match:", err);
      throw err;
    }
  }

  const generateBrackets = async (championshipId: number) => {
    try {
      // 💥 CORRECCIÓN: Retorna la respuesta del servicio (que contiene el mensaje)
      return await matchService.generateBrackets(championshipId);
    } catch (err: any) {
      console.error("Error al generar brackets:", err);
      // 💥 CORRECCIÓN: Lanza el error para que la vista lo atrape
      throw err;
    }
  }
  
  const exportBracketsPdf = async (championshipId: number) => {
      alert(`Simulando exportación de PDF para Campeonato ID: ${championshipId}`);
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
    
    groupInscriptions,
    studentsResults,
    studentsLoading,
    searchStudents,
    updateParticipantInscription,
    
    matches,
    matchesLoading,
    matchesError,
    fetchMatches,
    updateMatchResult,
    generateBrackets,
    exportBracketsPdf,
  }
})