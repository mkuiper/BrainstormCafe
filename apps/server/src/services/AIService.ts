import OpenAI from 'openai';
import { PersonaSettings } from '@brainstorm-cafe/shared';
import { transcriptService } from './voice/TranscriptService';

export class AIService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async generateResponse(sessionId: string, persona?: PersonaSettings): Promise<string> {
    // Get recent transcripts for context
    const history = await transcriptService.getRecentTranscripts(sessionId, 10);
    
    const messages = history.map(entry => ({
      role: entry.speaker === 'user' ? 'user' as const : 'assistant' as const,
      content: entry.text,
    }));

    const personaLine = persona
      ? `Tone: ${persona.tone}. Depth: ${persona.depth}. Mode: ${persona.mode}.`
      : 'Tone: balanced. Depth: standard. Mode: hybrid.';

    // Add system message
    messages.unshift({
      role: 'system',
      content: `You are a helpful AI assistant in a brainstorming session called BrainStorm Cafe. Be concise, creative, and conversational. Your responses will be spoken aloud, so keep them natural and brief. ${personaLine}`,
    });

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 150,
    });

    return response.choices[0].message.content || 'I am sorry, I could not generate a response.';
  }
}

export const aiService = new AIService();
