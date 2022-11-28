import express from 'express';
import {
  acceptFriendApi,
  addFriendApi,
  changeAvatar,
  checkCodeOtp,
  Demo,
  getAllFriend,
  getAllPeopleRequest,
  getConversationById,
  getNewToken,
  getUser,
  getUserById,
  login,
  register,
  searchUser,
  searchUserById,
  sendMail,
  unFriend,
  UpdatePassword,
  updateProfile,
} from '../controllers/UserController.js';
import { upload } from '../utils/uploadFile.js';

const UserRouter = express.Router();
UserRouter.get('/', getUser);
UserRouter.get('/conver', getConversationById);

UserRouter.get('/demo', Demo);

UserRouter.post('/login', login);
UserRouter.post('/register', register);
UserRouter.post('/sendmail', sendMail);
UserRouter.post('/checkotp', checkCodeOtp);
UserRouter.post('/search', searchUser);

UserRouter.get('/getAllFriend/:id', getAllFriend);
UserRouter.get('/getAllPeopleRequest/:id', getAllPeopleRequest);

UserRouter.post('/invite', addFriendApi);
UserRouter.post('/update', updateProfile);
UserRouter.post('/friend', acceptFriendApi);
UserRouter.post('/unfriend', unFriend);

UserRouter.post('/updatepassword', UpdatePassword);
UserRouter.post('/getnewtoken', getNewToken);
UserRouter.patch('/avatar', upload.single('image'), changeAvatar);
UserRouter.post('/searchId', searchUserById);
UserRouter.get('/me/:id', getUserById);

export default UserRouter;
