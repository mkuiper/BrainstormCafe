import {
  AIProvider,
  AIModel,
  AIMessage,
  PersonaSettings,
  AICompletionRequest,
} from '@brainstorm-cafe/shared';
import { AIProviderFactory } from './AIProviderFactory';
import { transcriptService } from '../voice/TranscriptService';

export class AIService {
  async generateResponse(
    sessionId: string,
    provider: AIProvider = 'openai',
    model: AIModel = 'gpt-4o',
    persona?: PersonaSettings
  ): Promise<string> {
    // Get or create adapter
    let adapter = AIProviderFactory.getAdapter(sessionId);
    if (!adapter) {
      adapter = AIProviderFactory.createAdapter(provider);
      AIProviderFactory.setAdapter(sessionId, adapter);
    }

    // Get conversation history
    const history = await transcriptService.getRecentTranscripts(sessionId, 10);
    const messages: AIMessage[] = history.map(entry => ({
      role: entry.speaker === 'user' ? 'user' : 'assistant',
      content: entry.text,
    }));

    // Build system prompt with persona
    const personaLine = persona
      ? `Tone: ${persona.tone}. Depth: ${persona.depth}. Mode: ${persona.mode}.`
      : 'Tone: balanced. Depth: standard. Mode: hybrid.';

    messages.unshift({
      role: 'system',
      content: `You are a helpful AI assistant in a brainstorming session called BrainStorm Cafe. Be concise, creative, and conversational. Your responses will be spoken aloud, so keep them natural and brief. ${personaLine}`,
    });

    // Generate response
    const request: AICompletionRequest = {
      model,
      messages,
      maxTokens: 150,
      temperature: 0.7,
    };

    const response = await adapter.complete(request);
    return response.content || 'I am sorry, I could not generate a response.';
  }

  async cleanup(sessionId: string): Promise<void> {
    AIProviderFactory.removeAdapter(sessionId);
  }
}

export const aiService = new AIService();
