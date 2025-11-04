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
 * Define la categoría del campeonato con información de modalidad
 */
export interface ChampionshipCategoryInMatch {
  id: number;
  code: string;
  modality: 'Kumite' | 'Kata'; // Tipo de competencia
  gender: string;
  weight: string | null;
  beltMin: {
    id: number;
    name: string;
    kyuLevel: number;
  };
  beltMax: {
    id: number;
    name: string;
    kyuLevel: number;
  };
  ageRange: {
    id: number;
    label: string;
    minAge: number;
    maxAge: number;
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

    // Relaciones
    championshipCategory: ChampionshipCategoryInMatch; // Información de la categoría con modalidad
    phase: {
      description: string;
      order: number;
    };
    participantAkka: MatchParticipant | null; 
    participantAo: MatchParticipant | null;
}