import { VoiceSettings } from './voice';

export type AgentType = 'discussion' | 'document' | 'research';

export type AgentStatus = 'idle' | 'thinking' | 'working' | 'complete' | 'error';

export interface Agent {
  id: string;
  sessionId: string;
  type: AgentType;
  status: AgentStatus;
  config: AgentConfig;
  findings?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentConfig {
  aiModel: string;
  aiProvider: string;
  voiceSettings?: VoiceSettings;
  task?: string;
  context?: string;
}

export interface AgentSpawnRequest {
  task: string;
  type: AgentType;
  context?: string;
}

export interface AgentUpdateRequest {
  status?: AgentStatus;
  findings?: string;
}
