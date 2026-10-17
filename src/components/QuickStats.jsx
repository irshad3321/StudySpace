import React from 'react';
import { Flame, Clock, TrendingUp } from 'lucide-react';

export default function QuickStats({ tasks = [] }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const streak = completed > 0 ? 1 : 0;

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
