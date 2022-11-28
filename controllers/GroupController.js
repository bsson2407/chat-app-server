import { UserModel } from '../models/UserModel.js';
import { ConversationModel } from '../models/ConversationModel.js';
import { MessageModel } from '../models/MessageModel.js';
import cloudinary from '../config/Cloudinary.js';

export const addMemberToTheGroupApi = async (req, res, next) => {
  const { idConversation, newUserIds, userId } = req.body;
  console.log(2, idConversation);

  try {
    const conversation = await addMemberToTheGroup(
      idConversation,
      userId,
      newUserIds
    );
    res.json(conversation);
  } catch (error) {
    res.status(403).send(error.message);
  }
};

export const addMemberToTheGroup = async (
  conversationId,
  userId,
  newUserIds
) => {
  try {
    const updateCoversation = await ConversationModel.findOne({
      _id: conversationId,
    });

    const user = await UserModel.findOne({
      _id: userId,
    });

    for (const userId of newUserIds) {
      const newUser = await UserModel.findOne({
        _id: userId,
      });
      updateCoversation.members.push({ idUser: userId });
      const memberAddMessage = new MessageModel({
        sender: userId,
        idConversation: conversationId,
        message: `${user.name} đã thêm ${newUser.name} vào nhóm`,
        type: 'NOTIFY',
      });
      memberAddMessage.save().then((message) => {
        ConversationModel.updateOne(
          { _id: conversationId },
          { lastMessage: message._id }
        ).then();
      });
    }
    // const newUser = await UserModel.findOne({
    //   _id: newUserId,
    // });
    // updateCoversation.members.push({ idUser: newUserId });

    await updateCoversation.save();

    const conver = await ConversationModel.findOne({ _id: conversationId })
      .find({
        'members.idUser': { $in: userId },
      })
      .populate({
        path: 'members.idUser',
        select: { name: 1, avatar: 1 },
      })
      .sort({ members: -1 });
    // conver[0].push({ idConversation: conversationId });

    const conversation = conver[0];
    console.log(33, conversation);

    const _conver = { ...conversation._doc, idConversation: conversationId };
    console.log(111, _conver);

    return _conver;
  } catch (error) {
    console.log(error);
  }
};

export const deleteMemberToTheGroupApi = async (req, res, next) => {
  const { idConversation, deleteUserId, userId } = req.body;
  try {
    const conversation = await deleteMemberToTheGroup(
      idConversation,
      userId,
      deleteUserId
    );
    res.json(conversation);
  } catch (error) {
    res.status(403).send(error.message);
  }
};

export const deleteMemberToTheGroup = async (
  conversationId,
  userId,
  deleteUserId
) => {
  try {
    const updateCoversation = await ConversationModel.findOne({
      _id: conversationId,
    });

    if (`${updateCoversation.leaderId}` !== userId) return;
    updateCoversation.members = updateCoversation.members.filter(
      (x) => x.idUser != deleteUserId
    );

    // updateCoversation.members.fi
    // updateCoversation.members.splice(updateCoversation.members.indexOf(idUser))
    const user = await UserModel.findOne({ _id: userId });
    const deleteUser = await UserModel.findOne({ _id: deleteUserId });
    const deleteMemberMessage = new MessageModel({
      sender: userId,
      idConversation: conversationId,
      message: `${user.name} đã mời ${deleteUser.name} ra khỏi nhóm`,
      type: 'NOTIFY',
    });

    deleteMemberMessage.save().then((message) => {
      ConversationModel.updateOne(
        { _id: conversationId },
        { lastMessage: message._id }
      ).then();
    });
    await updateCoversation.save();

    const conver = await ConversationModel.findOne({ _id: conversationId })
      .find({
        'members.idUser': { $in: userId },
      })
      .populate({
        path: 'members.idUser',
        select: { name: 1, avatar: 1 },
      })
      .sort({ members: -1 });
    const conversation = conver[0];

    const _conver = {
      ...conversation._doc,
      idConversation: conversationId,
      deleteUserId,
    };
    return _conver;
  } catch (error) {
    console.log(error);
  }
  // conver[0].ad({ idConversation: conversationId });

  // return conver;
};

export const leaveGroupApi = async (req, res, next) => {
  const { userId, idConversation } = req.body;
  try {
    const conversation = await leaveGroup(idConversation, userId);
    res.json(conversation);
  } catch (err) {
    res.status(403).json(err.message);
  }
};

export const leaveGroup = async (conversationId, userId) => {
  try {
    const updateCoversation = await ConversationModel.findOne({
      _id: conversationId,
    });

    updateCoversation.members = updateCoversation.members.filter(
      (x) => x.idUser != userId
    );

    console.log(2, updateCoversation.members);
    if (`${updateCoversation.leaderId}` === userId) {
      updateCoversation.leaderId = updateCoversation.members[0].idUser;
    }

    // updateCoversation.members.fi
    // updateCoversation.members.splice(updateCoversation.members.indexOf(idUser))
    const userLeave = await UserModel.findOne({ _id: userId });
    // console.log(deleteUser);
    const leaveGroupMessage = new MessageModel({
      sender: userId,
      idConversation: conversationId,
      message: `${userLeave.name} đã rời khỏi nhóm`,
      type: 'NOTIFY',
    });

    leaveGroupMessage.save().then((message) => {
      ConversationModel.updateOne(
        { _id: conversationId },
        { lastMessage: message._id }
      ).then();
    });
    await updateCoversation.save();
    const conver = await ConversationModel.findOne({ _id: conversationId })
      .find({
        'members.idUser': { $in: `${updateCoversation.members[0].idUser}` },
      })
      .populate({
        path: 'members.idUser',
        select: { name: 1, avatar: 1 },
      })
      .sort({ members: -1 });

    const conversation = conver[0];
    // console.log(33, conversation);

    const _conver = { ...conversation._doc, idConversation: conversationId };
    console.log(111, _conver);

    return _conver;
  } catch (error) {
    console.log(error);
  }
  // console.log(77, updateCoversation.members[0].idUser);
  // console.log(78, conver);
  // return conver;
};

export const changeNameGroup = async (req, res, next) => {
  const { idConversation, nameGroup, idUser } = req.body;
  try {
    console.log(1);
    if (nameGroup !== '') {
      await ConversationModel.findByIdAndUpdate(
        {
          _id: idConversation,
        },
        {
          name: nameGroup,
        }
      );
    }
    const user = await UserModel.findById({ _id: idUser });
    console.log(2);

    const changeNameGroupMessage = new MessageModel({
      sender: idUser,
      idConversation: idConversation,
      message: `${user.name} đã đổi tên nhóm thành ${nameGroup}`,
      type: 'NOTIFY',
    });
    console.log(3);

    changeNameGroupMessage.save().then((message) => {
      ConversationModel.updateOne(
        { _id: idConversation },
        { lastMessage: message._id }
      ).then();
    });

    const conver = await ConversationModel.findOne({
      _id: idConversation,
    })
      .find({
        'members.idUser': { $in: `${idUser}` },
      })
      .populate({
        path: 'members.idUser',
        select: { name: 1, avatar: 1 },
      })
      .sort({ members: -1 });
    // console.log('conversation', conversation);

    const conversation = conver[0];

    const _conver = { ...conversation._doc, idConversation: idConversation };
    res.json(_conver);
  } catch (err) {
    res.status(401).json({ msg: err });
  }
};

export const createGroupApi = async (req, res, next) => {
  const { userIdSelf, userIds = [], nameGroup = ' ' } = req.body;
  try {
    if (userIds.length < 2) {
      res.status(403).json({ msg: 'Nhóm không được ít hơn 3 thành viên' });
    }
    const group = await createGroup(userIdSelf, nameGroup, userIds);
    res.json(group);
  } catch (error) {
    res.status(403).json(error.message);
  }
};

export const createGroup = async (userIdSelf, nameGroup, userIds) => {
  // kiểm tra user
  // await UserModel.checkByIds(userIdsTempt);
  try {
    const leader = await UserModel.findOne({ _id: userIdSelf });
    const avatar = [
      'https://www.shareicon.net/data/128x128/2016/06/30/788858_group_512x512.png',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScUkQ2wcawx7zyI8FBygDAuFv3Ouuyuw7q9A&usqp=CAU',
      'https://w7.pngwing.com/pngs/509/744/png-transparent-computer-icons-user-people-icon-miscellaneous-social-group-avatar-thumbnail.png',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKNZgJ-kraali9p7B5AYKo73p3MHXOlB197g&usqp=CAU',
      'https://w7.pngwing.com/pngs/901/452/png-transparent-computer-icons-users-group-avatar-computer-icons-users-group-avatar.png',
    ];

    const rand = avatar[Math.floor(Math.random() * avatar.length)];
    // thêm cuộc trò chuyện
    const newConversation = new ConversationModel({
      name: nameGroup,
      leaderId: userIdSelf,
      avatar: rand,
      members: [],
      type: 'group',
    });
    console.log(2);

    newConversation.members.push({ idUser: userIdSelf });
    for (const userId of userIds) {
      newConversation.members.push({ idUser: userId });
    }
    console.log(3);
    await newConversation.save();

    const memberAddMessage = new MessageModel({
      sender: userIdSelf,
      idConversation: newConversation._id,
      message: `${leader.name} đã tạo nhóm ${nameGroup}`,
      type: 'NOTIFY',
    });
    console.log(4);

    await memberAddMessage.save().then((message) => {
      ConversationModel.updateOne(
        { _id: newConversation._id },
        { lastMessage: message._id }
      ).then();
    });
    console.log(5);
    console.log('newConversation._id', newConversation._id);

    const conver = await ConversationModel.findOne({
      _id: `${newConversation._id}`,
    })
      .find({
        'members.idUser': { $in: `${userIdSelf}` },
      })
      .populate({
        path: 'members.idUser',
        select: { name: 1, avatar: 1 },
      })
      .sort({ members: -1 });
    // console.log('conversation', conversation);
    console.log(6);

    const conversation = conver[0];
    console.log(33, conversation);

    const _conver = {
      ...conversation._doc,
      idConversation: newConversation._id,
    };

    return _conver;
  } catch (error) {
    console.log(error);
  }
};

export const changeAvatarGroup = async (req, res) => {
  try {
    const { idConversation, idUser } = req.body;
    const conversatonExist = await ConversationModel.findById(idConversation);
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'zalo',
    });

    if (conversatonExist) {
      cloudinary.uploader.destroy(conversatonExist.cloudinary_id);

      conversatonExist.avatar = result.secure_url;
      conversatonExist.cloudinary_id = result.public_id;

      await conversatonExist.save();
      const user = await UserModel.findById({ _id: idUser });

      const changeAvatarGroupMessage = new MessageModel({
        sender: idUser,
        idConversation: idConversation,
        message: `${user.name} đã đổi ảnh nhóm`,
        type: 'NOTIFY',
      });

      changeAvatarGroupMessage.save().then((message) => {
        ConversationModel.updateOne(
          { _id: idConversation },
          { lastMessage: message._id }
        ).then();
      });

      const conver = await ConversationModel.findOne({
        _id: idConversation,
      })
        .find({
          'members.idUser': { $in: `${idUser}` },
        })
        .populate({
          path: 'members.idUser',
          select: { name: 1, avatar: 1 },
        })
        .sort({ members: -1 });
      // console.log('conversation', conversation);

      const conversation = conver[0];

      const _conver = { ...conversation._doc, idConversation: idConversation };
      res.json(_conver);
    } else {
      res.status(403).json({ msg: 'not group found' });
    }
  } catch (error) {
    res.json(error);
  }
};

export const deleteGroup = async (req, res, next) => {
  // kiểm tra user
  // await UserModel.checkByIds(userIdsTempt);
  try {
    if (!req.body.idConversation) {
      res.status(403).json({ msg: 'Chưa có idConversation' });
    }
    const conversatonExist = await ConversationModel.findById({
      _id: req.body.idConversation,
    });
    // const _member = conversatonExist.members;

    await ConversationModel.findByIdAndDelete({ _id: req.body.idConversation });
    await MessageModel.deleteMany({ idConversation: req.body.idConversation });

    res.json(conversatonExist);
  } catch (error) {
    res.json(error);
  }
};

export const changeLeader = async (req, res, next) => {
  try {
    const { idConversation, idNewLeader } = req.body;
    await ConversationModel.findByIdAndUpdate(
      { _id: idConversation },
      { leaderId: idNewLeader }
    );

    const newLeader = await UserModel.findById({ _id: idNewLeader });

    const changeLeaderMessage = new MessageModel({
      sender: idNewLeader,
      idConversation: idConversation,
      message: `${newLeader.name} đã trở thành trưởng nhóm`,
      type: 'NOTIFY',
    });
    console.log(4);

    await changeLeaderMessage.save().then((message) => {
      ConversationModel.updateOne(
        { _id: idConversation },
        { lastMessage: message._id }
      ).then();
    });
    console.log(5);

    const conver = await ConversationModel.findOne({
      _id: `${idConversation}`,
    })
      .find({
        'members.idUser': { $in: `${idNewLeader}` },
      })
      .populate({
        path: 'members.idUser',
        select: { name: 1, avatar: 1 },
      })
      .sort({ members: -1 });
    // console.log('conversation', conversation);
    console.log(6);

    const conversation = conver[0];
    console.log(47);

    const _conver = { ...conversation._doc, idConversation: idConversation };

    console.log(8);
    res.json(_conver);
  } catch (error) {
    res.status(400).json({ msg: 'thất bại' });
  }
};
