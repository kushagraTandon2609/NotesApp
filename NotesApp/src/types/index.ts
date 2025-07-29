export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface EncryptedNote {
  id: string;
  encryptedData: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockchainNote {
  id: string;
  hash: string;
  previousHash: string;
  timestamp: number;
  data: EncryptedNote;
  nonce: number;
}

export interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
}

export type RootStackParamList = {
  NotesList: undefined;
  CreateNote: undefined;
  EditNote: { noteId: string };
  ViewNote: { noteId: string };
};