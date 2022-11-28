import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

// const User = new Schema({
//   idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// });

const ConversationSchema = new Schema(
  {
    type: String,
    avatar: String,
    leaderId: ObjectId,
    name: String,
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    members: [
      { idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } },
    ],
    cloudinary_id: String,
  },
  {
    timestamps: true,
  }
);

export const ConversationModel = mongoose.model(
  'Conversation',
  ConversationSchema
);
