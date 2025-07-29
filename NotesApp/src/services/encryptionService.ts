import CryptoJS from 'react-native-crypto-js';
import { Note, EncryptedNote } from '../types';

class EncryptionService {
  private static readonly ENCRYPTION_KEY = 'notes-app-secret-key-256-bit-secure'; // In production, this should be user-generated or device-specific
  private static readonly ALGORITHM = 'AES';

  /**
   * Encrypts a note using AES-256 encryption
   */
  static encryptNote(note: Note): EncryptedNote {
    try {
      const noteData = JSON.stringify({
        title: note.title,
        content: note.content,
        tags: note.tags,
      });

      const encrypted = CryptoJS.AES.encrypt(noteData, this.ENCRYPTION_KEY).toString();

      return {
        id: note.id,
        encryptedData: encrypted,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt note');
    }
  }

  /**
   * Decrypts an encrypted note back to readable format
   */
  static decryptNote(encryptedNote: EncryptedNote): Note {
    try {
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedNote.encryptedData, this.ENCRYPTION_KEY);
      const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedData) {
        throw new Error('Failed to decrypt note - invalid data');
      }

      const noteData = JSON.parse(decryptedData);

      return {
        id: encryptedNote.id,
        title: noteData.title,
        content: noteData.content,
        tags: noteData.tags,
        createdAt: encryptedNote.createdAt,
        updatedAt: encryptedNote.updatedAt,
      };
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt note');
    }
  }

  /**
   * Generates a secure hash for data integrity verification
   */
  static generateHash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * Verifies data integrity using hash comparison
   */
  static verifyHash(data: string, hash: string): boolean {
    const generatedHash = this.generateHash(data);
    return generatedHash === hash;
  }
}

export default EncryptionService;