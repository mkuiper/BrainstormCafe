export type VoiceProvider = 'openai' | 'openai-whisper' | 'elevenlabs' | 'webspeech' | 'gemini';

export type PersonaTone = 'casual' | 'balanced' | 'formal';
export type PersonaDepth = 'brief' | 'standard' | 'exhaustive';
export type PersonaMode = 'analytical' | 'hybrid' | 'lateral';

export interface PersonaSettings {
  tone: PersonaTone;
  depth: PersonaDepth;
  mode: PersonaMode;
}

export interface VoiceConfig {
  provider: VoiceProvider;
  settings?: VoiceSettings;
}

export interface VoiceSettings {
  pitch?: number;
  speed?: number;
  language?: string;
  voiceId?: string;
  model?: string;
  persona?: PersonaSettings;
  aiProvider?: string; // AIProvider type - avoiding circular dependency
  aiModel?: string; // AIModel type - avoiding circular dependency
}

export interface VoiceSession {
  id: string;
  provider: VoiceProvider;
  config: VoiceConfig;
  status: VoiceSessionStatus;
  createdAt: Date;
}

export type VoiceSessionStatus = 'idle' | 'connecting' | 'active' | 'paused' | 'ended' | 'error';

export interface TranscriptEntry {
  id: string;
  sessionId: string;
  speaker: 'user' | 'agent';
  text: string;
  isFinal: boolean;
  timestamp: Date;
}

export interface VoiceServiceAdapter {
  startSession(config: VoiceConfig): Promise<VoiceSession>;
  sendAudio(audio: ArrayBuffer): Promise<void>;
  interrupt(): Promise<void>;
  onTranscript(callback: (text: string, isFinal: boolean, speaker: 'user' | 'agent') => void): void;
  onAudioResponse(callback: (audio: ArrayBuffer) => void): void;
  endSession(): Promise<void>;
}
