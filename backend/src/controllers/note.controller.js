import mongoose from 'mongoose';
import Note from '../models/note.model.js';

/**
 * Get all notes for the authenticated user
 * GET /api/notes
 */
export const getNotes = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;
    const notes = await Note.find({ user: userId }).sort({ isPinned: -1, updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new note
 * POST /api/notes
 */
export const createNote = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;
    const { title, content, items, category, color, isPinned } = req.body;

    const noteTitle = title && title.trim() ? title.trim() : 'Untitled Note';

    const note = await Note.create({
      user: userId,
      title: noteTitle,
      content: content || '',
      items: Array.isArray(items) ? items : [],
      category: category ? category.trim() : 'General',
      color: color || 'indigo',
      isPinned: !!isPinned
    });

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing note
 * PUT /api/notes/:id
 */
export const updateNote = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;
    const { id } = req.params;
    const { title, content, items, category, color, isPinned } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID format'
      });
    }

    const note = await Note.findOne({ _id: id, user: userId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or unauthorized'
      });
    }

    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content;
    if (items !== undefined && Array.isArray(items)) {
      note.items = items;
      note.markModified('items');
    }
    if (category !== undefined) note.category = category.trim();
    if (color !== undefined) note.color = color;
    if (isPinned !== undefined) note.isPinned = !!isPinned;

    await note.save();

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a note
 * DELETE /api/notes/:id
 */
export const deleteNote = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID format'
      });
    }

    const note = await Note.findOneAndDelete({ _id: id, user: userId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
      id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk sync notes from local storage to cloud database
 * POST /api/notes/sync
 */
export const bulkSyncNotes = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;
    const { notes } = req.body;

    if (!Array.isArray(notes) || notes.length === 0) {
      const currentNotes = await Note.find({ user: userId }).sort({ isPinned: -1, updatedAt: -1 });
      return res.status(200).json({
        success: true,
        notes: currentNotes
      });
    }

    // Get existing notes to avoid duplicate titles
    const existingNotes = await Note.find({ user: userId });
    const existingTitles = new Set(existingNotes.map(n => n.title.trim().toLowerCase()));

    const notesToInsert = [];
    for (const n of notes) {
      const titleKey = (n.title || 'Untitled Note').trim().toLowerCase();
      if (!existingTitles.has(titleKey)) {
        notesToInsert.push({
          user: userId,
          title: n.title ? n.title.trim() : 'Untitled Note',
          content: n.content || '',
          items: Array.isArray(n.items) ? n.items : [],
          category: n.category || 'General',
          color: n.color || 'indigo',
          isPinned: !!n.isPinned
        });
        existingTitles.add(titleKey);
      }
    }

    if (notesToInsert.length > 0) {
      await Note.insertMany(notesToInsert);
    }

    const allNotes = await Note.find({ user: userId }).sort({ isPinned: -1, updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: allNotes.length,
      notes: allNotes
    });
  } catch (error) {
    next(error);
  }
};
