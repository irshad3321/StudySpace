import mongoose from 'mongoose';

const subtopicSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true
    },
    subtopics: {
      type: [subtopicSchema],
      default: []
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
      index: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      }
    }
  }
);

// Virtual id mapping for frontend consistency
taskSchema.virtual('id').get(function () {
  return this._id ? this._id.toString() : undefined;
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
