import { VoiceConfig } from './voice';
import { Document, DocumentPatch } from './document';
import { Agent, AgentSpawnRequest } from './agent';

// Client → Server Events
export type ClientEvent =
  | { type: 'voice.start'; payload: { provider: 'openai' | 'elevenlabs' | 'webspeech'; config: VoiceConfig } }
  | { type: 'voice.stop' }
  | { type: 'voice.interrupt' }
  | { type: 'voice.audio'; payload: { audio: ArrayBuffer } }
  | { type: 'agent.spawn'; payload: AgentSpawnRequest }
  | { type: 'agent.inject'; payload: { agentId: string } }
  | { type: 'document.create'; payload: { title: string; type: string; template?: string } }
  | { type: 'document.update'; payload: { documentId: string; content: string } }
  | { type: 'document.version.create'; payload: { documentId: string; trigger: string } };

// Server → Client Events
export type ServerEvent =
  | { type: 'transcript.update'; payload: { speaker: 'user' | 'agent'; text: string; isFinal: boolean } }
  | { type: 'voice.audio'; payload: { audio: ArrayBuffer } }
  | { type: 'voice.status'; payload: { status: string } }
  | { type: 'document.created'; payload: { document: Document } }
  | { type: 'document.patch'; payload: DocumentPatch }
  | { type: 'document.snapshot'; payload: { document: Document } }
  | { type: 'agent.spawned'; payload: { agent: Agent } }
  | { type: 'agent.status'; payload: { agentId: string; status: string } }
  | { type: 'agent.complete'; payload: { agentId: string; findings: string } }
  | { type: 'error'; payload: { message: string; code?: string } };

export type WebSocketEvent = ClientEvent | ServerEvent;
