import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// const User = new Schema({
//   idUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
// });

const MessageSchema = new Schema(
  {
    idConversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    urlImage: [
      {
        type: String,
        default: '',
      },
    ],
    urlLink: {
      type: String,
      default: '',
    },
    deleteBy: {
      type: [mongoose.Types.ObjectId],
      default: [],
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: {
      type: String,
      default: '',
    },
    seen: {
      type: [String],
      default: [],
    },
    type: {
      type: String,
      enum: ['TEXT', 'IMAGE', 'VIDEO', 'FILE', 'NOTIFY', 'RECALL'],
    },
    call: {
      type: Object,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const MessageModel = mongoose.model('Message', MessageSchema);
