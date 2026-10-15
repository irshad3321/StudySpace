import React, { useState } from 'react';
import { X, Plus, BookOpen } from 'lucide-react';

export default function AddTaskModal({ isOpen, onClose, onAddTask }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Data Structures');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      id: Date.now(),
      title: title.trim(),
      category,
      completed: false
    });

    setTitle('');
    setCategory('Data Structures');
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
              <label htmlFor="task-title" className="form-label">Task Title</label>
              <input
                id="task-title"
                type="text"
                className="form-input"
                placeholder="e.g. Implement Binary Search Tree"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-category" className="form-label">Topic / Category</label>
              <select
                id="task-category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Data Structures">Data Structures</option>
                <option value="Algorithms">Algorithms</option>
                <option value="Practice">Practice</option>
                <option value="Core CS">Core CS</option>
                <option value="System Design">System Design</option>
              </select>
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
