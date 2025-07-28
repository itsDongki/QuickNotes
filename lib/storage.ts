export interface MediaItem {
  id: string;
  type: 'image' | 'gif' | 'audio' | 'video' | 'file';
  url: string;
  name: string;
  size: number;
  uploadedAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  media: MediaItem[];
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  deletedAt?: string;
}

type UserNotes = {
  [userId: string]: Note[];
};

const STORAGE_KEY = 'quicknotes';

// Initialize storage if it doesn't exist
const initializeStorage = (): UserNotes => {
  if (typeof window === 'undefined') return {};
  
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const initialData: UserNotes = {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
  
  try {
    return JSON.parse(data) as UserNotes;
  } catch (error) {
    console.error('Error parsing storage data:', error);
    return {};
  }
};

// Get all notes for a specific user
export const getUserNotes = (userId: string): Note[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = initializeStorage();
    return data[userId] || [];
  } catch (error) {
    console.error('Error getting user notes:', error);
    return [];
  }
};

// Save all notes for a specific user
const saveUserNotes = (userId: string, notes: Note[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const data = initializeStorage();
    data[userId] = notes;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user notes:', error);
  }
};

// Add a new note for a specific user
export function addNote(userId: string, note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'deleted' | 'deletedAt' | 'media'> & { media?: MediaItem[] }): Note {
  const notes = getUserNotes(userId);
  const newNote: Note = {
    ...note,
    id: crypto.randomUUID(),
    userId,
    media: note.media || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
  };
  
  notes.push(newNote);
  saveUserNotes(userId, notes);
  return newNote;
};

// Update an existing note
export const updateNote = (userId: string, noteId: string, updates: Partial<Omit<Note, 'id' | 'userId' | 'createdAt'>>): Note | null => {
  const notes = getUserNotes(userId);
  const noteIndex = notes.findIndex(note => note.id === noteId);
  
  if (noteIndex === -1) return null;
  
  const updatedNote = { 
    ...notes[noteIndex], 
    ...updates,
    // Preserve existing media if not being updated
    media: updates.media !== undefined ? updates.media : notes[noteIndex].media,
    updatedAt: new Date().toISOString()
  };
  
  notes[noteIndex] = updatedNote;
  saveUserNotes(userId, notes);
  
  return updatedNote;
};

// Soft delete a note (move to trash)
export function deleteNote(userId: string, noteId: string): boolean {
  const notes = getUserNotes(userId);
  const noteIndex = notes.findIndex(note => note.id === noteId);
  
  if (noteIndex === -1) return false;
  
  // Update note with deleted status and timestamp
  notes[noteIndex] = {
    ...notes[noteIndex],
    deleted: true,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  saveUserNotes(userId, notes);
  return true;
}

// Permanently delete a note
export function permanentlyDeleteNote(userId: string, noteId: string): boolean {
  const notes = getUserNotes(userId);
  const noteIndex = notes.findIndex(note => note.id === noteId);
  
  if (noteIndex === -1) return false;
  
  notes.splice(noteIndex, 1);
  saveUserNotes(userId, notes);
  return true;
}

// Restore a note from trash
export function restoreNote(userId: string, noteId: string): boolean {
  const notes = getUserNotes(userId);
  const noteIndex = notes.findIndex(note => note.id === noteId);
  
  if (noteIndex === -1) return false;
  
  // Remove deleted status and timestamp
  const { deleted, deletedAt, ...note } = notes[noteIndex];
  notes[noteIndex] = {
    ...note,
    updatedAt: new Date().toISOString()
  } as Note;
  
  saveUserNotes(userId, notes);
  return true;
}

// Get all deleted notes (trash)
export function getDeletedNotes(userId: string): Note[] {
  return getUserNotes(userId).filter(note => note.deleted);
};

// Get a single note by ID
export const getNoteById = (userId: string, id: string): Note | null => {
  const notes = getUserNotes(userId);
  const note = notes.find(note => note.id === id);
  
  if (!note) return null;
  
  // Ensure media is always an array
  return {
    ...note,
    media: Array.isArray(note.media) ? note.media : []
  };
};

// Get all notes for a user with search, filter, sort, and pagination
export interface GetNotesOptions {
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'title-asc' | 'title-desc';
  includeDeleted?: boolean;
  page?: number;
  perPage?: number;
}

export interface PaginatedNotes {
  notes: Note[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function getNotes(userId: string, options: GetNotesOptions = {}): PaginatedNotes {
  let notes = getUserNotes(userId);
  
  // Filter out deleted notes by default
  if (!options.includeDeleted) {
    notes = notes.filter(note => !note.deleted);
  }
  
  // Apply search filter
  if (options.search) {
    const searchTerm = options.search.toLowerCase();
    notes = notes.filter(
      note =>
        note.title.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm)
    );
  }
  
  // Apply sorting
  const sortBy = options.sortBy || 'newest';
  switch (sortBy) {
    case 'newest':
      notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      break;
    case 'oldest':
      notes.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
      break;
    case 'title-asc':
      notes.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'title-desc':
      notes.sort((a, b) => b.title.localeCompare(a.title));
      break;
  }
  
  // Apply pagination
  const page = Math.max(1, options.page || 1);
  const perPage = Math.max(1, options.perPage || 6);
  const total = notes.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;
  
  return {
    notes: notes.slice(start, end),
    total,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
};
