import express from 'express';
import {
  addMemberToTheGroupApi,
  changeAvatarGroup,
  changeLeader,
  changeNameGroup,
  createGroupApi,
  deleteGroup,
  deleteMemberToTheGroupApi,
  leaveGroupApi,
} from '../controllers/GroupController.js';
import { upload } from '../utils/uploadFile.js';

const GroupRouter = express.Router();

GroupRouter.post('/addmembers', addMemberToTheGroupApi);
GroupRouter.post('/delmembers', deleteMemberToTheGroupApi);
GroupRouter.post('/leave', leaveGroupApi);
GroupRouter.post('/changename', changeNameGroup);
GroupRouter.post('/create', createGroupApi);
GroupRouter.post('/delete', deleteGroup);
GroupRouter.post('/changeavatar', upload.single('image'), changeAvatarGroup);
GroupRouter.post('/changeleader', changeLeader);

//
export default GroupRouter;
