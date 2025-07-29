import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note, EncryptedNote } from '../types';
import EncryptionService from './encryptionService';

class StorageService {
  private static readonly NOTES_KEY = '@NotesApp:notes';
  private static readonly ENCRYPTED_NOTES_KEY = '@NotesApp:encrypted_notes';

  /**
   * Save notes to local storage with encryption
   */
  static async saveNotes(notes: Note[]): Promise<void> {
    try {
      // Encrypt all notes before saving
      const encryptedNotes: EncryptedNote[] = notes.map(note => 
        EncryptionService.encryptNote(note)
      );

      await AsyncStorage.setItem(
        this.ENCRYPTED_NOTES_KEY,
        JSON.stringify(encryptedNotes)
      );
    } catch (error) {
      console.error('Failed to save notes:', error);
      throw new Error('Failed to save notes to storage');
    }
  }

  /**
   * Load and decrypt notes from local storage
   */
  static async loadNotes(): Promise<Note[]> {
    try {
      const encryptedData = await AsyncStorage.getItem(this.ENCRYPTED_NOTES_KEY);
      
      if (!encryptedData) {
        return [];
      }

      const encryptedNotes: EncryptedNote[] = JSON.parse(encryptedData);
      
      // Decrypt all notes
      const notes: Note[] = encryptedNotes.map(encryptedNote => {
        const decryptedNote = EncryptionService.decryptNote(encryptedNote);
        
        // Convert date strings back to Date objects
        return {
          ...decryptedNote,
          createdAt: new Date(decryptedNote.createdAt),
          updatedAt: new Date(decryptedNote.updatedAt),
        };
      });

      return notes;
    } catch (error) {
      console.error('Failed to load notes:', error);
      throw new Error('Failed to load notes from storage');
    }
  }

  /**
   * Save a single note
   */
  static async saveNote(note: Note): Promise<void> {
    try {
      const existingNotes = await this.loadNotes();
      const noteIndex = existingNotes.findIndex(n => n.id === note.id);

      if (noteIndex >= 0) {
        existingNotes[noteIndex] = note;
      } else {
        existingNotes.push(note);
      }

      await this.saveNotes(existingNotes);
    } catch (error) {
      console.error('Failed to save note:', error);
      throw new Error('Failed to save note');
    }
  }

  /**
   * Delete a note by ID
   */
  static async deleteNote(noteId: string): Promise<void> {
    try {
      const existingNotes = await this.loadNotes();
      const filteredNotes = existingNotes.filter(note => note.id !== noteId);
      await this.saveNotes(filteredNotes);
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw new Error('Failed to delete note');
    }
  }

  /**
   * Get a specific note by ID
   */
  static async getNote(noteId: string): Promise<Note | null> {
    try {
      const notes = await this.loadNotes();
      return notes.find(note => note.id === noteId) || null;
    } catch (error) {
      console.error('Failed to get note:', error);
      throw new Error('Failed to get note');
    }
  }

  /**
   * Clear all notes from storage
   */
  static async clearAllNotes(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.ENCRYPTED_NOTES_KEY);
    } catch (error) {
      console.error('Failed to clear notes:', error);
      throw new Error('Failed to clear notes');
    }
  }
}

export default StorageService;