export interface Session {
  id: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionConfig {
  aiProvider: string;
  aiModel: string;
  voiceProvider: string;
  voiceSettings?: Record<string, unknown>;
}
