import { useCallback, useState, useEffect } from 'react';
import { useWebSocket, useWebSocketEvent } from './useWebSocket';
import { VoiceProvider, VoiceConfig, TranscriptEntry } from '@brainstorm-cafe/shared';

interface VoiceSessionHook {
  isActive: boolean;
  transcripts: TranscriptEntry[];
  startSession: (provider: VoiceProvider, config?: VoiceConfig) => void;
  stopSession: () => void;
  interrupt: () => void;
  sendAudio: (audio: ArrayBuffer) => void;
}

export function useVoiceSession(): VoiceSessionHook {
  const { send } = useWebSocket();
  const [isActive, setIsActive] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);

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

      const newEntry: TranscriptEntry = {
        id: `${Date.now()}`,
        sessionId: 'current',
        speaker,
        text,
        isFinal,
        timestamp: new Date(),
      };

      setTranscripts((prev) => {
        // If not final, replace the last non-final entry from the same speaker
        if (!isFinal) {
          const lastIndex = prev.length - 1;
          if (lastIndex >= 0 && !prev[lastIndex].isFinal && prev[lastIndex].speaker === speaker) {
            return [...prev.slice(0, lastIndex), newEntry];
          }
        }
        return [...prev, newEntry];
      });
    }
  });

  // Listen for audio responses
  useWebSocketEvent('voice.audio', (event) => {
    if (event.type === 'voice.audio') {
      // Play audio response
      // In a real implementation, decode and play the audio
      console.log('Received audio response:', event.payload.audio.byteLength, 'bytes');
    }
  });

  // Listen for Web Speech API transcripts (browser-native)
  useEffect(() => {
    console.log('[useVoiceSession] Setting up webspeech-transcript listener');

    const handleWebSpeechTranscript = (event: any) => {
      console.log('[useVoiceSession] Received webspeech-transcript event:', event.detail);
      const { text, isFinal, speaker } = event.detail;

      const newEntry: TranscriptEntry = {
        id: `${Date.now()}_${Math.random()}`,
        sessionId: 'current',
        speaker,
        text,
        isFinal,
        timestamp: new Date(),
      };

      console.log('[useVoiceSession] Adding transcript entry:', newEntry);
      setTranscripts((prev) => {
        // If not final, replace the last non-final entry from the same speaker
        if (!isFinal) {
          const lastIndex = prev.length - 1;
          if (lastIndex >= 0 && !prev[lastIndex].isFinal && prev[lastIndex].speaker === speaker) {
            console.log('[useVoiceSession] Replacing interim transcript');
            return [...prev.slice(0, lastIndex), newEntry];
          }
        }
        console.log('[useVoiceSession] Adding new transcript, total:', prev.length + 1);
        return [...prev, newEntry];
      });
    };

    window.addEventListener('webspeech-transcript', handleWebSpeechTranscript);
    return () => {
      console.log('[useVoiceSession] Removing webspeech-transcript listener');
      window.removeEventListener('webspeech-transcript', handleWebSpeechTranscript);
    };
  }, []);

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
    },
    [send]
  );

  const stopSession = useCallback(() => {
    send({ type: 'voice.stop' });
    setIsActive(false);
  }, [send]);

  const interrupt = useCallback(() => {
    send({ type: 'voice.interrupt' });
  }, [send]);

  const sendAudio = useCallback(
    (audio: ArrayBuffer) => {
      send({
        type: 'voice.audio',
        payload: { audio },
      });
    },
    [send]
  );

  return {
    isActive,
    transcripts,
    startSession,
    stopSession,
    interrupt,
    sendAudio,
  };
}
