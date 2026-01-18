import { Socket } from 'socket.io';
import { ClientEvent, ServerEvent } from '@brainstorm-cafe/shared';
import { documentService } from '../../services/documents/DocumentService';
import { versionService } from '../../services/documents/VersionService';
import { diffService } from '../../services/documents/DiffService';

// Store active sessions (in production, use Redis)
const activeSessions = new Map<string, string>(); // socketId -> sessionId

export function setSocketSession(socketId: string, sessionId: string) {
  activeSessions.set(socketId, sessionId);
}

export function getSocketSession(socketId: string): string {
  // For now, return a default session or create one
  const existing = activeSessions.get(socketId);
  if (existing) return existing;

  // Create a default session ID (in production, this would be managed properly)
  const sessionId = `session_${socketId}`;
  activeSessions.set(socketId, sessionId);
  return sessionId;
}

export async function handleDocumentCreate(
  socket: Socket,
  event: Extract<ClientEvent, { type: 'document.create' }>
) {
  try {
    const sessionId = getSocketSession(socket.id);

    const document = await documentService.create(sessionId, {
      title: event.payload.title,
      type: event.payload.type as any,
      template: event.payload.template,
    });

    const response: ServerEvent = {
      type: 'document.created',
      payload: { document },
    };

    socket.emit('message', response);
    console.log(`Document created: ${document.id}`);
  } catch (error) {
    console.error('Error creating document:', error);
    const response: ServerEvent = {
      type: 'error',
      payload: { message: 'Failed to create document' },
    };
    socket.emit('message', response);
  }
}

export async function handleDocumentUpdate(
  socket: Socket,
  event: Extract<ClientEvent, { type: 'document.update' }>
) {
  try {
    const { documentId, content } = event.payload;

    // Update the document
    const document = await documentService.update(documentId, { content });

    if (!document) {
      throw new Error('Document not found');
    }

    // Check if we should create an auto-version
    const shouldVersion = await versionService.shouldCreateAutoVersion(documentId, content);
    if (shouldVersion) {
      await versionService.createVersion(documentId, content, 'auto', {
        description: 'Auto-saved version',
      });
    }

    // Send snapshot to client
    const response: ServerEvent = {
      type: 'document.snapshot',
      payload: { document },
    };

    socket.emit('message', response);

    // Broadcast patch to other clients in the same session
    // (In production, you'd use rooms for this)
    socket.broadcast.emit('message', {
      type: 'document.patch',
      payload: {
        documentId,
        patch: content, // In production, send actual diff patch
      },
    } as ServerEvent);

    console.log(`Document updated: ${documentId}`);
  } catch (error) {
    console.error('Error updating document:', error);
    const response: ServerEvent = {
      type: 'error',
      payload: { message: 'Failed to update document' },
    };
    socket.emit('message', response);
  }
}

export async function handleDocumentVersionCreate(
  socket: Socket,
  event: Extract<ClientEvent, { type: 'document.version.create' }>
) {
  try {
    const { documentId, trigger } = event.payload;

    // Get current document content
    const document = await documentService.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Create version
    await versionService.createVersion(
      documentId,
      document.content,
      trigger as any,
      {
        description: `Manual snapshot created`,
      }
    );

    console.log(`Version created for document: ${documentId}`);

    // Optionally send confirmation back to client
    const response: ServerEvent = {
      type: 'document.snapshot',
      payload: { document },
    };
    socket.emit('message', response);
  } catch (error) {
    console.error('Error creating version:', error);
    const response: ServerEvent = {
      type: 'error',
      payload: { message: 'Failed to create version' },
    };
    socket.emit('message', response);
  }
}
