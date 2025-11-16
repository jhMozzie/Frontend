export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  sql?: string;
  data?: QueryResult[];
  timestamp: Date;
  isLoading?: boolean;
}

export interface QueryResult {
  [key: string]: unknown;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
}

// Respuestas de la API
export interface ConvertToSQLResponse {
  sql: string;
  naturalQuery: string;
}

export interface ExecuteSQLResponse {
  success: boolean;
  data: QueryResult[];
  rowCount: number;
}

export interface AutoQueryResponse {
  sql: string;
  naturalQuery: string;
  interpretation: string;  // Interpretación en lenguaje natural
  data: QueryResult[];
  rowCount: number;
  executionTime?: number;
}

export interface QuickActionResponse {
  type: 'help' | 'query';
  content?: string;
  interpretation?: string;  // Interpretación en lenguaje natural
  sql?: string;
  data?: QueryResult[];
}