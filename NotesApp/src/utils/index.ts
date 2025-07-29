import { v4 as uuidv4 } from 'uuid';
import { Note } from '../types';

/**
 * Generates a unique ID for notes
 */
export const generateId = (): string => {
  return uuidv4();
};

/**
 * Formats a date to a readable string
 */
export const formatDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * Validates note data
 */
export const validateNote = (title: string, content: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!title.trim()) {
    errors.push('Title is required');
  } else if (title.trim().length > 100) {
    errors.push('Title must be less than 100 characters');
  }

  if (!content.trim()) {
    errors.push('Content is required');
  } else if (content.trim().length > 10000) {
    errors.push('Content must be less than 10,000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Creates a new note object
 */
export const createNote = (title: string, content: string, tags?: string[]): Note => {
  const now = new Date();
  return {
    id: generateId(),
    title: title.trim(),
    content: content.trim(),
    tags: tags || [],
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Updates an existing note
 */
export const updateNote = (existingNote: Note, title: string, content: string, tags?: string[]): Note => {
  return {
    ...existingNote,
    title: title.trim(),
    content: content.trim(),
    tags: tags || existingNote.tags,
    updatedAt: new Date(),
  };
};

/**
 * Truncates text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

/**
 * Searches notes by title or content
 */
export const searchNotes = (notes: Note[], searchTerm: string): Note[] => {
  if (!searchTerm.trim()) {
    return notes;
  }

  const term = searchTerm.toLowerCase();
  return notes.filter(note => 
    note.title.toLowerCase().includes(term) || 
    note.content.toLowerCase().includes(term) ||
    (note.tags && note.tags.some(tag => tag.toLowerCase().includes(term)))
  );
};

/**
 * Sorts notes by various criteria
 */
export const sortNotes = (notes: Note[], sortBy: 'title' | 'createdAt' | 'updatedAt', ascending: boolean = false): Note[] => {
  return [...notes].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'createdAt':
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      case 'updatedAt':
        comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
        break;
    }

    return ascending ? comparison : -comparison;
  });
};

/**
 * Gets unique tags from all notes
 */
export const getAllTags = (notes: Note[]): string[] => {
  const tagSet = new Set<string>();
  notes.forEach(note => {
    if (note.tags) {
      note.tags.forEach(tag => tagSet.add(tag));
    }
  });
  return Array.from(tagSet).sort();
};

/**
 * Filters notes by tag
 */
export const filterNotesByTag = (notes: Note[], tag: string): Note[] => {
  return notes.filter(note => note.tags && note.tags.includes(tag));
};