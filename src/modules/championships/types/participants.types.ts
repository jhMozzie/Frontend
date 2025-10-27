// src/modules/championships/types/participants.types.ts

// Interfaz para los parámetros de filtro/paginación
export interface ParticipantListParams {
    page?: number;
    limit?: number;
    championshipId: number;
    categoryId?: number;
    studentId?: number;
}

/**
 * Payload para inscribir un participante (lo que envías a la API)
 */
export interface CreateParticipantPayload {
    studentId: number;
    championshipId: number; 
    categoryIds: number[];
}

/**
 * 💥 NUEVO TIPO: Payload para actualizar la categoría de una sola inscripción.
 * (Usado en el método PATCH/PUT /participants/:id).
 */
export interface UpdateParticipantPayload {
    championshipCategoryId: number;
}

/**
 * Define la estructura de una inscripción individual
 * (Usado dentro del modal y en ParticipantStudentItem)
 */
export interface Inscription {
    participantId: number;
    categoryId: number;
    categoryName: string;
}

/**
 * El objeto principal para la lista: UN estudiante y SUS inscripciones
 */
export interface ParticipantStudentItem {
    id: number;
    studentName: string;
    academyName: string;
    beltName: string;
    inscriptions: Inscription[];
}

/**
 * Respuesta paginada de la API de participantes (lista de estudiantes)
 */
export interface PaginatedParticipantsResponse {
  data: ParticipantStudentItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}