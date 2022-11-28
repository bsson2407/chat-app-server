import { ConversationModel } from '../models/ConversationModel.js';
import { MessageModel } from '../models/MessageModel.js';
import cloudinary from '../config/Cloudinary.js';
import path from 'path';

export const getAllConversation = async (req, res) => {
  const allConversation = await ConversationModel.find();
  res.json(allConversation);
};

export const getConversation = async (req, res) => {
  const conversation = await ConversationModel.find(req.params.id);
  res.json(conversation);
};

export const getAllConversationByUser = async (req, res) => {
  try {
    console.log(req.params.id);
    const list = await ConversationModel.find({
      'members.idUser': { $in: req.params.id },
    })
      .populate({
        path: 'members.idUser',
        select: { name: 1, avatar: 1 },
      })
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.send(list);
  } catch (error) {
    console.log(error);
  }
};

export const sendMessage = async (req, res, next) => {
  const { idSender, idConversation, message } = req.body;

  try {
    const newMessage = new MessageModel({
      idConversation: idConversation,
      sender: idSender,
      message: message,
      type: 'TEXT',
    });
    newMessage.seen.push(idSender);

    await newMessage.save();

    await updateLastMesssage({
      idConversation: newMessage.idConversation,
      message: newMessage._id,
    });

    // res.json(newMessage);

    res.json(newMessage);
  } catch (error) {
    res.status(403).json(error);
  }
};

export const recallMessageApi = async (req, res, next) => {
  const { _id } = req.body;
  try {
    const newMess = await recallMessage(_id);

    res.send(newMess);
  } catch (err) {
    res.json(err);
  }
};

export const recallMessage = async (_id) => {
  // const message = await MessageModel.findById(_id);
  try {
    const recallMessage = await MessageModel.findByIdAndUpdate(_id, {
      message: 'Đã thu hồi 1 tin nhắn',
      url: null,
      type: 'RECALL',
    });
    // console.log(3625, newMessage);
    // await newMessage.save();
    console.log(2523, recallMessage);

    return recallMessage;
  } catch (error) {
    console.log(error);
  }
};

export const deleteMessageOnlyMe = async (req, res, next) => {
  const { _id, userId } = req.body;
  try {
    const message = await MessageModel.findById(_id);
    const { deleteBy } = message;

    const index = deleteBy.findIndex((userIdele) => userIdele == userId);
    if (index !== -1) return;
    // await deleteMessageOnlyMe(_id, userId);
    await MessageModel.updateOne({ _id }, { $push: { deleteBy: userId } });
    // // await MessageModel.findByIdAndUpdate(_id, {
    // //   deleteBy: userId,
    // // });
    const messDelete = await MessageModel.findById(_id);

    console.log(4, messDelete);
    res.json(messDelete);
  } catch (err) {
    res.json(err);
  }
};

export const deleteMessageAllMe = async (req, res, next) => {
  const { idConversation, userId } = req.body;
  console.log(1, idConversation);
  console.log(2, userId);

  try {
    const allMessage = await MessageModel.find({
      idConversation: idConversation,
    });
    for (const idMessage of allMessage) {
      const { deleteBy, _id } = idMessage;
      console.log(3, _id);

      // const index = deleteBy.findIndex((userIdele) => userIdele == userId);
      // console.log(4, index);
      // if (index !== -1) return;
      await MessageModel.updateOne({ _id }, { $push: { deleteBy: userId } });
    }

    const allMessageNew = await MessageModel.find({
      idConversation: idConversation,
    });
    // await deleteMessageAllMe(idConversation, userId);
    console.log(allMessageNew);
    res.json(allMessageNew);
  } catch (err) {
    res.json(err);
  }
};

export const sendFile = async (req, res, next) => {
  const { idSender, idConversation } = req.body;
  console.log('idSender', req.body);
  console.log('idConversation', req.files);
  if (req.files) {
    console.log(1, req.files);
    console.log(2);
    // const result = null;
    const urlImage = [];
    for (const file of req.files) {
      // console.log(39, path.extname(file.originalname));
      const result = await cloudinary.v2.uploader.upload(file.path, {
        resource_type: 'auto',
        public_id: file.originalname,
      });
      console.log(41, result.url);
      urlImage.push(result.url);
    }
    try {
      const newMessage = new MessageModel({
        idConversation: idConversation,
        sender: idSender,
        urlImage: urlImage,
        message: 'Đã gửi 1 ảnh',
        type: 'IMAGE',
        isVisible: true,
      });
      newMessage.seen.push(idSender);

      await newMessage.save();
      await updateLastMesssage({
        idConversation: newMessage.idConversation,
        message: newMessage._id,
      });
      // await sendImage(result.url, idConversation, idSender);
      console.log(40, newMessage);
      res.json(newMessage);
    } catch (error) {
      res.status(403).json(error);
    }
  } else if (req.file) {
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      resource_type: 'auto',
      public_id: req.file.originalname,
    });
    const ext = path.extname(req.file.originalname);
    console.log(ext);

    try {
      const newMessage = new MessageModel({
        idConversation: idConversation,
        sender: idSender,
        urlLink: result.url,
        message: req.file.originalname,
        // type: 'FILE',
        isVisible: true,
      });
      newMessage.seen.push(idSender);

      if (
        ext === '.doc' ||
        ext === '.docx' ||
        ext === '.pdf' ||
        ext === '.csv' ||
        ext === '.txt' ||
        ext === '.rar' ||
        ext === '.zip'
      ) {
        console.log(1);
        newMessage.type = 'FILE';
        newMessage.message = req.file.originalname;
      } else if (
        ext === '.mp4' ||
        ext === '.avi' ||
        ext === '.flv' ||
        ext === '.mkv' ||
        ext === '.webm'
      ) {
        console.log(2);
        newMessage.message = 'Đã gửi 1 video';
        newMessage.type = 'VIDEO';
      }
      await newMessage.save();
      await updateLastMesssage({
        idConversation: newMessage.idConversation,
        message: newMessage._id,
      });
      res.json(newMessage);
    } catch (error) {
      res.status(403).json(error);
    }
  }
};

export const updateLastMesssage = async ({ idConversation, message }) => {
  console.log(idConversation, message);
  const conversation = await ConversationModel.findById(idConversation);
  conversation.lastMessage = message;
  await conversation.save();
};

export const getAllMessageByConversation = async (req, res) => {
  const allMessage = await MessageModel.find({ idConversation: req.params.id });

  res.send(allMessage);
};

export const getAllFriend = async (req, res) => {
  console.log(req.params.id);
  const data = await ConversationModel.aggregate({
    $match: { _id: req.params.id },
  });

  res.send(data);
};

export const seenMessage = async (idConversation, idUser) => {
  const _conversation = await ConversationModel.findById({
    _id: idConversation,
  });
  const _messageConver = await MessageModel.findById({
    _id: _conversation.lastMessage,
  });
  console.log(_messageConver);
  if (_messageConver.seen.includes(idUser)) {
    return;
  } else {
    _messageConver.seen.push(idUser);

    _messageConver.save();

    _conversation.lastMessage = _messageConver._id;
    _conversation.save();
  }
};
