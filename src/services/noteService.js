export const API_ROOT = import.meta.env.VITE_API_URL || 'https://backend-irshad21.vercel.app';

const NOTES_API = `${API_ROOT.replace(/\/$/, '')}/api/notes`;

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('studyspace_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Fetch all notes for the logged-in user from MongoDB
 */
export const fetchNotesAPI = async () => {
  const response = await fetch(NOTES_API, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch notes from server');
  }

  const data = await response.json();
  return data.notes || [];
};

/**
 * Create a new note in MongoDB
 */
export const createNoteAPI = async (noteData) => {
  const response = await fetch(NOTES_API, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({
      title: noteData.title || 'Untitled Note',
      content: noteData.content || '',
      items: Array.isArray(noteData.items) ? noteData.items : [],
      category: noteData.category || 'General',
      color: noteData.color || 'indigo',
      isPinned: !!noteData.isPinned
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create note on server');
  }

  const data = await response.json();
  return data.note;
};

/**
 * Update a note in MongoDB
 */
export const updateNoteAPI = async (noteId, updatedFields) => {
  const response = await fetch(`${NOTES_API}/${noteId}`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(updatedFields)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update note on server');
  }

  const data = await response.json();
  return data.note;
};

/**
 * Delete a note in MongoDB
 */
export const deleteNoteAPI = async (noteId) => {
  const response = await fetch(`${NOTES_API}/${noteId}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete note on server');
  }

  const data = await response.json();
  return data;
};

/**
 * Bulk sync local notes to MongoDB
 */
export const syncNotesAPI = async (notes) => {
  const response = await fetch(`${NOTES_API}/sync`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({ notes })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to sync notes with server');
  }

  const data = await response.json();
  return data.notes || [];
};
