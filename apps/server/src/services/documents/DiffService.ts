import * as Diff from 'diff';
import { DocumentDiff } from '@brainstorm-cafe/shared';
import { versionService } from './VersionService';

export class DiffService {
  async generateDiff(
    documentId: string,
    versionA: number,
    versionB: number
  ): Promise<DocumentDiff | null> {
    const [vA, vB] = await Promise.all([
      versionService.getVersion(documentId, versionA),
      versionService.getVersion(documentId, versionB),
    ]);

    if (!vA || !vB) return null;

    const changes = Diff.diffLines(vA.content, vB.content);

    let additions = 0;
    let deletions = 0;
    let diffText = '';

    changes.forEach((part) => {
      const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
      const lines = part.value.split('\n').filter(line => line.length > 0);

      lines.forEach(line => {
        diffText += prefix + line + '\n';
      });

      if (part.added) {
        additions += lines.length;
      } else if (part.removed) {
        deletions += lines.length;
      }
    });

    return {
      versionA,
      versionB,
      diff: diffText,
      additions,
      deletions,
    };
  }

  generatePatch(oldContent: string, newContent: string): string {
    const patch = Diff.createPatch('document', oldContent, newContent);
    return patch;
  }

  applyPatch(content: string, patch: string): string | null {
    try {
      const result = Diff.applyPatch(content, patch);
      return typeof result === 'string' ? result : null;
    } catch (error) {
      console.error('Failed to apply patch:', error);
      return null;
    }
  }
}

export const diffService = new DiffService();
