import React from 'react';
import { Target, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ProgressOverview({ tasks }) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Encouraging message tailored to progress
  let encouragementText = 'Ready to start? Pick your first task for today.';
  if (percentage === 100) {
    encouragementText = "Outstanding work! All of today's study goals are accomplished 🎉";
  } else if (percentage >= 60) {
    encouragementText = "More than halfway there! You're making excellent progress.";
  } else if (percentage > 0) {
    encouragementText = 'Great start! Keep the momentum going for a productive session.';
  }

  return (
    <div className="progress-card">
      <div className="progress-header">
        <span className="card-label">Daily Progress</span>
        <div className="progress-meta-badge">
          <Target size={13} />
          <span>Daily Target</span>
        </div>
      </div>

      <div className="progress-main-display">
        <span className="percentage-text">{percentage}%</span>
        <span className="ratio-text">
          {completedTasks} of {totalTasks} tasks completed
        </span>
      </div>

      {/* Horizontal Progress Bar */}
      <div className="progress-track" role="progressbar" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="progress-encouragement">
        {percentage === 100 ? (
          <CheckCircle2 size={16} className="encouragement-icon" style={{ color: 'var(--success)' }} />
        ) : (
          <Sparkles size={16} className="encouragement-icon" />
        )}
        <span>{encouragementText}</span>
      </div>
    </div>
  );
}
