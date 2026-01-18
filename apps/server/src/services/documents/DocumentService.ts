import { prisma } from '../../db/client';
import { Document, DocumentCreateRequest, DocumentUpdateRequest } from '@brainstorm-cafe/shared';

export class DocumentService {
  async create(sessionId: string, request: DocumentCreateRequest): Promise<Document> {
    const document = await prisma.document.create({
      data: {
        sessionId,
        title: request.title,
        content: request.content || this.getTemplateContent(request.template, request.type),
        type: request.type,
      },
    });

    // Create initial version
    await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        version: 1,
        content: document.content,
        trigger: 'manual',
        metadata: {
          description: 'Initial version',
        },
      },
    });

    return this.mapToDocument(document);
  }

  async findById(id: string): Promise<Document | null> {
    const document = await prisma.document.findUnique({
      where: { id },
    });

    return document ? this.mapToDocument(document) : null;
  }

  async findBySessionId(sessionId: string): Promise<Document[]> {
    const documents = await prisma.document.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    return documents.map(this.mapToDocument);
  }

  async update(id: string, request: DocumentUpdateRequest): Promise<Document | null> {
    const document = await prisma.document.update({
      where: { id },
      data: {
        title: request.title,
        content: request.content,
      },
    });

    return this.mapToDocument(document);
  }

  async delete(id: string): Promise<void> {
    await prisma.document.delete({
      where: { id },
    });
  }

  private getTemplateContent(template: string | undefined, type: string): string {
    if (template) return template;

    const templates: Record<string, string> = {
      prd: `# Product Requirements Document

## Overview
[Brief description of the product or feature]

## Goals
- Goal 1
- Goal 2

## User Stories
- As a [user type], I want to [action] so that [benefit]

## Requirements

### Functional Requirements
1. Requirement 1
2. Requirement 2

### Non-Functional Requirements
1. Performance requirements
2. Security requirements

## Timeline
[Project timeline]

## Success Metrics
- Metric 1
- Metric 2
`,
      spec: `# Technical Specification

## Overview
[Brief technical overview]

## Architecture
[Architecture description]

## Components

### Component 1
- Description
- Implementation details

### Component 2
- Description
- Implementation details

## API Design
[API endpoints and contracts]

## Data Models
[Database schema and data structures]

## Security Considerations
[Security requirements and implementation]

## Testing Strategy
[Testing approach]
`,
      ideas: `# Ideas & Brainstorming

## Main Idea
[Core concept]

## Key Points
- Point 1
- Point 2
- Point 3

## Questions
- Question 1?
- Question 2?

## Next Steps
- [ ] Action item 1
- [ ] Action item 2
`,
      custom: '# New Document\n\nStart writing here...\n',
    };

    return templates[type] || templates.custom;
  }

  private mapToDocument(doc: any): Document {
    return {
      id: doc.id,
      sessionId: doc.sessionId,
      title: doc.title,
      content: doc.content,
      type: doc.type,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

export const documentService = new DocumentService();
