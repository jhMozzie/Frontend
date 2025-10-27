// src/modules/championships/services/participants.service.ts
import { api } from "@/services/api";
import type {
  PaginatedParticipantsResponse,
  ParticipantStudentItem, // Usamos el tipo de Estudiante
  CreateParticipantPayload,
  ParticipantListParams
} from "../types/participants.types";

/**
 * Servicio para el modelo 'Participant'
 */
export const participantService = {
  
  /**
   * Obtiene participantes PAGINADOS (agrupados por estudiante)
   */
  async getPaginatedParticipants(params: ParticipantListParams) {
    const { data } = await api.get<PaginatedParticipantsResponse>(
      `/participants`, 
      { params } // Pasa { page, limit, championshipId, etc. } como query params
    );
    return data;
  },

  /**
   * Obtiene un participante específico por su ID
   * (Nota: Tu backend service getById devuelve una *inscripción*, 
   * mientras que getPaginated devuelve un *estudiante*. 
   * Esto puede necesitar ajuste si 'Editar' debe cargar más datos)
   */
  async getParticipantById(participantId: number) {
    // Esta ruta devuelve una sola inscripción, no un estudiante agrupado
    const { data } = await api.get( // Tipo 'any' por ahora
      `/participants/${participantId}`
    );
    return data;
  },

  /**
   * Crea (inscribe) un nuevo participante
   */
  async createParticipant(payload: CreateParticipantPayload) {
    const { data } = await api.post(
      `/participants`,
      payload
    );
    return data;
  },

  /**
   * Elimina una inscripción (participante)
   */
  async deleteParticipant(participantId: number) {
    const { data } = await api.delete(
      `/participants/${participantId}`
    );
    return data;
  }
};