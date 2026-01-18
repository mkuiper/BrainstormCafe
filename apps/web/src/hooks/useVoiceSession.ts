import { useCallback, useState, useEffect, useRef } from 'react';
import { useWebSocket, useWebSocketEvent } from './useWebSocket';
import { VoiceProvider, VoiceConfig, TranscriptEntry } from '@brainstorm-cafe/shared';
import { WebSpeechClient } from '@/lib/webSpeechClient';

export interface VoiceSessionHook {
  isActive: boolean;
  transcripts: TranscriptEntry[];
  addTranscript: (speaker: TranscriptEntry['speaker'], text: string, isFinal: boolean) => void;
  startSession: (provider: VoiceProvider, config?: VoiceConfig) => void;
  stopSession: () => void;
  interrupt: () => void;
  sendAudio: (audio: ArrayBuffer) => void;
  sendTranscript: (text: string, isFinal: boolean) => void;
}

export function useVoiceSession(): VoiceSessionHook {
  const { send } = useWebSocket();
  const [isActive, setIsActive] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [currentProvider, setCurrentProvider] = useState<VoiceProvider | null>(null);
  const webSpeechClientRef = useRef<WebSpeechClient | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const decodePcmAudio = useCallback(
    (data: ArrayBuffer, sampleRate: number, numChannels: number) => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate,
        });
      }

      const ctx = audioContextRef.current;
      const dataInt16 = new Int16Array(data);
      const frameCount = dataInt16.length / numChannels;
      const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
      for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
          channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
      }
      return buffer;
    },
    []
  );

  const playPcmAudio = useCallback(
    (data: ArrayBuffer, sampleRate: number, numChannels: number) => {
      const ctx = audioContextRef.current;
      if (ctx?.state === 'suspended') {
        ctx.resume().catch(() => undefined);
      }

      const buffer = decodePcmAudio(data, sampleRate, numChannels);
      const source = buffer ? audioContextRef.current!.createBufferSource() : null;
      if (!source) return;
      source.buffer = buffer;
      source.connect(audioContextRef.current!.destination);
      source.addEventListener('ended', () => sourcesRef.current.delete(source));

      const now = audioContextRef.current!.currentTime;
      nextStartTimeRef.current = Math.max(nextStartTimeRef.current, now);
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;
      sourcesRef.current.add(source);
    },
    [decodePcmAudio]
  );

  const clearAudioQueue = useCallback(() => {
    sourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {
        // ignore
      }
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  const addTranscript = useCallback(
    (speaker: TranscriptEntry['speaker'], text: string, isFinal: boolean) => {
      const newEntry: TranscriptEntry = {
        id: `${Date.now()}_${Math.random()}`,
        sessionId: 'current',
        speaker,
        text,
        isFinal,
        timestamp: new Date(),
      };

      setTranscripts((prev) => {
        if (!isFinal) {
          const lastIndex = prev.length - 1;
          if (lastIndex >= 0 && !prev[lastIndex].isFinal && prev[lastIndex].speaker === speaker) {
            const lastEntry = prev[lastIndex];
            const mergedText = text.startsWith(lastEntry.text) ? text : `${lastEntry.text}${text}`;
            return [
              ...prev.slice(0, lastIndex),
              {
                ...newEntry,
                text: mergedText,
              },
            ];
          }
        }
        return [...prev, newEntry];
      });
    },
    []
  );

  // Listen for voice status updates
  useWebSocketEvent('voice.status', (event) => {
    if (event.type === 'voice.status') {
      setIsActive(event.payload.status === 'active');
    }
  });

  // Listen for transcript updates
  useWebSocketEvent('transcript.update', (event) => {
    if (event.type === 'transcript.update') {
      const { speaker, text, isFinal } = event.payload;
      addTranscript(speaker, text, isFinal);

      // If this is an agent response and we're using WebSpeech, speak it
      if (speaker === 'agent' && isFinal && currentProvider === 'webspeech') {
        if (!webSpeechClientRef.current && typeof window !== 'undefined') {
          webSpeechClientRef.current = new WebSpeechClient();
        }
        webSpeechClientRef.current?.speak(text).catch(console.error);
      }
    }
  });

  // Listen for audio responses
  useWebSocketEvent('voice.audio', (event) => {
    if (event.type === 'voice.audio') {
      if (currentProvider === 'gemini') {
        playPcmAudio(event.payload.audio, 24000, 1);
      } else {
        console.log('Received audio response:', event.payload.audio.byteLength, 'bytes');
      }
    }
  });

  const startSession = useCallback(
    (provider: VoiceProvider, config?: VoiceConfig) => {
      const voiceConfig: VoiceConfig = config || {
        provider,
        settings: {},
      };

      send({
        type: 'voice.start',
        payload: {
          provider,
          config: voiceConfig,
        },
      });

      setTranscripts([]);
      setCurrentProvider(provider);
    },
    [send]
  );

  const stopSession = useCallback(() => {
    send({ type: 'voice.stop' });
    clearAudioQueue();
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
    }
    setIsActive(false);
    setCurrentProvider(null);
  }, [clearAudioQueue, send]);

  const interrupt = useCallback(() => {
    send({ type: 'voice.interrupt' });
    clearAudioQueue();
  }, [clearAudioQueue, send]);

  const sendAudio = useCallback(
    (audio: ArrayBuffer) => {
      send({
        type: 'voice.audio',
        payload: { audio },
      });
    },
    [send]
  );

  const sendTranscript = useCallback(
    (text: string, isFinal: boolean) => {
      send({
        type: 'voice.transcript',
        payload: { text, isFinal },
      });
    },
    [send]
  );

  return {
    isActive,
    transcripts,
    addTranscript,
    startSession,
    stopSession,
    interrupt,
    sendAudio,
    sendTranscript,
  };
}
