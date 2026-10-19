import React, { useState } from 'react';
import { 
  Check, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  CircleDashed, 
  BookOpen,
  Pencil,
  AlertCircle
} from 'lucide-react';

export default function StudyPlan({ 
  tasks, 
  onToggleTask, 
  onToggleSubtopic, 
  onDeleteTask, 
  onEditTask,
  onOpenAddModal,
  onSelectNav
}) {
  const [filter, setFilter] = useState('all');
  const todayStr = new Date().toISOString().split('T')[0];

  // In My Study Plan: ONLY show tasks scheduled for today (past completed tasks are archived to All Tasks)
  const todayTasks = tasks.filter(task => {
    const taskDate = task.date || todayStr;
    return taskDate === todayStr;
  });

  // Track past uncovered tasks (from yesterday or earlier) to alert the user
  const missedPastTasks = tasks.filter(task => {
    const taskDate = task.date || todayStr;
    return taskDate < todayStr && !task.completed;
  });

  const filteredTasks = todayTasks.filter(task => {
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

  const pendingCount = todayTasks.filter(t => !t.completed).length;

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
              All ({todayTasks.length})
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
              Completed ({todayTasks.length - pendingCount})
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

      {/* Alert banner if there are uncovered topics from yesterday / past days */}
      {missedPastTasks.length > 0 && (
        <div className="study-plan-missed-alert">
          <div className="missed-alert-content">
            <div className="missed-alert-icon-wrap">
              <AlertCircle size={18} />
            </div>
            <div>
              <div className="missed-alert-title">
                {missedPastTasks.length} {missedPastTasks.length === 1 ? 'topic was' : 'topics were'} not covered yesterday / past days
              </div>
              <div className="missed-alert-subtext">
                These are highlighted in red in All Tasks so you can catch up.
              </div>
            </div>
          </div>
          <button 
            type="button"
            className="missed-alert-action-btn"
            onClick={() => onSelectNav && onSelectNav('tasks')}
          >
            Review Missed Topics &rarr;
          </button>
        </div>
      )}

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
            const hasSubtopics = Array.isArray(task.subtopics) && task.subtopics.length > 0;
            const completedSubs = hasSubtopics ? task.subtopics.filter(s => s.completed).length : 0;

            return (
              <div 
                key={task.id || task._id} 
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
                    onClick={() => onToggleTask(task.id || task._id)}
                  >
                    {isDone && <Check size={14} strokeWidth={3} />}
                  </button>

                  <div className="task-details">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="task-title">{task.title}</span>
                      {hasSubtopics && (
                        <span className="task-subtopics-badge">
                          {completedSubs}/{task.subtopics.length} done
                        </span>
                      )}
                    </div>

                    {/* Multiple Subtopics with small circular checkmarks */}
                    {hasSubtopics && (
                      <div className="task-subtopics-list">
                        {task.subtopics.map((sub) => {
                          const isSubDone = sub.completed;
                          return (
                            <div 
                              key={sub.id} 
                              className={`subtopic-item ${isSubDone ? 'completed' : ''}`}
                            >
                              <button
                                type="button"
                                role="checkbox"
                                aria-checked={isSubDone}
                                className="subtopic-circle-btn"
                                onClick={() => onToggleSubtopic && onToggleSubtopic(task.id || task._id, sub.id)}
                                aria-label={`Mark "${sub.text}" as ${isSubDone ? 'incomplete' : 'complete'}`}
                                title={isSubDone ? 'Mark as incomplete' : 'Mark as complete'}
                              >
                                {isSubDone ? (
                                  <span className="subtopic-circle-checked">
                                    <Check size={9} strokeWidth={3.5} />
                                  </span>
                                ) : (
                                  <span className="subtopic-circle-empty" />
                                )}
                              </button>
                              <span className="subtopic-text">{sub.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Backwards compatibility for single-detail tasks */}
                    {task.details && !hasSubtopics && (
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

                  {/* Action Buttons: Edit & Delete */}
                  <div className="task-actions-group">
                    <button
                      className="task-action-btn edit-btn"
                      onClick={() => onEditTask && onEditTask(task)}
                      title="Edit task"
                      aria-label={`Edit task ${task.title}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="task-action-btn delete-btn"
                      onClick={() => onDeleteTask(task.id || task._id)}
                      title="Delete task"
                      aria-label={`Delete task ${task.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
