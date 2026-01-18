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
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;

        if (this.onTranscriptCallback) {
          this.onTranscriptCallback(transcript, isFinal);
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    this.recognition.onend = () => {
      // Restart if still supposed to be listening
      if (this.isListening) {
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

      try {
        this.isListening = true;
        this.recognition.start();
        resolve();
      } catch (error) {
        reject(error);
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
