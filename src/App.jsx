import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProgressOverview from './components/ProgressOverview';
import QuickStats from './components/QuickStats';
import StudyPlan from './components/StudyPlan';
import AddTaskModal from './components/AddTaskModal';

const INITIAL_TASKS = [
  { id: 1, title: 'Revise Stack', category: 'Data Structures', completed: true },
  { id: 2, title: 'Practice Queue Implementation', category: 'Data Structures', completed: true },
  { id: 3, title: 'Learn Sorting Algorithms', category: 'Algorithms', completed: false },
  { id: 4, title: 'Revise Hash Tables', category: 'Data Structures', completed: false },
  { id: 5, title: 'Solve Three DSA Problems', category: 'Practice', completed: false },
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
          {/* Top Row: Daily Progress Overview + Quick Statistics */}
          <div className="dashboard-top-grid">
            <ProgressOverview tasks={tasks} />
            <QuickStats 
              streak={5} 
              focusHours="3.5 hrs" 
              weeklyCompleted={18} 
              weeklyTotal={24} 
            />
          </div>

          {/* Today's Study Plan Tasks */}
          <StudyPlan
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onOpenAddModal={() => setIsModalOpen(true)}
          />
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
