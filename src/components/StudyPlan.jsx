import React, { useState } from 'react';
import { 
  Check, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  CircleDashed,
  BookOpen
} from 'lucide-react';

export default function StudyPlan({ tasks, onToggleTask, onDeleteTask, onOpenAddModal }) {
  const [filter, setFilter] = useState('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const getCategoryClass = (category) => {
    switch (category?.toLowerCase()) {
      case 'data structures':
        return 'category-dsa';
      case 'algorithms':
        return 'category-algorithms';
      case 'practice':
        return 'category-practice';
      default:
        return 'category-general';
    }
  };

  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <section className="study-plan-section" aria-labelledby="study-plan-heading">
      <div className="study-plan-header">
        <div className="plan-title-group">
          <h2 id="study-plan-heading" className="section-heading">Today's Study Plan</h2>
          <span className="section-counter">
            {pendingCount} remaining
          </span>
        </div>

        <div className="plan-actions-group">
          {/* Quick Filter Chips */}
          <div className="filter-chips">
            <button
              className={`chip-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({tasks.length})
            </button>
            <button
              className={`chip-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({pendingCount})
            </button>
            <button
              className={`chip-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({tasks.length - pendingCount})
            </button>
          </div>

          {/* Add Task Button */}
          <button 
            className="btn-primary" 
            onClick={onOpenAddModal}
            aria-label="Add new study task"
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-tasks">
            <div className="empty-icon">
              <BookOpen size={20} />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              {tasks.length === 0 ? 'Your study plan is empty.' : 'No tasks match this filter.'}
            </p>
            <p className="summary-subtitle">
              {tasks.length === 0 ? 'Click "+ Add Task" to plan your study session.' : 'Try selecting "All" to view all your tasks.'}
            </p>
            {tasks.length === 0 && (
              <button className="btn-primary" onClick={onOpenAddModal} style={{ marginTop: '8px' }}>
                <Plus size={15} />
                <span>Add Your First Task</span>
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.completed;
            return (
              <div 
                key={task.id} 
                className={`task-item ${isDone ? 'completed' : ''}`}
              >
                <div className="task-left">
                  {/* Custom Checkbox */}
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isDone}
                    aria-label={`Mark "${task.title}" as ${isDone ? 'incomplete' : 'complete'}`}
                    className="custom-checkbox"
                    onClick={() => onToggleTask(task.id)}
                  >
                    {isDone && <Check size={14} strokeWidth={3} />}
                  </button>

                  <div className="task-details">
                    <span className="task-title">{task.title}</span>
                    {task.details && (
                      <span className="task-subtext">{task.details}</span>
                    )}
                  </div>
                </div>

                <div className="task-right">
                  {/* Category / Topic Label (optional) */}
                  {task.category && (
                    <span className={`category-badge ${getCategoryClass(task.category)}`}>
                      {task.category}
                    </span>
                  )}

                  {/* Completion Status */}
                  <div className={`status-indicator ${isDone ? 'done' : 'pending'}`}>
                    {isDone ? (
                      <>
                        <CheckCircle2 size={13} />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <CircleDashed size={13} />
                        <span>Pending</span>
                      </>
                    )}
                  </div>

                  {/* Delete Task Button */}
                  <button
                    className="task-delete-btn"
                    onClick={() => onDeleteTask(task.id)}
                    title="Delete task"
                    aria-label={`Delete task ${task.title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
