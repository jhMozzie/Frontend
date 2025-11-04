// src/modules/academies/types/academy-championships.types.ts

// 🔄 SINCRONIZADO CON BACKEND: Los valores deben coincidir exactamente
export const ParticipationStatus = {
  PARTICIPAR: "Participar",
  PARTICIPANDO: "Participando",
  PRE_INSCRITO: "PreInscrito",
  CONFIRMADO: "Confirmado",
} as const

export type ParticipationStatusType = typeof ParticipationStatus[keyof typeof ParticipationStatus]

export interface CreateParticipationDto {
  academyId: number
  championshipId: number
  status?: ParticipationStatusType
}

export interface UpdateParticipationStatusDto {
  status: ParticipationStatusType
}

export interface ParticipationResponse {
  academyId: number
  championshipId: number
  status: ParticipationStatusType
  createdAt: string
  updatedAt: string
  academy?: {
    id: number
    name: string
  }
  championship?: {
    id: number
    name: string
    startDate: string
  }
}

export interface AdvanceStatusResponse {
  participation: ParticipationResponse
  message: string
}
