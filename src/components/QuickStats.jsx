import React from 'react';
import { Flame, Clock, TrendingUp } from 'lucide-react';

export default function QuickStats({ streak = 5, focusHours = '3.5 hrs', weeklyCompleted = 18, weeklyTotal = 24 }) {
  const stats = [
    {
      id: 'streak',
      title: 'Current Streak',
      value: `${streak} Days`,
      subtitle: 'Personal best: 14 days',
      icon: Flame,
      color: '#f97316'
    },
    {
      id: 'focus',
      title: 'Focus Time',
      value: focusHours,
      subtitle: 'Daily target: 5.0 hrs',
      icon: Clock,
      color: 'var(--accent)'
    },
    {
      id: 'weekly',
      title: 'Weekly Tasks',
      value: `${weeklyCompleted} / ${weeklyTotal}`,
      subtitle: `${Math.round((weeklyCompleted / weeklyTotal) * 100)}% on track this week`,
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
