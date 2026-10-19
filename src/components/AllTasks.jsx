import React, { useState } from 'react';
import { 
  Calendar, 
  CalendarDays, 
  Check, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  CircleDashed,
  BookOpen,
  Pencil,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function AllTasks({ tasks, onEditTask, onDeleteTask, onOpenAddModal }) {
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
    if (!dateStr) return { title: 'Unscheduled', relative: 'No Date', diffDays: 0, pillClass: 'pill-today' };
    
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

  // Count totals for filter chips
  const missedTotalCount = tasks.filter((t) => {
    const { diffDays } = formatDateLabel(t.date || todayStr);
    return diffDays < 0 && !t.completed;
  }).length;

  const coveredTotalCount = tasks.filter((t) => t.completed).length;

  // Filter tasks based on selected date filter
  const filteredTasks = tasks.filter((task) => {
    const taskDate = task.date || todayStr;
    const { diffDays } = formatDateLabel(taskDate);

    if (dateFilter === 'today') return diffDays === 0;
    if (dateFilter === 'tomorrow') return diffDays === 1;
    if (dateFilter === 'upcoming') return diffDays >= 0;
    if (dateFilter === 'missed') return diffDays < 0 && !task.completed;
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
                Scheduled study milestones and timeline review of covered topics
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
            <button
              className={`chip-btn chip-missed ${dateFilter === 'missed' ? 'active' : ''}`}
              onClick={() => setDateFilter('missed')}
            >
              Not Covered {missedTotalCount > 0 ? `(${missedTotalCount})` : ''}
            </button>
            <button
              className={`chip-btn ${dateFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setDateFilter('completed')}
            >
              Covered ({coveredTotalCount})
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
            const missedInDate = dateTasks.filter(t => !t.completed && dateMeta.diffDays < 0).length;
            const allDateDone = dateTasks.length > 0 && completedCount === dateTasks.length;

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
                      {completedCount} of {dateTasks.length} covered
                    </span>
                    {allDateDone && (
                      <span className="date-all-done-badge">
                        <Check size={12} strokeWidth={3} /> All Covered
                      </span>
                    )}
                    {missedInDate > 0 && (
                      <span className="date-missed-badge">
                        <AlertCircle size={12} /> {missedInDate} not covered
                      </span>
                    )}
                  </div>
                </div>

                {/* Task Items inside this Date Card (Review Log - No interactive check buttons) */}
                <div className="date-card-tasks">
                  {dateTasks.map((task) => {
                    const isDone = task.completed;
                    const isMissed = dateMeta.diffDays < 0 && !isDone;
                    const hasSubtopics = Array.isArray(task.subtopics) && task.subtopics.length > 0;
                    const completedSubs = hasSubtopics ? task.subtopics.filter(s => s.completed).length : 0;

                    return (
                      <div 
                        key={task.id || task._id} 
                        className={`task-item all-tasks-item ${isDone ? 'completed' : ''} ${isMissed ? 'missed' : ''}`}
                      >
                        <div className="task-left">
                          {/* Static Status Icon - No interactive toggle button */}
                          <div className={`all-tasks-status-icon ${isDone ? 'covered' : isMissed ? 'missed' : 'planned'}`}>
                            {isDone ? (
                              <Check size={13} strokeWidth={3} />
                            ) : isMissed ? (
                              <AlertCircle size={13} strokeWidth={2.5} />
                            ) : (
                              <CircleDashed size={13} />
                            )}
                          </div>

                          <div className="task-details">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span className={`task-title ${isMissed ? 'missed-title' : ''}`}>
                                {task.title}
                              </span>
                              {hasSubtopics && (
                                <span className={`task-subtopics-badge ${isMissed ? 'missed-badge' : ''}`}>
                                  {completedSubs}/{task.subtopics.length} covered
                                </span>
                              )}
                            </div>

                            {/* Subtopics review log without interactive checkboxes */}
                            {hasSubtopics && (
                              <div className="task-subtopics-list all-tasks-subtopics">
                                {task.subtopics.map((sub) => {
                                  const isSubDone = sub.completed;
                                  return (
                                    <div 
                                      key={sub.id} 
                                      className={`subtopic-item ${isSubDone ? 'completed' : isMissed ? 'missed' : ''}`}
                                    >
                                      <span className={`all-tasks-subtopic-bullet ${isSubDone ? 'covered' : isMissed ? 'missed' : 'planned'}`}>
                                        {isSubDone ? <Check size={8} strokeWidth={3.5} /> : null}
                                      </span>
                                      <span className={`subtopic-text ${isSubDone ? 'covered-text' : isMissed ? 'missed-text' : ''}`}>
                                        {sub.text}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Backwards compatibility for single-detail tasks */}
                            {task.details && !hasSubtopics && (
                              <span className={`task-subtext ${isMissed ? 'missed-text' : ''}`}>{task.details}</span>
                            )}
                          </div>
                        </div>

                        <div className="task-right">
                          {task.category && (
                            <span className={`category-badge ${getCategoryClass(task.category)}`}>
                              {task.category}
                            </span>
                          )}

                          {/* Status Tag */}
                          <div className={`status-indicator ${isDone ? 'done' : isMissed ? 'missed' : 'pending'}`}>
                            {isDone ? (
                              <>
                                <CheckCircle2 size={13} />
                                <span>Covered</span>
                              </>
                            ) : isMissed ? (
                              <>
                                <AlertCircle size={13} />
                                <span>Not Covered</span>
                              </>
                            ) : (
                              <>
                                <Clock size={13} />
                                <span>Planned</span>
                              </>
                            )}
                          </div>

                          {/* Action Buttons: Edit & Delete */}
                          <div className="task-actions-group">
                            <button
                              className="task-action-btn edit-btn"
                              onClick={() => onEditTask && onEditTask(task)}
                              title="Edit task / Move to today"
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
