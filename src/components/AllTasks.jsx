import React, { useState } from 'react';
import { 
  Calendar, 
  CalendarDays, 
  Check, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  CircleDashed,
  BookOpen
} from 'lucide-react';

export default function AllTasks({ tasks, onToggleTask, onToggleSubtopic, onDeleteTask, onOpenAddModal }) {
  const [dateFilter, setDateFilter] = useState('all');

  const todayStr = new Date().toISOString().split('T')[0];

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

  // Helper to format date string
  const formatDateLabel = (dateStr) => {
    if (!dateStr) return { title: 'Unscheduled', relative: 'No Date' };
    
    // Parse date components safely to prevent timezone shift
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const formatted = dateObj.toLocaleDateString('en-US', options);

    // Calculate relative day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateObj);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    let relative = '';
    let pillClass = '';
    if (diffDays === 0) {
      relative = 'Today';
      pillClass = 'pill-today';
    } else if (diffDays === 1) {
      relative = 'Tomorrow';
      pillClass = 'pill-tomorrow';
    } else if (diffDays === -1) {
      relative = 'Yesterday';
      pillClass = 'pill-past';
    } else if (diffDays > 1) {
      relative = `In ${diffDays} days`;
      pillClass = 'pill-upcoming';
    } else {
      relative = `${Math.abs(diffDays)} days ago`;
      pillClass = 'pill-past';
    }

    return { title: formatted, relative, pillClass, diffDays };
  };

  // Filter tasks based on selected date filter
  const filteredTasks = tasks.filter((task) => {
    const taskDate = task.date || todayStr;
    const { diffDays } = formatDateLabel(taskDate);

    if (dateFilter === 'today') return diffDays === 0;
    if (dateFilter === 'tomorrow') return diffDays === 1;
    if (dateFilter === 'upcoming') return diffDays >= 0;
    if (dateFilter === 'completed') return task.completed;
    return true; // 'all'
  });

  // Group tasks by date string
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const dateKey = task.date || todayStr;
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(task);
    return groups;
  }, {});

  // Sort date keys in chronological order
  const sortedDateKeys = Object.keys(groupedTasks).sort();

  return (
    <div className="all-tasks-wrapper">
      {/* Header with Title and Filters */}
      <div className="all-tasks-header-card">
        <div className="all-tasks-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="all-tasks-icon-box">
              <CalendarDays size={20} />
            </div>
            <div>
              <h2 className="section-heading">All Study Tasks by Date</h2>
              <p className="summary-subtitle">
                Scheduled study milestones and timeline cards
              </p>
            </div>
          </div>
        </div>

        <div className="plan-actions-group">
          {/* Date Filter Chips */}
          <div className="filter-chips">
            <button
              className={`chip-btn ${dateFilter === 'all' ? 'active' : ''}`}
              onClick={() => setDateFilter('all')}
            >
              All ({tasks.length})
            </button>
            <button
              className={`chip-btn ${dateFilter === 'today' ? 'active' : ''}`}
              onClick={() => setDateFilter('today')}
            >
              Today
            </button>
            <button
              className={`chip-btn ${dateFilter === 'tomorrow' ? 'active' : ''}`}
              onClick={() => setDateFilter('tomorrow')}
            >
              Tomorrow
            </button>
            <button
              className={`chip-btn ${dateFilter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setDateFilter('upcoming')}
            >
              Upcoming
            </button>
          </div>

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

      {/* Date Cards Section */}
      <div className="date-groups-list">
        {sortedDateKeys.length === 0 ? (
          <div className="empty-tasks-card">
            <div className="empty-icon">
              <BookOpen size={22} />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>No tasks found for this date filter.</p>
            <p className="summary-subtitle">Try selecting another filter or create a new scheduled study task.</p>
          </div>
        ) : (
          sortedDateKeys.map((dateKey) => {
            const dateTasks = groupedTasks[dateKey];
            const dateMeta = formatDateLabel(dateKey);
            const completedCount = dateTasks.filter(t => t.completed).length;
            const allDateDone = completedCount === dateTasks.length;

            return (
              <div key={dateKey} className="date-group-card">
                {/* Date Card Header */}
                <div className="date-card-header">
                  <div className="date-card-title-left">
                    <Calendar size={18} className="date-card-icon" />
                    <span className="date-card-title">{dateMeta.title}</span>
                    <span className={`date-relative-pill ${dateMeta.pillClass}`}>
                      {dateMeta.relative}
                    </span>
                  </div>

                  <div className="date-card-meta-right">
                    <span className="date-completion-ratio">
                      {completedCount} of {dateTasks.length} done
                    </span>
                    {allDateDone && (
                      <span className="date-all-done-badge">
                        <Check size={12} strokeWidth={3} /> Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* Task Items inside this Date Card */}
                <div className="date-card-tasks">
                  {dateTasks.map((task) => {
                    const isDone = task.completed;
                    const hasSubtopics = Array.isArray(task.subtopics) && task.subtopics.length > 0;
                    const completedSubs = hasSubtopics ? task.subtopics.filter(s => s.completed).length : 0;

                    return (
                      <div 
                        key={task.id} 
                        className={`task-item ${isDone ? 'completed' : ''}`}
                      >
                        <div className="task-left">
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
                                        onClick={() => onToggleSubtopic && onToggleSubtopic(task.id, sub.id)}
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
                          {task.category && (
                            <span className={`category-badge ${getCategoryClass(task.category)}`}>
                              {task.category}
                            </span>
                          )}

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
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
