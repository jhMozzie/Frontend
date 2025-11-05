// src/modules/academies/services/academy-championships.service.ts

import { api } from "@/services/api"
import type {
  CreateParticipationDto,
  UpdateParticipationStatusDto,
  ParticipationResponse,
} from "../types/academy-championships.types"

export const academyChampionshipService = {
  /**
   * Crear participación inicial (estado "Participando")
   */
  async createParticipation(data: CreateParticipationDto): Promise<ParticipationResponse> {
    const response = await api.post<ParticipationResponse>(
      "/academy-championships",
      data
    )
    return response.data
  },

  /**
   * Obtener participación específica de una academia en un campeonato
   */
  async getParticipation(
    academyId: number,
    championshipId: number
  ): Promise<ParticipationResponse | null> {
    try {
      const response = await api.get<ParticipationResponse>(
        `/academy-championships/${academyId}/${championshipId}`
      )
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Actualizar estado de participación manualmente
   */
  async updateStatus(
    academyId: number,
    championshipId: number,
    data: UpdateParticipationStatusDto
  ): Promise<ParticipationResponse> {
    const response = await api.patch<ParticipationResponse>(
      `/academy-championships/${academyId}/${championshipId}/status`,
      data
    )
    return response.data
  },

  /**
   * Avanzar al siguiente estado automáticamente
   * Flujo: Participar -> Participando -> PreInscrito -> Confirmado
   */
  async advanceStatus(
    academyId: number,
    championshipId: number
  ): Promise<ParticipationResponse> {
    const response = await api.post<ParticipationResponse>(
      `/academy-championships/${academyId}/${championshipId}/advance`
    )
    return response.data
  },
}