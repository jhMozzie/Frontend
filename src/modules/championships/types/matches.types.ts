/**
 * Define el objeto del participante dentro de un Match (combate).
 */
export interface MatchParticipant {
  id: number; // ID del registro Participant
  student: {
    firstname: string;
    lastname: string;
    academy: { name: string };
  };
}

/**
 * Define la estructura de un Match (combate) como la recibe el frontend.
 */
export interface Match {
    id: number;
    championshipCategoryId: number;
    phaseId: number;
    matchNumber: number;
    status: string;
    winnerId: number | null;
    participantAkkaId: number | null;
    participantAoId: number | null;
    scoreAkka: number | null; 
    scoreAo: number | null;   
    nextMatchId: number | null;
    nextMatchSide: 'Akka' | 'Ao' | null;

    // 💥 CORRECCIONES CLAVE: AÑADIR RELACIONES
    phase: { // <--- Añadir la relación Phase
      description: string;
      order: number;
    };
    participantAkka: MatchParticipant | null; 
    participantAo: MatchParticipant | null;
}