// src/modules/championships/services/match.service.ts

import { api } from "@/services/api";
// 💡 Asumiendo que 'Match' está exportado desde el index de types
import type { Match } from "../types"; 

/**
 * Servicio para el módulo de Matches/Brackets
 */
export const matchService = {
  
  /**
   * Genera masivamente los brackets para un campeonato.
   * Llama a: POST /api/matches/generate/:championshipId
   */
  async generateBrackets(championshipId: number) {
    const { data } = await api.post(
      `/matches/generate/${championshipId}`
    );
    return data;
  },

  /**
   * Obtiene la llave (lista de combates) de una categoría específica.
   * Llama a: GET /api/matches/:championshipCategoryId
   */
  async getBracketsByCategory(categoryId: number): Promise<Match[]> {
    const { data } = await api.get<Match[]>(
      `/matches/${categoryId}`
    );
    return data;
  },

  /**
   * Actualiza el resultado de un combate.
   * Incluye winnerId y los scores de ambos competidores.
   */
  async updateMatchResult(
    matchId: number, 
    winnerId: number, 
    scores?: { scoreAkka: number; scoreAo: number }
  ) {
    const { data } = await api.put(
        `/matches/${matchId}/winner`, 
        { 
          winnerId,
          scoreAkka: scores?.scoreAkka,
          scoreAo: scores?.scoreAo
        }
    );
    return data;
  }
};