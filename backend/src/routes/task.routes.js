import { Router } from 'express';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  bulkSyncTasks 
} from '../controllers/task.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// All task routes require authentication
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.post('/sync', bulkSyncTasks);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

export default router;
