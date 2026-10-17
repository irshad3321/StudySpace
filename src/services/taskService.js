export const API_ROOT = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
    ? 'https://backend-irshad21.vercel.app'
    : 'http://localhost:4000'
);

const TASKS_API = `${API_ROOT.replace(/\/$/, '')}/api/tasks`;

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('studyspace_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Fetch all tasks for the logged in user from MongoDB
 */
export const fetchTasksAPI = async () => {
  const response = await fetch(TASKS_API, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch tasks from server');
  }

  const data = await response.json();
  return data.tasks || [];
};

/**
 * Create a new task in MongoDB
 */
export const createTaskAPI = async (taskData) => {
  const response = await fetch(TASKS_API, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({
      title: taskData.title,
      subtopics: taskData.subtopics || [],
      date: taskData.date,
      completed: !!taskData.completed,
      category: taskData.category || 'General'
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create task on server');
  }

  const data = await response.json();
  return data.task;
};

/**
 * Update a task in MongoDB
 */
export const updateTaskAPI = async (taskId, updatedFields) => {
  const response = await fetch(`${TASKS_API}/${taskId}`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(updatedFields)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update task on server');
  }

  const data = await response.json();
  return data.task;
};

/**
 * Delete a task in MongoDB
 */
export const deleteTaskAPI = async (taskId) => {
  const response = await fetch(`${TASKS_API}/${taskId}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete task on server');
  }

  const data = await response.json();
  return data;
};

/**
 * Bulk sync local tasks to MongoDB
 */
export const syncTasksAPI = async (tasks) => {
  const response = await fetch(`${TASKS_API}/sync`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({ tasks })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to sync tasks with server');
  }

  const data = await response.json();
  return data.tasks || [];
};
