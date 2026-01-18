export type VoiceProvider = 'openai' | 'openai-whisper' | 'elevenlabs' | 'webspeech' | 'gemini';

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
