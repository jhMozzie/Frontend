// src/modules/championships/services/participants.service.ts
import { api } from "@/services/api";
import type {
  PaginatedParticipantsResponse,
  ParticipantStudentItem,
  CreateParticipantPayload,
  ParticipantListParams,
  // 💥 Importar el nuevo tipo
  UpdateParticipantPayload 
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
      { params }
    );
    return data;
  },

  /**
   * Obtiene un participante específico por su ID
   */
  async getParticipantById(participantId: number) {
    // Esta ruta devuelve una sola inscripción, no un estudiante agrupado
    const { data } = await api.get( 
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

  // 💥 NUEVO MÉTODO: Actualización Individual (PATCH/PUT)
  /**
   * Actualiza la categoría de una inscripción individual.
   * Llama a: PUT/PATCH /participants/:id
   */
  async updateParticipantInscription(participantId: number, payload: UpdateParticipantPayload) {
    // Usamos PATCH que es la convención más común para actualizar un campo, 
    // pero funciona con PUT si el backend lo acepta.
    const { data } = await api.patch(
      `/participants/${participantId}`,
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