import mongoose from 'mongoose';
import Task from '../models/task.model.js';

/**
 * Get all tasks for the authenticated user
 * GET /api/tasks
 */
export const getTasks = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;
    const tasks = await Task.find({ user: userId }).sort({ date: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task
 * POST /api/tasks
 */
export const createTask = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;
    const { title, subtopics, date, completed, category } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a task title'
      });
    }

    const task = await Task.create({
      user: userId,
      title: title.trim(),
      subtopics: Array.isArray(subtopics) ? subtopics : [],
      date: date || new Date().toISOString().split('T')[0],
      completed: !!completed,
      category: category ? category.trim() : 'General'
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing task
 * PUT /api/tasks/:id
 */
export const updateTask = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;
    const { id } = req.params;
    const { title, subtopics, date, completed, category } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }

    // Find task belonging to this user
    const task = await Task.findOne({ _id: id, user: userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized'
      });
    }

    if (title !== undefined) task.title = title.trim();
    if (subtopics !== undefined && Array.isArray(subtopics)) {
      task.subtopics = subtopics;
      task.markModified('subtopics');
    }
    if (date !== undefined) task.date = date;
    if (completed !== undefined) {
      task.completed = !!completed;
      task.markModified('completed');
    }
    if (category !== undefined) task.category = category.trim();

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task
 * DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }

    const task = await Task.findOneAndDelete({ _id: id, user: userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk sync tasks from client localStorage to cloud database
 * POST /api/tasks/sync
 */
export const bulkSyncTasks = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      // Just return current database tasks
      const currentTasks = await Task.find({ user: userId }).sort({ date: 1, createdAt: 1 });
      return res.status(200).json({
        success: true,
        tasks: currentTasks
      });
    }

    // Get existing tasks to avoid duplicate inserts
    const existingTasks = await Task.find({ user: userId });
    const existingKeys = new Set(
      existingTasks.map(t => `${t.title.trim().toLowerCase()}_${t.date}`)
    );

    const tasksToInsert = [];
    for (const t of tasks) {
      if (!t.title || !t.title.trim()) continue;
      const dateKey = t.date || new Date().toISOString().split('T')[0];
      const matchKey = `${t.title.trim().toLowerCase()}_${dateKey}`;

      if (!existingKeys.has(matchKey)) {
        tasksToInsert.push({
          user: userId,
          title: t.title.trim(),
          subtopics: Array.isArray(t.subtopics) ? t.subtopics : [],
          date: dateKey,
          completed: !!t.completed,
          category: t.category || 'General'
        });
        existingKeys.add(matchKey);
      }
    }

    if (tasksToInsert.length > 0) {
      await Task.insertMany(tasksToInsert);
    }

    // Return the complete merged set of tasks
    const allTasks = await Task.find({ user: userId }).sort({ date: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: allTasks.length,
      tasks: allTasks
    });
  } catch (error) {
    next(error);
  }
};
