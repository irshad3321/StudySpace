import React, { useState } from 'react';
import { 
  Check, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  CircleDashed, 
  BookOpen,
  Pencil,
  AlertCircle,
  Sparkles,
  CalendarDays,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format a date string into friendly label (e.g. "Yesterday", "Oct 21")
const formatPastDateLabel = (dateStr) => {
  if (!dateStr) return 'Past date';
  const [year, month, day] = dateStr.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  target.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = target - today;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago (${target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
  return dateStr;
};

export default function StudyPlan({ 
  tasks, 
  onToggleTask, 
  onToggleSubtopic, 
  onDeleteTask, 
  onEditTask,
  onOpenAddModal,
  onSelectNav,
  onMarkLearnedToday,
  onMoveTaskToToday
}) {
  const [filter, setFilter] = useState('all');
  const [showCatchUp, setShowCatchUp] = useState(true);

  const todayStr = getLocalDateString();

  // In My Study Plan: tasks scheduled for today
  const todayTasks = tasks.filter(task => {
    const taskDate = task.date || todayStr;
    return taskDate === todayStr;
  });

  // Track past uncovered tasks (from yesterday or earlier) that need to be learned/caught up
  const missedPastTasks = tasks.filter(task => {
    const taskDate = task.date || todayStr;
    return taskDate < todayStr && !task.completed;
  });

  // Track past tasks that the user caught up on today
  const caughtUpTodayTasks = tasks.filter(task => {
    const taskDate = task.date || todayStr;
    return taskDate < todayStr && task.completed && task.learnedDate === todayStr;
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
      {/* Header with Title and Filter Actions */}
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

      {/* Celebratory Banner for tasks caught up today */}
      {caughtUpTodayTasks.length > 0 && (
        <div className="caught-up-success-banner">
          <div className="caught-up-left">
            <div className="caught-up-icon-box">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="caught-up-title">
                Great work! You caught up on {caughtUpTodayTasks.length} missed {caughtUpTodayTasks.length === 1 ? 'topic' : 'topics'} today 🎉
              </div>
              <div className="caught-up-sub">
                {caughtUpTodayTasks.map(t => `"${t.title}"`).join(', ')} marked as learned today.
              </div>
            </div>
          </div>
          <button 
            type="button"
            className="caught-up-view-btn"
            onClick={() => onSelectNav && onSelectNav('tasks')}
          >
            Review in Timeline &rarr;
          </button>
        </div>
      )}

      {/* Missed Tasks Catch-Up Section (when yesterday / past tasks are incomplete) */}
      {missedPastTasks.length > 0 && (
        <div className="catchup-section-wrapper">
          <div className="study-plan-missed-alert">
            <div className="missed-alert-content">
              <div className="missed-alert-icon-wrap">
                <AlertCircle size={18} />
              </div>
              <div>
                <div className="missed-alert-title">
                  {missedPastTasks.length} {missedPastTasks.length === 1 ? 'task was' : 'tasks were'} missed from yesterday / past days
                </div>
                <div className="missed-alert-subtext">
                  Learned this topic today? Mark it as learned today or move it into today's active schedule below.
                </div>
              </div>
            </div>
            <div className="missed-alert-btn-group">
              <button 
                type="button"
                className="missed-toggle-btn"
                onClick={() => setShowCatchUp(!showCatchUp)}
                aria-expanded={showCatchUp}
              >
                <span>{showCatchUp ? 'Hide Catch-Up List' : `Catch Up Now (${missedPastTasks.length})`}</span>
                {showCatchUp ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              <button 
                type="button"
                className="missed-alert-action-btn"
                onClick={() => onSelectNav && onSelectNav('tasks')}
                title="View full timeline in All Tasks"
              >
                All Tasks &rarr;
              </button>
            </div>
          </div>

          {/* Expanded Catch-up Task Items */}
          {showCatchUp && (
            <div className="catchup-drawer">
              <div className="catchup-drawer-heading">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={15} style={{ color: '#d97706' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                    Missed Topics to Catch Up
                  </span>
                </div>
                <span className="catchup-drawer-hint">
                  Check off subtopics, click "Learned Today" to mark done, or click "Move to Today"
                </span>
              </div>

              <div className="catchup-tasks-list">
                {missedPastTasks.map((task) => {
                  const hasSubtopics = Array.isArray(task.subtopics) && task.subtopics.length > 0;
                  const completedSubs = hasSubtopics ? task.subtopics.filter(s => s.completed).length : 0;
                  const pastLabel = formatPastDateLabel(task.date);

                  return (
                    <div key={task.id || task._id} className="task-item catchup-item">
                      <div className="task-left">
                        {/* Custom Checkbox - Click to Mark Learned Today */}
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={false}
                          aria-label={`Mark missed task "${task.title}" as learned today`}
                          className="custom-checkbox catchup-checkbox"
                          onClick={() => onMarkLearnedToday && onMarkLearnedToday(task.id || task._id)}
                          title="Click to mark as learned today"
                        >
                          <Check size={14} strokeWidth={3} className="catchup-hover-check" />
                        </button>

                        <div className="task-details">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span className="task-title catchup-title">{task.title}</span>
                            <span className="catchup-date-badge">
                              {pastLabel}
                            </span>
                            {hasSubtopics && (
                              <span className="task-subtopics-badge missed-badge">
                                {completedSubs}/{task.subtopics.length} done
                              </span>
                            )}
                          </div>

                          {/* Subtopics Checklist inside Catch-Up item */}
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
                                      title={isSubDone ? 'Mark as incomplete' : 'Mark as learned today'}
                                    >
                                      {isSubDone ? (
                                        <span className="subtopic-circle-checked">
                                          <Check size={9} strokeWidth={3.5} />
                                        </span>
                                      ) : (
                                        <span className="subtopic-circle-empty catchup-sub-empty" />
                                      )}
                                    </button>
                                    <span className="subtopic-text">{sub.text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

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

                        {/* Quick Action: Mark Learned Today */}
                        <button
                          type="button"
                          className="btn-mark-learned-today"
                          onClick={() => onMarkLearnedToday && onMarkLearnedToday(task.id || task._id)}
                          title="Mark this task and its subtopics as completed today"
                        >
                          <Sparkles size={13} />
                          <span>Learned Today</span>
                        </button>

                        {/* Quick Action: Move to Today's Plan */}
                        <button
                          type="button"
                          className="btn-move-today"
                          onClick={() => onMoveTaskToToday && onMoveTaskToToday(task.id || task._id)}
                          title="Move this task into today's active study plan"
                        >
                          <CalendarDays size={13} />
                          <span>Move to Today</span>
                        </button>

                        {/* Edit & Delete */}
                        <div className="task-actions-group">
                          <button
                            className="task-action-btn edit-btn"
                            onClick={() => onEditTask && onEditTask(task)}
                            title="Edit task details / subtopics"
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
          )}
        </div>
      )}

      {/* Today's Task List */}
      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-tasks">
            <div className="empty-icon">
              <BookOpen size={20} />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              {tasks.length === 0 ? 'Your study plan is empty.' : 'No tasks match this filter for today.'}
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
                  {/* Category / Topic Label */}
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
