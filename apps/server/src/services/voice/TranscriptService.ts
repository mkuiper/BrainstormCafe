import { prisma } from '../../db/client';
import { TranscriptEntry } from '@brainstorm-cafe/shared';

export class TranscriptService {
  async createEntry(
    sessionId: string,
    speaker: 'user' | 'agent',
    text: string,
    isFinal: boolean
  ): Promise<TranscriptEntry> {
    const entry = await prisma.transcript.create({
      data: {
        sessionId,
        speaker,
        text,
        isFinal,
      },
    });

    return this.mapToEntry(entry);
  }

  async getTranscripts(sessionId: string): Promise<TranscriptEntry[]> {
    const transcripts = await prisma.transcript.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
    });

    return transcripts.map(this.mapToEntry);
  }

  async getFinalTranscripts(sessionId: string): Promise<TranscriptEntry[]> {
    const transcripts = await prisma.transcript.findMany({
      where: {
        sessionId,
        isFinal: true,
      },
      orderBy: { timestamp: 'asc' },
    });

    return transcripts.map(this.mapToEntry);
  }

  async getRecentTranscripts(sessionId: string, limit: number = 50): Promise<TranscriptEntry[]> {
    const transcripts = await prisma.transcript.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    // Return in chronological order
    return transcripts.reverse().map(this.mapToEntry);
  }

  async deleteNonFinalTranscripts(sessionId: string): Promise<void> {
    await prisma.transcript.deleteMany({
      where: {
        sessionId,
        isFinal: false,
      },
    });
  }

  private mapToEntry(transcript: any): TranscriptEntry {
    return {
      id: transcript.id,
      sessionId: transcript.sessionId,
      speaker: transcript.speaker,
      text: transcript.text,
      isFinal: transcript.isFinal,
      timestamp: transcript.timestamp,
    };
  }
}

export const transcriptService = new TranscriptService();
