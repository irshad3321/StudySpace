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
import {
  fetchTasksAPI,
  createTaskAPI,
  updateTaskAPI,
  deleteTaskAPI,
  syncTasksAPI
} from './services/taskService';

export default function App() {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Load initial tasks from localStorage cache for instant render without blank wait
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
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'error'

  // Sync user-specific tasks from MongoDB cloud database when user logs in or switches
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let isMounted = true;
    const userId = user.id || user._id;
    const storageKey = `studyspace_tasks_${userId}`;

    // Apply dark mode theme if configured in user profile
    if (user.settings?.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    const loadCloudTasks = async () => {
      setSyncStatus('syncing');

      try {
        // Fetch source of truth from MongoDB cloud database
        const cloudTasks = await fetchTasksAPI();

        // Check if there are local tasks that need to be migrated to cloud
        let localTasks = [];
        try {
          const cached = localStorage.getItem(storageKey);
          if (cached) localTasks = JSON.parse(cached);
        } catch {
          localTasks = [];
        }

        let finalTasks = cloudTasks;

        // If cloud is empty but local has tasks, migrate local tasks to MongoDB
        if ((!cloudTasks || cloudTasks.length === 0) && localTasks.length > 0) {
          finalTasks = await syncTasksAPI(localTasks);
        }

        if (isMounted) {
          setTasks(finalTasks);
          localStorage.setItem(storageKey, JSON.stringify(finalTasks));
          setSyncStatus('synced');
        }
      } catch (err) {
        console.warn('Could not load tasks from MongoDB, using local cache:', err);
        if (isMounted) {
          setSyncStatus('error');
        }
      }
    };

    loadCloudTasks();

    // Auto-refresh tasks when returning to the tab (e.g. after adding task on phone)
    const handleFocusSync = () => {
      if (document.visibilityState === 'visible') {
        fetchTasksAPI()
          .then((cloudTasks) => {
            if (isMounted && Array.isArray(cloudTasks)) {
              setTasks(cloudTasks);
              localStorage.setItem(storageKey, JSON.stringify(cloudTasks));
              setSyncStatus('synced');
            }
          })
          .catch(() => {});
      }
    };

    window.addEventListener('visibilitychange', handleFocusSync);
    window.addEventListener('focus', handleFocusSync);

    return () => {
      isMounted = false;
      window.removeEventListener('visibilitychange', handleFocusSync);
      window.removeEventListener('focus', handleFocusSync);
    };
  }, [isAuthenticated, user?.id, user?._id]);

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
  const handleToggleTask = async (taskId) => {
    const currentTask = tasks.find((t) => t.id === taskId || t._id === taskId);
    if (!currentTask) return;

    const nextCompleted = !currentTask.completed;
    const nextSubtopics = Array.isArray(currentTask.subtopics)
      ? currentTask.subtopics.map((sub) => ({ ...sub, completed: nextCompleted }))
      : [];
    const targetId = currentTask._id || currentTask.id || taskId;

    const updatedTask = {
      ...currentTask,
      completed: nextCompleted,
      subtopics: nextSubtopics
    };

    // Immediate optimistic local update
    setTasks((prevTasks) => {
      const nextTasks = prevTasks.map((t) =>
        t.id === taskId || t._id === taskId ? updatedTask : t
      );
      const userId = user?.id || user?._id;
      if (userId) {
        localStorage.setItem(`studyspace_tasks_${userId}`, JSON.stringify(nextTasks));
      }
      return nextTasks;
    });

    // Immediate cloud database persist
    setSyncStatus('syncing');
    try {
      await updateTaskAPI(targetId, {
        completed: nextCompleted,
        subtopics: nextSubtopics
      });
      setSyncStatus('synced');
    } catch (err) {
      console.error('Failed to sync toggle to cloud:', err);
      setSyncStatus('error');
    }
  };

  // Toggle individual subtopic completion
  const handleToggleSubtopic = async (taskId, subtopicId) => {
    const currentTask = tasks.find((t) => t.id === taskId || t._id === taskId);
    if (!currentTask) return;

    const currentSubtopics = Array.isArray(currentTask.subtopics) ? currentTask.subtopics : [];
    const nextSubtopics = currentSubtopics.map((sub) =>
      sub.id === subtopicId ? { ...sub, completed: !sub.completed } : sub
    );
    const allCompleted = nextSubtopics.length > 0 && nextSubtopics.every((s) => s.completed);
    const targetId = currentTask._id || currentTask.id || taskId;

    const updatedTask = {
      ...currentTask,
      subtopics: nextSubtopics,
      completed: allCompleted
    };

    // Immediate optimistic local update
    setTasks((prevTasks) => {
      const nextTasks = prevTasks.map((t) =>
        t.id === taskId || t._id === taskId ? updatedTask : t
      );
      const userId = user?.id || user?._id;
      if (userId) {
        localStorage.setItem(`studyspace_tasks_${userId}`, JSON.stringify(nextTasks));
      }
      return nextTasks;
    });

    // Immediate cloud database persist
    setSyncStatus('syncing');
    try {
      await updateTaskAPI(targetId, {
        completed: allCompleted,
        subtopics: nextSubtopics
      });
      setSyncStatus('synced');
    } catch (err) {
      console.error('Failed to sync subtopic toggle to cloud:', err);
      setSyncStatus('error');
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    const currentTask = tasks.find((t) => t.id === taskId || t._id === taskId);
    const targetId = currentTask ? (currentTask._id || currentTask.id || taskId) : taskId;

    setTasks((prevTasks) => {
      const nextTasks = prevTasks.filter((task) => task.id !== taskId && task._id !== taskId);
      const userId = user?.id || user?._id;
      if (userId) {
        localStorage.setItem(`studyspace_tasks_${userId}`, JSON.stringify(nextTasks));
      }
      return nextTasks;
    });

    if (targetId) {
      setSyncStatus('syncing');
      try {
        await deleteTaskAPI(targetId);
        setSyncStatus('synced');
      } catch (err) {
        console.error('Failed to delete task from cloud:', err);
        setSyncStatus('error');
      }
    }
  };

  // Add new task
  const handleAddTask = async (newTaskData) => {
    // Optimistic temporary task for instant UI feedback
    const tempId = `temp_${Date.now()}`;
    const optimisticTask = {
      ...newTaskData,
      id: tempId,
      _id: tempId
    };

    setTasks((prevTasks) => [optimisticTask, ...prevTasks]);
    setSyncStatus('syncing');

    try {
      const savedTask = await createTaskAPI(newTaskData);
      setTasks((prevTasks) => {
        const updated = prevTasks.map((t) => (t.id === tempId || t._id === tempId ? savedTask : t));
        const userId = user?.id || user?._id;
        if (userId) {
          localStorage.setItem(`studyspace_tasks_${userId}`, JSON.stringify(updated));
        }
        return updated;
      });
      setSyncStatus('synced');
    } catch (err) {
      console.error('Failed to save task to cloud:', err);
      setSyncStatus('error');
    }
  };

  // Open edit modal for a task
  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Edit task handler
  const handleEditTask = async (updatedTask) => {
    setTasks((prevTasks) => {
      const nextTasks = prevTasks.map((t) =>
        (t.id === updatedTask.id || t._id === updatedTask._id ? updatedTask : t)
      );
      const userId = user?.id || user?._id;
      if (userId) {
        localStorage.setItem(`studyspace_tasks_${userId}`, JSON.stringify(nextTasks));
      }
      return nextTasks;
    });

    const targetId = updatedTask._id || updatedTask.id;
    if (targetId) {
      setSyncStatus('syncing');
      try {
        await updateTaskAPI(targetId, updatedTask);
        setSyncStatus('synced');
      } catch (err) {
        console.error('Failed to save edited task to cloud:', err);
        setSyncStatus('error');
      }
    }
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
        <Header 
          onOpenSidebar={() => setSidebarOpen(true)} 
          syncStatus={syncStatus}
        />

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
