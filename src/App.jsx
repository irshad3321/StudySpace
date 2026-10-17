import React, { useState, useEffect } from 'react';
import { ArrowRight, BookOpenCheck, Plus, Loader2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProgressOverview from './components/ProgressOverview';
import QuickStats from './components/QuickStats';
import StudyPlan from './components/StudyPlan';
import AllTasks from './components/AllTasks';
import AddTaskModal from './components/AddTaskModal';
import AuthModal from './components/AuthModal';
import LoginPage from './components/LoginPage';
import Settings from './components/Settings';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Load user's tasks from localStorage (defaults to empty array - no dummy data)
  const [tasks, setTasks] = useState(() => {
    try {
      const storageKey = user ? `studyspace_tasks_${user.id || user._id || 'guest'}` : 'studyspace_tasks';
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Sync user-specific tasks when user logs in or switches
  useEffect(() => {
    if (user) {
      const storageKey = `studyspace_tasks_${user.id || user._id || 'guest'}`;
      try {
        const saved = localStorage.getItem(storageKey);
        setTasks(saved ? JSON.parse(saved) : []);
      } catch {
        setTasks([]);
      }
    }
  }, [user?.id, user?._id]);

  // Sync tasks with localStorage whenever tasks state or user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const storageKey = `studyspace_tasks_${user.id || user._id || 'guest'}`;
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    }
  }, [tasks, isAuthenticated, user]);

  // Session Verification Loading Guard
  if (isLoading) {
    return (
      <div className="auth-loading-screen">
        <Loader2 size={32} className="spin-animate" style={{ color: 'var(--accent)' }} />
        <span>Verifying your session...</span>
      </div>
    );
  }

  // Auth Guard: User must log in first before accessing dashboard or other pages
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Toggle task completion (and synchronize subtopics if any)
  const handleToggleTask = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const nextCompleted = !task.completed;
          return {
            ...task,
            completed: nextCompleted,
            subtopics: Array.isArray(task.subtopics)
              ? task.subtopics.map((sub) => ({ ...sub, completed: nextCompleted }))
              : []
          };
        }
        return task;
      })
    );
  };

  // Toggle individual subtopic completion
  const handleToggleSubtopic = (taskId, subtopicId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const currentSubtopics = Array.isArray(task.subtopics) ? task.subtopics : [];
          const updatedSubtopics = currentSubtopics.map((sub) =>
            sub.id === subtopicId ? { ...sub, completed: !sub.completed } : sub
          );
          const allCompleted = updatedSubtopics.length > 0 && updatedSubtopics.every((s) => s.completed);
          return {
            ...task,
            subtopics: updatedSubtopics,
            completed: allCompleted
          };
        }
        return task;
      })
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

  // Open edit modal for a task
  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Edit task handler
  const handleEditTask = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
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
                <QuickStats tasks={tasks} />
              </div>

              {/* Quick Summary Card leading to My Study Plan */}
              <div className="dashboard-summary-card">
                <div>
                  <h3 className="section-heading">
                    {tasks.length === 0 ? "Get Started with Today's Study Plan" : "Today's Focus Status"}
                  </h3>
                  <p className="summary-subtitle">
                    {tasks.length === 0
                      ? 'No study tasks added yet. Plan your daily milestones to track your progress.'
                      : `You have ${pendingCount} study ${pendingCount === 1 ? 'task' : 'tasks'} remaining for today.`}
                  </p>
                </div>
                {tasks.length === 0 ? (
                  <button 
                    className="btn-primary" 
                    onClick={() => {
                      setEditingTask(null);
                      setIsModalOpen(true);
                    }}
                  >
                    <Plus size={16} />
                    <span>Add First Task</span>
                  </button>
                ) : (
                  <button 
                    className="btn-primary" 
                    onClick={() => setActiveNav('plan')}
                  >
                    <BookOpenCheck size={16} />
                    <span>Go to My Study Plan</span>
                    <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </>
          )}

          {/* View: My Study Plan */}
          {activeNav === 'plan' && (
            <StudyPlan
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onToggleSubtopic={handleToggleSubtopic}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleOpenEditModal}
              onOpenAddModal={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              onSelectNav={(navId) => setActiveNav(navId)}
            />
          )}

          {/* View: All Tasks with Date Cards */}
          {activeNav === 'tasks' && (
            <AllTasks
              tasks={tasks}
              onEditTask={handleOpenEditModal}
              onDeleteTask={handleDeleteTask}
              onOpenAddModal={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
            />
          )}

          {/* View: Settings */}
          {activeNav === 'settings' && <Settings />}
        </main>
      </div>

      {/* Add / Edit Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddTask={handleAddTask}
        taskToEdit={editingTask}
        onEditTask={handleEditTask}
      />

      {/* Authentication Modal */}
      <AuthModal />
    </div>
  );
}
