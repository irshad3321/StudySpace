import React, { useState } from 'react';
import { ArrowRight, BookOpenCheck } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProgressOverview from './components/ProgressOverview';
import QuickStats from './components/QuickStats';
import StudyPlan from './components/StudyPlan';
import AllTasks from './components/AllTasks';
import AddTaskModal from './components/AddTaskModal';

const getTodayOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const INITIAL_TASKS = [
  { id: 1, title: 'Revise Stack', category: 'Data Structures', date: getTodayOffset(0), completed: true },
  { id: 2, title: 'Practice Queue Implementation', category: 'Data Structures', date: getTodayOffset(0), completed: true },
  { id: 3, title: 'Learn Sorting Algorithms', category: 'Algorithms', date: getTodayOffset(0), completed: false },
  { id: 4, title: 'Revise Hash Tables', category: 'Data Structures', date: getTodayOffset(1), completed: false },
  { id: 5, title: 'Solve Three DSA Problems', category: 'Practice', date: getTodayOffset(2), completed: false },
];

export default function App() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Toggle task completion
  const handleToggleTask = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Delete task
  const handleDeleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  // Add new task
  const handleAddTask = (newTask) => {
    setTasks((prevTasks) => [newTask, ...prevTasks]);
  };

  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeNav={activeNav}
        onSelectNav={(navId) => setActiveNav(navId)}
        taskCount={tasks.length}
      />

      {/* Main Content Workspace */}
      <div className="main-wrapper">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="dashboard-content">
          {/* View: Dashboard (Progress Overview & Quick Stats only, no task list) */}
          {activeNav === 'dashboard' && (
            <>
              <div className="dashboard-top-grid">
                <ProgressOverview tasks={tasks} />
                <QuickStats 
                  streak={5} 
                  focusHours="3.5 hrs" 
                  weeklyCompleted={18} 
                  weeklyTotal={24} 
                />
              </div>

              {/* Quick Summary Card leading to My Study Plan */}
              <div className="dashboard-summary-card">
                <div>
                  <h3 className="section-heading">Today's Focus Status</h3>
                  <p className="summary-subtitle">
                    You have <strong>{pendingCount}</strong> study {pendingCount === 1 ? 'task' : 'tasks'} remaining for today.
                  </p>
                </div>
                <button 
                  className="btn-primary" 
                  onClick={() => setActiveNav('plan')}
                >
                  <BookOpenCheck size={16} />
                  <span>Go to My Study Plan</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </>
          )}

          {/* View: My Study Plan */}
          {activeNav === 'plan' && (
            <StudyPlan
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onOpenAddModal={() => setIsModalOpen(true)}
            />
          )}

          {/* View: All Tasks with Date Cards */}
          {activeNav === 'tasks' && (
            <AllTasks
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onOpenAddModal={() => setIsModalOpen(true)}
            />
          )}

          {/* View: Settings */}
          {activeNav === 'settings' && (
            <div className="settings-card">
              <h3 className="section-heading">Workspace Settings</h3>
              <p className="summary-subtitle" style={{ marginTop: '8px' }}>
                Account preferences, daily targets, and notification settings will be available here.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTask={handleAddTask}
      />
    </div>
  );
}
