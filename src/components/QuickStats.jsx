import React from 'react';
import { Flame, Clock, TrendingUp } from 'lucide-react';

const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function QuickStats({ tasks = [] }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Calculate streak based on completed tasks across consecutive calendar days
  const completedDates = new Set(
    tasks
      .filter((t) => t.completed)
      .map((t) => t.learnedDate || t.date)
      .filter(Boolean)
  );

  let streak = 0;
  const today = new Date();
  const todayStr = getLocalDateString(today);
  
  const checkDate = new Date(today);
  if (completedDates.has(todayStr)) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // Check if streak was active as of yesterday
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (completedDates.has(getLocalDateString(checkDate))) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Fallback: If at least one task is completed but dates aren't consecutive, grant 1 day minimum
  if (streak === 0 && completed > 0) {
    streak = 1;
  }

  const stats = [
    {
      id: 'streak',
      title: 'Current Streak',
      value: `${streak} ${streak === 1 ? 'Day' : 'Days'}`,
      subtitle: streak > 0 ? 'Active study streak' : 'Complete a task to start streak',
      icon: Flame,
      color: '#f97316'
    },
    {
      id: 'pending',
      title: 'Pending Tasks',
      value: `${pending}`,
      subtitle: pending === 0 ? 'No pending tasks' : `${pending} waiting to complete`,
      icon: Clock,
      color: 'var(--accent)'
    },
    {
      id: 'rate',
      title: 'Completion Rate',
      value: `${rate}%`,
      subtitle: `${completed} of ${total} tasks finished`,
      icon: TrendingUp,
      color: '#059669'
    }
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.id} className="stat-card">
            <div className="stat-card-top">
              <span className="stat-title">{stat.title}</span>
              <div className="stat-icon-wrapper" style={{ color: stat.color }}>
                <Icon size={16} />
              </div>
            </div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-subtitle">{stat.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
