/**
 * Web Speech API Client - Browser-native speech recognition and synthesis
 * Runs entirely in the browser, no server connection needed
 */

export class WebSpeechClient {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private onTranscriptCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private isListening = false;

  constructor() {
    // Check if Web Speech API is available
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      }
      this.synthesis = window.speechSynthesis;
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      console.log('[WebSpeechClient] onresult fired, results:', event.results.length);
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;
        console.log('[WebSpeechClient] Transcript:', transcript, 'isFinal:', isFinal);

        if (this.onTranscriptCallback) {
          console.log('[WebSpeechClient] Calling transcript callback');
          this.onTranscriptCallback(transcript, isFinal);
        } else {
          console.warn('[WebSpeechClient] No transcript callback set!');
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('[WebSpeechClient] Speech recognition error:', event.error);
    };

    this.recognition.onend = () => {
      console.log('[WebSpeechClient] Recognition ended, isListening:', this.isListening);
      // Restart if still supposed to be listening
      if (this.isListening) {
        console.log('[WebSpeechClient] Restarting recognition...');
        this.recognition.start();
      }
    };
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Web Speech API not supported in this browser'));
        return;
      }

      // Don't start if already listening
      if (this.isListening) {
        resolve();
        return;
      }

      try {
        this.isListening = true;
        console.log('[WebSpeechClient] Starting recognition...');
        this.recognition.start();
        console.log('[WebSpeechClient] Recognition started successfully');
        resolve();
      } catch (error) {
        console.error('[WebSpeechClient] Error starting recognition:', error);
        // If already started, just resolve
        if ((error as any).message?.includes('already started')) {
          console.log('[WebSpeechClient] Recognition already started, continuing...');
          resolve();
        } else {
          reject(error);
        }
      }
    });
  }

  stop() {
    if (this.recognition) {
      this.isListening = false;
      this.recognition.stop();
    }
  }

  onTranscript(callback: (text: string, isFinal: boolean) => void) {
    this.onTranscriptCallback = callback;
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      this.synthesis.speak(utterance);
    });
  }

  interrupt() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  isSupported(): boolean {
    return this.recognition !== null && this.synthesis !== null;
  }
}
