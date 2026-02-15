'use client';

import { Mic, MicOff, StopCircle, AlertCircle } from 'lucide-react';
import { VoiceSessionHook } from '@/hooks/useVoiceSession';
import { PersonaSettings, VoiceProvider, AIProvider, AIModel } from '@brainstorm-cafe/shared';
import { useState, useEffect, useRef } from 'react';
import { WebSpeechClient } from '@/lib/webSpeechClient';

interface VoiceControlProps {
  provider: VoiceProvider;
  geminiVoice: string;
  persona: PersonaSettings;
  voiceSession: VoiceSessionHook;
  aiProvider: AIProvider;
  aiModel: AIModel;
}

export default function VoiceControl({ provider, geminiVoice, persona, voiceSession, aiProvider, aiModel }: VoiceControlProps) {
  const { isActive, startSession, stopSession, interrupt, sendAudio, addTranscript } = voiceSession;
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const webSpeechClientRef = useRef<WebSpeechClient | null>(null);
  const geminiStreamRef = useRef<MediaStream | null>(null);
  const geminiInputContextRef = useRef<AudioContext | null>(null);
  const geminiProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const geminiSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      webSpeechClientRef.current = new WebSpeechClient();
    }

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (webSpeechClientRef.current) {
        webSpeechClientRef.current.stop();
      }
      if (geminiStreamRef.current) {
        geminiStreamRef.current.getTracks().forEach((track) => track.stop());
        geminiStreamRef.current = null;
      }
      if (geminiProcessorRef.current) {
        geminiProcessorRef.current.disconnect();
        geminiProcessorRef.current = null;
      }
      if (geminiSourceRef.current) {
        geminiSourceRef.current.disconnect();
        geminiSourceRef.current = null;
      }
      if (geminiInputContextRef.current) {
        geminiInputContextRef.current.close().catch(() => undefined);
        geminiInputContextRef.current = null;
      }
    };
  }, []);

  const startGeminiInput = async () => {
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    geminiInputContextRef.current = inputCtx;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    geminiStreamRef.current = stream;
    const source = inputCtx.createMediaStreamSource(stream);
    geminiSourceRef.current = source;
    const processor = inputCtx.createScriptProcessor(4096, 1, 1);
    geminiProcessorRef.current = processor;

    processor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      const int16 = new Int16Array(input.length);
      for (let i = 0; i < input.length; i++) {
        int16[i] = Math.max(-1, Math.min(1, input[i])) * 32768;
      }
      sendAudio(int16.buffer);
    };

    source.connect(processor);
    processor.connect(inputCtx.destination);
  };

  const stopGeminiInput = () => {
    if (geminiStreamRef.current) {
      geminiStreamRef.current.getTracks().forEach((track) => track.stop());
      geminiStreamRef.current = null;
    }
    if (geminiProcessorRef.current) {
      geminiProcessorRef.current.disconnect();
      geminiProcessorRef.current = null;
    }
    if (geminiSourceRef.current) {
      geminiSourceRef.current.disconnect();
      geminiSourceRef.current = null;
    }
    if (geminiInputContextRef.current) {
      geminiInputContextRef.current.close().catch(() => undefined);
      geminiInputContextRef.current = null;
    }
  };

  const handleStartSession = async () => {
    try {
      setError(null);
      const baseConfig = {
        provider,
        settings: {
          persona,
          ...(provider === 'webspeech' && {
            aiProvider,
            aiModel,
          }),
        },
      };

      // For Web Speech API, use browser-native implementation
      if (provider === 'webspeech') {
        const client = webSpeechClientRef.current;
        if (!client || !client.isSupported()) {
          throw new Error('Web Speech API not supported in this browser. Try Chrome, Edge, or Safari.');
        }

        // Set up transcript callback to update UI and send to server
        client.onTranscript((text, isFinal) => {
          if (!text || !text.trim()) {
            return;
          }

          // Update local UI
          addTranscript('user', text, isFinal);

          // Send to server for AI processing
          voiceSession.sendTranscript(text, isFinal);
        });

        client.onError((errorMessage) => {
          if (errorMessage === 'network') {
            setError('Web Speech API network error. Try Chrome/Edge, check connectivity, or disable VPN/proxy.');
          } else {
            setError(`Web Speech API error: ${errorMessage}`);
          }
        });

        await client.start();
        setIsRecording(true);
        startSession(provider, baseConfig); // Notify server
        return;
      }

      if (provider === 'gemini') {
        startSession(provider, {
          ...baseConfig,
          settings: { ...baseConfig.settings, voiceId: geminiVoice },
        });
        await startGeminiInput();
        setIsRecording(true);
        return;
      }

      // For OpenAI/ElevenLabs, use MediaRecorder streaming
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start voice session
      startSession(provider, baseConfig);

      // Set up audio recording
      const recorderOptions: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        recorderOptions.mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        recorderOptions.mimeType = 'audio/webm';
      }

      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);

          // Convert to ArrayBuffer and send
          event.data.arrayBuffer().then((buffer) => {
            sendAudio(buffer);
          });
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
      };

      const chunkMs = provider === 'openai-whisper' ? 2000 : 100;
      // Start recording in chunks
      mediaRecorder.start(chunkMs);
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting voice session:', err);
      setError(err instanceof Error ? err.message : 'Failed to access microphone');
    }
  };

  const handleStopSession = () => {
    if (provider === 'webspeech' && webSpeechClientRef.current) {
      webSpeechClientRef.current.stop();
      setIsRecording(false);
    } else if (provider === 'gemini') {
      stopGeminiInput();
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    stopSession();
    setIsRecording(false);
  };

  const handleInterrupt = () => {
    if (provider === 'webspeech' && webSpeechClientRef.current) {
      webSpeechClientRef.current.interrupt();
    }
    interrupt();
  };

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4">
        {!isActive ? (
          <button
            onClick={handleStartSession}
            className="flex items-center space-x-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
          >
            <Mic className="h-5 w-5" />
            <span>Start Voice Session</span>
          </button>
        ) : (
          <>
            <button
              onClick={handleStopSession}
              className="flex items-center space-x-2 rounded-lg bg-destructive px-6 py-3 text-destructive-foreground hover:bg-destructive/90"
            >
              <StopCircle className="h-5 w-5" />
              <span>Stop</span>
            </button>
            <button
              onClick={handleInterrupt}
              className="flex items-center space-x-2 rounded-lg border border-border bg-card px-6 py-3 hover:bg-accent"
            >
              <MicOff className="h-5 w-5" />
              <span>Interrupt</span>
            </button>
          </>
        )}
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <span>Recording...</span>
        </div>
      )}

      {/* Provider Info */}
      <div className="text-center text-xs text-muted-foreground">
        Using {provider === 'openai' ? 'OpenAI Realtime API' : provider === 'openai-whisper' ? 'OpenAI Whisper' : provider === 'elevenlabs' ? 'ElevenLabs' : provider === 'gemini' ? 'Google Gemini 2.5 Live' : 'Web Speech API'}
      </div>
    </div>
  );
}
