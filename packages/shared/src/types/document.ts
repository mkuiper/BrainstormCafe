export type DocumentType = 'prd' | 'spec' | 'ideas' | 'custom';

export type VersionTrigger = 'auto' | 'manual' | 'milestone';

export interface Document {
  id: string;
  sessionId: string;
  title: string;
  content: string;
  type: DocumentType;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  content: string;
  createdAt: Date;
  trigger: VersionTrigger;
  metadata?: VersionMetadata;
}

export interface VersionMetadata {
  agentId?: string;
  context?: string;
  description?: string;
}

export interface DocumentCreateRequest {
  title: string;
  type: DocumentType;
  template?: string;
  content?: string;
}

export interface DocumentUpdateRequest {
  title?: string;
  content?: string;
}

export interface DocumentPatch {
  documentId: string;
  patch: string;
  version?: number;
}

export interface DocumentDiff {
  versionA: number;
  versionB: number;
  diff: string;
  additions: number;
  deletions: number;
}
