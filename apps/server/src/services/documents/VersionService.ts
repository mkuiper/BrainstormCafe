import { prisma } from '../../db/client';
import { DocumentVersion, VersionMetadata, VersionTrigger } from '@brainstorm-cafe/shared';

export class VersionService {
  async createVersion(
    documentId: string,
    content: string,
    trigger: VersionTrigger,
    metadata?: VersionMetadata
  ): Promise<DocumentVersion> {
    // Get the latest version number
    const latestVersion = await prisma.documentVersion.findFirst({
      where: { documentId },
      orderBy: { version: 'desc' },
    });

    const nextVersion = (latestVersion?.version || 0) + 1;

    const version = await prisma.documentVersion.create({
      data: {
        documentId,
        version: nextVersion,
        content,
        trigger,
        metadata: metadata as any || {},
      },
    });

    return this.mapToVersion(version);
  }

  async getVersions(documentId: string): Promise<DocumentVersion[]> {
    const versions = await prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { version: 'asc' },
    });

    return versions.map(this.mapToVersion);
  }

  async getVersion(documentId: string, versionNumber: number): Promise<DocumentVersion | null> {
    const version = await prisma.documentVersion.findUnique({
      where: {
        documentId_version: {
          documentId,
          version: versionNumber,
        },
      },
    });

    return version ? this.mapToVersion(version) : null;
  }

  async getLatestVersion(documentId: string): Promise<DocumentVersion | null> {
    const version = await prisma.documentVersion.findFirst({
      where: { documentId },
      orderBy: { version: 'desc' },
    });

    return version ? this.mapToVersion(version) : null;
  }

  async shouldCreateAutoVersion(documentId: string, currentContent: string): Promise<boolean> {
    const latestVersion = await this.getLatestVersion(documentId);

    if (!latestVersion) return true;

    // Create auto version if:
    // 1. Content has changed significantly (more than 100 chars difference)
    // 2. More than 5 minutes have passed since last version
    const contentDiff = Math.abs(currentContent.length - latestVersion.content.length);
    const timeDiff = Date.now() - new Date(latestVersion.createdAt).getTime();
    const fiveMinutes = 5 * 60 * 1000;

    return contentDiff > 100 || timeDiff > fiveMinutes;
  }

  private mapToVersion(version: any): DocumentVersion {
    return {
      id: version.id,
      documentId: version.documentId,
      version: version.version,
      content: version.content,
      createdAt: version.createdAt,
      trigger: version.trigger,
      metadata: version.metadata as VersionMetadata | undefined,
    };
  }
}

export const versionService = new VersionService();
