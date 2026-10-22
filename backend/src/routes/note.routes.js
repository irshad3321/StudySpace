import { Router } from 'express';
import { 
  getNotes, 
  createNote, 
  updateNote, 
  deleteNote, 
  bulkSyncNotes 
} from '../controllers/note.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// All note routes require authentication
router.use(protect);

router.route('/')
  .get(getNotes)
  .post(createNote);

router.post('/sync', bulkSyncNotes);

router.route('/:id')
  .put(updateNote)
  .delete(deleteNote);

export default router;
