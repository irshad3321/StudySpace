import React, { useState, useEffect, useRef } from 'react';
import { 
  NotebookPen, 
  Plus, 
  Search, 
  Trash2, 
  X, 
  Check, 
  Clock, 
  Calendar,
  ArrowRight,
  FileText,
  Copy,
  ExternalLink
} from 'lucide-react';

export default function Notes({ 
  notes = [], 
  onAddNote, 
  onUpdateNote, 
  onDeleteNote 
}) {
  // activeNote is null when user is viewing the list of headings only
  // activeNote is a note object when user clicks on a heading to open it
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving'

  const titleInputRef = useRef(null);
  const contentTextareaRef = useRef(null);

  // Find the currently opened note
  const currentNote = notes.find(n => (n.id || n._id) === activeNoteId);

  // Filter notes by heading (search)
  const filteredNotes = notes.filter(note => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return note.title && note.title.toLowerCase().includes(q);
  });

  // Sort notes: newest first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  // Create a new note and open it immediately for writing
  const handleCreateNote = () => {
    const newNoteData = {
      title: '',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const createdId = onAddNote(newNoteData);
    if (createdId) {
      setActiveNoteId(createdId);
    }

    // Auto focus the heading input
    setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }, 100);
  };

  // Open an existing note to write/edit inside
  const handleOpenNote = (noteId) => {
    setActiveNoteId(noteId);
    setTimeout(() => {
      if (contentTextareaRef.current) {
        contentTextareaRef.current.focus();
      }
    }, 100);
  };

  // Close the opened note and return to seeing only headings
  const handleCloseNote = () => {
    if (currentNote) {
      // If title is empty, set a friendly default
      if (!currentNote.title || !currentNote.title.trim()) {
        const targetId = currentNote.id || currentNote._id;
        onUpdateNote(targetId, { ...currentNote, title: 'Untitled Note' });
      }
    }
    setActiveNoteId(null);
  };

  // Handle updating note heading or content
  const handleFieldChange = (fields) => {
    if (!currentNote) return;
    setSaveStatus('saving');

    const targetId = currentNote.id || currentNote._id;
    const updated = {
      ...currentNote,
      ...fields,
      updatedAt: new Date().toISOString()
    };

    onUpdateNote(targetId, updated);

    setTimeout(() => {
      setSaveStatus('saved');
    }, 350);
  };

  // Copy note content
  const handleCopy = () => {
    if (!currentNote) return;
    const text = `${currentNote.title ? currentNote.title + '\n\n' : ''}${currentNote.content || ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format date helper (e.g. "Oct 22, 2026")
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const wordCount = currentNote?.content ? currentNote.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = currentNote?.content ? currentNote.content.length : 0;

  return (
    <div className="notes-page-wrapper">
      {/* Top Header */}
      <div className="notes-main-header">
        <div className="notes-header-left">
          <div className="notes-icon-box">
            <NotebookPen size={22} />
          </div>
          <div>
            <div className="notes-heading-title-row">
              <h2 className="notes-page-title">My Notes</h2>
              <span className="notes-total-badge">{notes.length}</span>
            </div>
            <p className="notes-page-subtitle">
              Click any note heading to open, read, or write inside it
            </p>
          </div>
        </div>

        <button 
          className="btn-primary notes-create-btn"
          onClick={handleCreateNote}
          id="btn-create-note"
        >
          <Plus size={16} />
          <span>Add Note</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="notes-search-container">
        <Search size={16} className="notes-search-icon" />
        <input 
          type="text"
          className="notes-search-field"
          placeholder="Search by note heading..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            className="notes-clear-search-btn"
            onClick={() => setSearchQuery('')}
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* List of Notes: Showing ONLY THE HEADING */}
      {sortedNotes.length === 0 ? (
        <div className="notes-no-items-card">
          <div className="notes-no-items-icon">
            <NotebookPen size={32} />
          </div>
          <h3>{searchQuery ? 'No matching notes found' : 'No notes added yet'}</h3>
          <p>
            {searchQuery 
              ? `No note heading matches "${searchQuery}".` 
              : 'Add your first note with a heading. You can open and write inside it anytime.'}
          </p>
          <button 
            className="btn-primary" 
            onClick={handleCreateNote}
            style={{ marginTop: '14px' }}
          >
            <Plus size={15} />
            <span>Create a Note</span>
          </button>
        </div>
      ) : (
        <div className="notes-headings-grid">
          {sortedNotes.map((note) => {
            const noteId = note.id || note._id;
            const headingText = note.title && note.title.trim() ? note.title.trim() : 'Untitled Note';
            const createdDate = formatDate(note.createdAt || note.updatedAt);

            return (
              <div 
                key={noteId}
                className="note-heading-card"
                onClick={() => handleOpenNote(noteId)}
                title="Click to open and write inside this note"
              >
                <div className="note-card-inner">
                  <div className="note-card-header-line">
                    <FileText size={16} className="note-card-file-icon" />
                    {createdDate && (
                      <span className="note-card-date">
                        <Calendar size={12} />
                        <span>{createdDate}</span>
                      </span>
                    )}
                  </div>

                  {/* ONLY THE HEADING IS DISPLAYED */}
                  <h3 className="note-only-heading">
                    {headingText}
                  </h3>

                  <div className="note-card-bottom-bar">
                    <span className="note-card-open-prompt">
                      <span>Open note</span>
                      <ArrowRight size={13} className="arrow-icon" />
                    </span>

                    <button 
                      className="note-card-delete-icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(noteId);
                      }}
                      title="Delete this note"
                      aria-label="Delete note"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Focused View: When a note is opened to write and close */}
      {currentNote && (
        <div className="note-modal-overlay" onClick={handleCloseNote}>
          <div 
            className="note-modal-dialog" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="note-modal-header">
              <div className="note-modal-title-box">
                <input
                  ref={titleInputRef}
                  type="text"
                  className="note-modal-heading-input"
                  placeholder="Note Heading..."
                  value={currentNote.title || ''}
                  onChange={(e) => handleFieldChange({ title: e.target.value })}
                  id="note-heading-input"
                />
              </div>

              <div className="note-modal-actions">
                <div className={`note-save-status ${saveStatus}`}>
                  <Check size={13} />
                  <span>{saveStatus === 'saving' ? 'Saving...' : 'Saved'}</span>
                </div>

                <button 
                  className="note-modal-action-btn"
                  onClick={handleCopy}
                  title="Copy note"
                >
                  {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button 
                  className="note-modal-action-btn delete"
                  onClick={() => {
                    const targetId = currentNote.id || currentNote._id;
                    onDeleteNote(targetId);
                    handleCloseNote();
                  }}
                  title="Delete note"
                >
                  <Trash2 size={15} />
                </button>

                {/* Main Close Button */}
                <button 
                  className="note-modal-close-icon-btn"
                  onClick={handleCloseNote}
                  title="Close note"
                  aria-label="Close note"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Note Writing Area: Write anything inside anytime */}
            <div className="note-modal-body">
              <textarea
                ref={contentTextareaRef}
                className="note-modal-textarea"
                placeholder="Write anything inside this note here... You can add or edit anytime."
                value={currentNote.content || ''}
                onChange={(e) => handleFieldChange({ content: e.target.value })}
                id="note-content-textarea"
              />
            </div>

            {/* Modal Footer with Word Count and Close/Done Button */}
            <div className="note-modal-footer">
              <div className="note-modal-stats">
                <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
                <span className="stats-separator">•</span>
                <span>{charCount} characters</span>
              </div>

              <button 
                className="btn-primary note-modal-done-btn"
                onClick={handleCloseNote}
              >
                <span>Done / Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
