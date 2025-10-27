// src/modules/championships/types/participants.types.ts

// Interfaz para los parámetros de filtro/paginación
export interface ParticipantListParams {
    page?: number;
    limit?: number;
    championshipId: number; // El ID del campeonato es obligatorio
    categoryId?: number;     // Filtro opcional
    studentId?: number;      // Filtro opcional
    // (Puedes añadir más filtros aquí si el backend los soporta, ej: academyName)
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
 * Define la estructura de una inscripción individual
 * (Usado dentro del modal y en ParticipantStudentItem)
 */
export interface Inscription {
    participantId: number; // ID de la tabla Participant (para borrar)
    categoryId: number;
    categoryName: string;
}

/**
 * El objeto principal para la lista: UN estudiante y SUS inscripciones
 */
export interface ParticipantStudentItem {
    id: number; // ID del Estudiante
    studentName: string;
    academyName: string;
    beltName: string;
    inscriptions: Inscription[]; // Array de sus inscripciones
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