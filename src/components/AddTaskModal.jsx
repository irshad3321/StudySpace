import React, { useState } from 'react';
import { X, Plus, BookOpen } from 'lucide-react';

export default function AddTaskModal({ isOpen, onClose, onAddTask }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState(todayStr);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      id: Date.now(),
      title: title.trim(),
      details: details.trim(),
      date: date || todayStr,
      completed: false
    });

    setTitle('');
    setDetails('');
    setDate(todayStr);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-heading">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} style={{ color: 'var(--accent)' }} />
            <h2 id="modal-heading" className="modal-title">Add Study Task</h2>
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
              <label htmlFor="task-details" className="form-label">
                Subtopics / Implementation Details
              </label>
              <input
                id="task-details"
                type="text"
                className="form-input"
                placeholder="e.g. implementation, stack using linked list"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
              <span className="form-helper-text">
                Add your custom subtopics or focus steps manually.
              </span>
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
              <Plus size={16} />
              <span>Add Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
