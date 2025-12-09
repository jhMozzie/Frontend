import axios from 'axios';
import type {
  ConvertToSQLResponse,
  ExecuteSQLResponse,
  AutoQueryResponse,
  QuickActionResponse,
} from '../types/aiQuery.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const aiQueryService = {
  /**
   * Convierte texto natural a SQL (sin ejecutar)
   */
  async convertToSQL(naturalQuery: string): Promise<ConvertToSQLResponse>{
    const response = await axios.post(`${API_URL}/ai-query/convert`, {
      naturalQuery,
    });
    return response.data;
  },

  /**
   * Ejecuta SQL ya generado
   */
  async executeSQL(sql: string): Promise<ExecuteSQLResponse> {
    const response = await axios.post(`${API_URL}/ai-query/execute`, {
      sql,
    });
    return response.data;
  },

  /**
   * 🆕 Convierte y ejecuta automáticamente (1 solo paso)
   */
  async autoQuery(naturalQuery: string): Promise<AutoQueryResponse> {
    const response = await axios.post(`${API_URL}/ai-query/auto`, {
      naturalQuery,
    });
    return response.data;
  },

  /**
   * Ejecuta una acción rápida predefinida
   */
  async quickAction(actionId: string): Promise<QuickActionResponse> {
    const response = await axios.post(`${API_URL}/ai-query/quick-action`, {
      actionId,
    });
    return response.data;
  },
};