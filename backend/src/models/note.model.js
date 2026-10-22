import mongoose from 'mongoose';

const noteItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
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

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a note title'],
      trim: true,
      default: 'Untitled Note'
    },
    content: {
      type: String,
      default: ''
    },
    items: {
      type: [noteItemSchema],
      default: []
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    color: {
      type: String,
      default: 'indigo', // indigo | emerald | amber | rose | violet | cyan
      trim: true
    },
    isPinned: {
      type: Boolean,
      default: false
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
noteSchema.virtual('id').get(function () {
  return this._id ? this._id.toString() : undefined;
});

const Note = mongoose.model('Note', noteSchema);

export default Note;
