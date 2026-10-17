import React, { useState, useEffect } from 'react';
import { X, Plus, BookOpen, Pencil, Check } from 'lucide-react';

export default function AddTaskModal({ 
  isOpen, 
  onClose, 
  onAddTask, 
  taskToEdit = null, 
  onEditTask = null 
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [subtopics, setSubtopics] = useState([]);
  const [currentSubtopic, setCurrentSubtopic] = useState('');
  const [date, setDate] = useState(todayStr);

  const isEditing = !!taskToEdit;

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      if (Array.isArray(taskToEdit.subtopics) && taskToEdit.subtopics.length > 0) {
        setSubtopics([...taskToEdit.subtopics]);
      } else if (taskToEdit.details) {
        // Convert legacy details into a subtopic
        setSubtopics([
          {
            id: `sub_${Date.now()}`,
            text: taskToEdit.details,
            completed: !!taskToEdit.completed
          }
        ]);
      } else {
        setSubtopics([]);
      }
      setDate(taskToEdit.date || todayStr);
      setCurrentSubtopic('');
    } else {
      setTitle('');
      setSubtopics([]);
      setDate(todayStr);
      setCurrentSubtopic('');
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtopic = () => {
    const trimmed = currentSubtopic.trim();
    if (!trimmed) return;

    setSubtopics((prev) => [
      ...prev,
      {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        text: trimmed,
        completed: false
      }
    ]);
    setCurrentSubtopic('');
  };

  const handleKeyDownSubtopic = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtopic();
    }
  };

  const handleRemoveSubtopic = (idToRemove) => {
    setSubtopics((prev) => prev.filter((s) => s.id !== idToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // If there is any uncommitted text in the subtopic input, add it as well
    const finalSubtopics = [...subtopics];
    if (currentSubtopic.trim()) {
      finalSubtopics.push({
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        text: currentSubtopic.trim(),
        completed: false
      });
    }

    if (isEditing && onEditTask) {
      const allDone = finalSubtopics.length > 0 
        ? finalSubtopics.every(s => s.completed) 
        : (taskToEdit ? taskToEdit.completed : false);

      onEditTask({
        ...taskToEdit,
        title: title.trim(),
        subtopics: finalSubtopics,
        date: date || todayStr,
        completed: allDone
      });
    } else if (onAddTask) {
      onAddTask({
        id: Date.now(),
        title: title.trim(),
        subtopics: finalSubtopics,
        date: date || todayStr,
        completed: false
      });
    }

    setTitle('');
    setSubtopics([]);
    setCurrentSubtopic('');
    setDate(todayStr);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-heading">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isEditing ? (
              <Pencil size={18} style={{ color: 'var(--accent)' }} />
            ) : (
              <BookOpen size={18} style={{ color: 'var(--accent)' }} />
            )}
            <h2 id="modal-heading" className="modal-title">
              {isEditing ? 'Edit Study Task' : 'Add Study Task'}
            </h2>
          </div>
          <button 
            className="modal-close-btn" 
            onClick={onClose} 
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="task-title" className="form-label">Task Heading</label>
              <input
                id="task-title"
                type="text"
                className="form-input"
                placeholder="e.g. Stack, Binary Search Tree, Recursion"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="task-subtopic" className="form-label">
                  Subtopics / Checklist Items
                </label>
                {subtopics.length > 0 && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                    {subtopics.length} {subtopics.length === 1 ? 'subtopic' : 'subtopics'}
                  </span>
                )}
              </div>

              <div className="subtopic-input-row">
                <input
                  id="task-subtopic"
                  type="text"
                  className="form-input"
                  placeholder="e.g. implementation, stack using linked list"
                  value={currentSubtopic}
                  onChange={(e) => setCurrentSubtopic(e.target.value)}
                  onKeyDown={handleKeyDownSubtopic}
                />
                <button
                  type="button"
                  className="subtopic-add-btn"
                  onClick={handleAddSubtopic}
                  title="Add subtopic"
                >
                  <Plus size={15} />
                  <span>Add</span>
                </button>
              </div>
              <span className="form-helper-text">
                Type a topic and press Enter or click Add to add multiple subtopics.
              </span>

              {/* Render added subtopics chips */}
              {subtopics.length > 0 && (
                <div className="modal-subtopics-list">
                  {subtopics.map((sub) => (
                    <div key={sub.id} className="modal-subtopic-chip">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span className="modal-subtopic-bullet" />
                        <span style={{ wordBreak: 'break-word' }}>{sub.text}</span>
                      </div>
                      <button
                        type="button"
                        className="modal-subtopic-remove"
                        onClick={() => handleRemoveSubtopic(sub.id)}
                        aria-label={`Remove ${sub.text}`}
                        title="Remove subtopic"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="task-date" className="form-label">Scheduled Date</label>
              <input
                id="task-date"
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
            >
              {isEditing ? (
                <>
                  <Check size={16} />
                  <span>Save Changes</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Add Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
