import { UserModel } from '../models/UserModel.js';
import { generateToken } from '../utils/index.js';
import nodemailer from 'nodemailer';
import { ConversationModel } from '../models/ConversationModel.js';
import { MessageModel } from '../models/MessageModel.js';
import cloudinary from '../config/Cloudinary.js';

export const getUser = async (req, res) => {
  try {
    const users = await UserModel.find();
    res.send(users);
  } catch (error) {
    res.json(error);
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findOne({ _id: req.params.id });
    if (user) {
      res.send(user);
    } else {
      res.status(403).send({ message: 'user not found' });
    }
  } catch (err) {
    console.log(err);
  }
};

export const getConversationById = async (req, res) => {
  try {
    const { idConver, idUser } = req.body;
    console.log(10, idConver);
    console.log(11, idUser);

    const conver = await ConversationModel.findById({ _id: idConver })
      .find({
        'members.idUser': { $in: idUser },
      })
      .populate({
        path: 'members.idUser',
        select: { name: 1, avatar: 1 },
      })
      .sort({ members: -1 });
    if (conver) {
      res.send(conver);
    } else {
      res.status(403).json({ msg: 'conver not found' });
    }
  } catch (error) {
    res.json(error);
  }
};

export const getNewToken = async (req, res) => {
  try {
    const refeshToken = req.body;
    const userExists = await UserModel.findOne(refeshToken);
    if (userExists) {
      const tokens = generateToken(userExists);
      updateRefeshToken(userExists, tokens.refeshToken);
      res.json(tokens);
    } else {
      res.status(403).json({ msg: 'no refesh token' });
    }
  } catch (error) {
    res.json(error);
  }
};

export const UpdatePassword = async (req, res) => {
  try {
    const userExist = await UserModel.findOne({ email: req.body.email });
    if (userExist) {
      userExist.password = req.body.newPassword;
      await userExist.save();
      res.json({ msg: 'Cập nhật mật khẩu thành công' });
    } else {
      res.status(403).json({ msg: 'Email này chưa đăng kí tài khoản' });
    }
  } catch (error) {
    res.json(error);
  }
};

export const updateRefeshToken = (user, refeshToken) => {
  try {
    user.refeshToken = refeshToken;
    user.save();
  } catch (error) {
    console.log(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { dateOfBirth, name, gender, _id } = req.body;
    const userExist = await UserModel.findById(_id);
    const birth = new Date(dateOfBirth);
    if (userExist) {
      userExist.name = name;
      userExist.dateOfBirth = birth;
      userExist.gender = gender;
      await userExist.save();
      res.json(userExist);
    } else {
      res.status(403).json({ mesage: 'user not found' });
    }
  } catch (error) {
    res.json(error);
  }
};

export const login = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      res.status(400).json('Email chưa được đăng ký');
    } else {
      // const isPasswordMatch = compare(password, user.password);

      if (password !== user.password) {
        res.status(403).json('Sai mật khẩu');
      } else {
        const tokens = generateToken(user);
        updateRefeshToken(user, tokens.refeshToken);
        res.json({
          _id: user._id,
          name: user.name,
          password: user.password,
          avatar: user.avatar,
          isOnline: true,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          email: user.email,
          friends: user.friends,
          myRequest: user.myRequest,
          peopleRequest: user.peopleRequest,
          token: tokens.accessToken,
          refeshToken: tokens.refeshToken,
        });
      }
    }
  } catch (error) {
    res.json(error);
  }
};

export const register = async (req, res) => {
  try {
    const userExists = await UserModel.findOne({ email: req.body.email });
    const avatarNum = Math.floor(Math.random() * 101);

    if (userExists) {
      res.status(400).json('Email này đã đăng kí tài khoản');
    } else {
      const user = new UserModel(req.body);
      user.avatar = `https://robohash.org/${avatarNum}?set=set5`;
      await user.save();

      // const refeshToken = generateToken(user).refeshToken;
      // updateRefeshToken(user, refeshToken);

      res.status(200).send({
        _id: user._id,
        avatar: `https://robohash.org/${avatarNum}?set=set5`,
        name: user.name,
        password: user.password,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        otp: '',
      });
    }
  } catch (error) {
    res.json(error);
  }
};

export const sendMail = async (req, res) => {
  try {
    const email = req.body.email;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const adminEmail = 'bsson2407@gmail.com';
    const adminPassword = 'ufff ybbb knkx vayp';
    const userExist = await UserModel.findOne({ email: email });

    if (userExist) {
      countDownOtp(60000, userExist);
      userExist.otp = String(otp);

      await userExist.save();
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: adminEmail,
          pass: adminPassword,
        },
      });

      await transporter.sendMail({
        from: adminEmail,
        to: String(email),
        subject: 'GET CODE OTP',
        html: `<p>Your code is: ${otp}</p>`,
      });

      res.json({ message: 'send code to your email' });
    } else {
      res.status(403).json({ message: 'Email này chưa đăng kí tài khoản' });
    }
  } catch (error) {
    res.status(404).json({ message: 'Không gửi được' });
  }
};

export const checkCodeOtp = async (req, res) => {
  try {
    const userExist = await UserModel.findOne({ email: req.body.email });

    if (userExist) {
      if (req.body.otp === userExist.otp) {
        res.json('OTP đã đúng');
      } else {
        res.status(403).json('OTP không đúng');
      }
    } else {
      res.status(403).json('Email này chưa đăng kí tài khoản');
    }
  } catch (error) {
    res.json(error);
  }
};

function countDownOtp(time, user) {
  setTimeout(() => {
    user.otp = '';
    user.save();
  }, time);
}

export const Demo = async (req, res) => {
  return res.send('demo');
};

export const searchUser = async (req, res) => {
  // const { email } = req.body.email;
  try {
    if (req.body.email === '') {
      res.status(403).json('Chưa nhập email');
    }
    const user = await UserModel.findOne({ email: req.body.email });
    if (user) {
      res.send(user);
    } else {
      res.status(403).json('Email không đúng');
    }
  } catch (error) {
    res.json(error);
  }
};

export const getAllFriend = async (req, res) => {
  try {
    const list = await UserModel.findById(req.params.id).populate({
      path: 'friends.idUser',
      select: { name: 1, avatar: 1 },
    });

    res.send(list.friends);
  } catch (error) {
    res.json(error);
  }
};

export const getAllPeopleRequest = async (req, res) => {
  try {
    const list = await UserModel.findById(req.params.id).populate({
      path: 'peopleRequest.idUser',
      select: { name: 1, avatar: 1 },
    });
    res.send(list.peopleRequest);
  } catch (error) {
    res.json(error);
  }
};

export const changeAvatar = async (req, res) => {
  try {
    const userExist = await UserModel.findById(req.body._id);
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'zalo',
    });

    if (userExist) {
      cloudinary.uploader.destroy(userExist.cloudinary_id);

      userExist.avatar = result.secure_url;
      userExist.cloudinary_id = result.public_id;

      await userExist.save();
      res.json(userExist);
    } else {
      res.status(403).send({ mesage: 'user not found' });
    }
  } catch (error) {
    res.json(error);
  }
};

export const searchUserById = async (req, res) => {
  try {
    const user = await UserModel.findOne({ _id: req.body.id });
    if (user) {
      res.send(user);
    } else {
      res.status(403).send({ message: 'Email không đúng' });
    }
  } catch (error) {
    res.json(error);
  }
};

export const addFriendApi = async (req, res, next) => {
  const { userFrom, userTo } = req.body;
  try {
    await addFriend(userFrom, userTo);
    res.json('add friend success');
  } catch (error) {
    res.status(403).json('add friend failed');
  }
};

export const addFriend = async (userFrom, userTo) => {
  try {
    const userToAccount = await UserModel.findById(userTo);
    const userFromAccount = await UserModel.findById(userFrom);

    if (userToAccount && userFromAccount) {
      userToAccount.peopleRequest.push({ idUser: userFrom });
      userFromAccount.myRequest.push({ idUser: userTo });

      await userToAccount.save();
      await userFromAccount.save();
    }
  } catch (error) {
    console.log(error);
  }
};

export const deleteRequestFriend = async (userFrom, userTo) => {
  try {
    const userToAccount = await UserModel.findOne({ _id: userTo });
    const userFromAccount = await UserModel.findOne({ _id: userFrom });

    if (userToAccount && userFromAccount) {
      userFromAccount.myRequest = userFromAccount.myRequest.filter(
        (x) => x.idUser != userTo
      );
      userToAccount.peopleRequest = userToAccount.peopleRequest.filter(
        (x) => x.idUser != userFrom
      );

      await userFromAccount.save();
      await userToAccount.save();
    }
  } catch (error) {
    console.log(error);
  }
};

export const dontAcceptFriendApi = async (req, res, next) => {
  const { userId, idFriend } = req.body;
  // const userId = req.params.id;
  try {
    await dontAcceptFriend(userId, idFriend);
    res.json('accept friend success');
  } catch (error) {
    res.status(403).json('accept friend failed');
  }
};

export const dontAcceptFriend = async (userFrom, userTo) => {
  try {
    const userFromAccount = await UserModel.findOne({ _id: userFrom });
    const userToAccount = await UserModel.findOne({ _id: userTo });

    if (userFromAccount && userToAccount) {
      userFromAccount.peopleRequest = userFromAccount.peopleRequest.filter(
        (x) => x.idUser != userTo
      );

      userToAccount.myRequest = userToAccount.myRequest.filter(
        (x) => x.idUser != userFrom
      );

      await userFromAccount.save();
      await userToAccount.save();
    }
  } catch (error) {
    console.log(error);
  }
};

export const unFriend = async (req, res, next) => {
  // userFrom, userTo, idConversation;
  try {
    const { idUser, idFriend, idConversation } = req.body;
    console.log('idConversation', idConversation);
    const _conver = await ConversationModel.findById({ _id: idConversation });
    await ConversationModel.findByIdAndDelete(idConversation);
    await MessageModel.deleteMany({ idConversation: idConversation });

    const userAccount = await UserModel.findById({ _id: idUser });
    const friendAccount = await UserModel.findById({ _id: idFriend });

    if (userAccount && friendAccount) {
      userAccount.friends = userAccount.friends.filter(
        (x) => x.idUser != idFriend
      );

      friendAccount.friends = friendAccount.friends.filter(
        (x) => x.idUser != idUser
      );

      await userAccount.save();
      await friendAccount.save();
      console.log('_conver', _conver);
      res.json(_conver);
    }
  } catch (error) {
    res.json(error);
  }
};

export const acceptFriendApi = async (req, res, next) => {
  const { userId, userIdRequest } = req.body;
  // const userId = req.params.id;
  try {
    await acceptFriend(userId, userIdRequest);
    res.json('accept friend success');
  } catch (error) {
    res.status(403).json('accept friend failed');
  }
};

export const acceptFriend = async (userFrom, userTo) => {
  try {
    const userFromAccount = await UserModel.findOne({ _id: userFrom });
    const userToAccount = await UserModel.findOne({ _id: userTo });

    if (userFromAccount && userToAccount) {
      // ------------ CREATE NEW CONVERSATION
      const newConversation = new ConversationModel({
        type: 'single',
        members: [],
      });
      newConversation.members.push({ idUser: userFrom });
      newConversation.members.push({ idUser: userTo });
      await newConversation.save();

      // ------------ CODE LOGIC
      userFromAccount.peopleRequest = userFromAccount.peopleRequest.filter(
        (x) => x.idUser != userTo
      );
      userFromAccount.friends.push({
        idUser: userTo,
        idConversation: newConversation._id,
      });

      userToAccount.myRequest = userToAccount.myRequest.filter(
        (x) => x.idUser != userFrom
      );
      userToAccount.friends.push({
        idUser: userFrom,
        idConversation: newConversation._id,
      });

      await userFromAccount.save();
      await userToAccount.save();

      const { _id } = newConversation;
      console.log(2512, newConversation._id);

      const friendMessage = new MessageModel({
        sender: userFrom,
        message: 'Đã là bạn',
        idConversation: newConversation._id,
        type: 'NOTIFY',
      });

      friendMessage.save().then((message) => {
        ConversationModel.updateOne(
          { _id },
          { lastMessage: message._id }
        ).then();
      });
    }
  } catch (error) {
    console.log(error);
  }
};
