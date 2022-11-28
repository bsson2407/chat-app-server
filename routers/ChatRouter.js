import express from 'express';
import {
  deleteMessageAllMe,
  deleteMessageOnlyMe,
  getAllConversation,
  getAllConversationByUser,
  getAllMessageByConversation,
  recallMessageApi,
  sendFile,
  sendMessage,
} from '../controllers/ChatController.js';

import { uploadFile, uploadImage } from '../utils/uploadFile.js';

const ChatRouter = express.Router();

ChatRouter.get('/', getAllConversation);
ChatRouter.get('/allmessage/:id', getAllMessageByConversation);
ChatRouter.get('/conver/:id', getAllConversationByUser);

ChatRouter.post('/message', sendMessage);

ChatRouter.post('/images', uploadImage.array('files', 5), sendFile);
ChatRouter.post('/file', uploadFile.single('file'), sendFile);
ChatRouter.post('/recall', recallMessageApi);
ChatRouter.post('/delete', deleteMessageOnlyMe);
ChatRouter.post('/deleteAll', deleteMessageAllMe);

export default ChatRouter;
