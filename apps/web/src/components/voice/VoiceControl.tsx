'use client';

import { Mic, MicOff, StopCircle, AlertCircle } from 'lucide-react';
import { useVoiceSession } from '@/hooks/useVoiceSession';
import { VoiceProvider } from '@brainstorm-cafe/shared';
import { useState, useEffect, useRef } from 'react';
import { WebSpeechClient } from '@/lib/webSpeechClient';

interface VoiceControlProps {
  provider: VoiceProvider;
}

export default function VoiceControl({ provider }: VoiceControlProps) {
  const { isActive, startSession, stopSession, interrupt, sendAudio } = useVoiceSession();
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const webSpeechClientRef = useRef<WebSpeechClient | null>(null);

  useEffect(() => {
    // Initialize Web Speech client for browser
    if (typeof window !== 'undefined') {
      webSpeechClientRef.current = new WebSpeechClient();
    }

    // Cleanup on unmount
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (webSpeechClientRef.current) {
        webSpeechClientRef.current.stop();
      }
    };
  }, []);

  const handleStartSession = async () => {
    try {
      setError(null);

      // For Web Speech API, use browser-native implementation
      if (provider === 'webspeech') {
        const client = webSpeechClientRef.current;
        if (!client || !client.isSupported()) {
          throw new Error('Web Speech API not supported in this browser. Try Chrome, Edge, or Safari.');
        }

        // Set up transcript callback to send via WebSocket
        client.onTranscript((text, isFinal) => {
          console.log(`[VoiceControl] Transcript (${isFinal ? 'final' : 'interim'}):`, text);

          // Send transcript to server via WebSocket so it broadcasts back
          // This allows it to be stored and displayed
          if (text && text.trim()) {
            // Create a custom event to send transcript
            console.log('[VoiceControl] Dispatching webspeech-transcript event');
            const transcriptEvent = new CustomEvent('webspeech-transcript', {
              detail: { text, isFinal, speaker: 'user' }
            });
            window.dispatchEvent(transcriptEvent);
            console.log('[VoiceControl] Event dispatched');
          } else {
            console.log('[VoiceControl] Skipping empty transcript');
          }
        });

        await client.start();
        setIsRecording(true);
        startSession(provider); // Notify server
        return;
      }

      // For OpenAI/ElevenLabs, use microphone streaming
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start voice session
      startSession(provider);

      // Set up audio recording
      const mediaRecorder = new MediaRecorder(stream);
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

      // Start recording in chunks (100ms)
      mediaRecorder.start(100);
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
        Using {provider === 'openai' ? 'OpenAI Realtime API' : provider === 'elevenlabs' ? 'ElevenLabs' : 'Web Speech API'}
      </div>
    </div>
  );
}
