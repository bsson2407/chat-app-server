import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const FriendSchema = new Schema({
  idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  idConversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
});

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    otp: String,

    password: {
      type: String,
      required: true,
    },

    dateOfBirth: {
      type: Date,
      default: new Date('2000-01-01'),
    },
    gender: {
      type: Boolean,
      default: false,
    },

    cloudinary_id: String,
    isOnline: {
      type: Boolean,
      default: function () {
        return !this.deleted ? false : undefined;
      },
    },
    friends: [FriendSchema],
    myRequest: [FriendSchema],
    peopleRequest: [FriendSchema],
  },
  {
    timestamps: true,
  }
);

// UserSchema.statics.checkByIds = async (ids, message = 'User') => {
//   for (const idEle of ids) {
//     const user = await UserModel.findOne({
//       _id: idEle,
//     });

//     // if (!user) throw new NotFoundError(message);
//   }
// };

// UserSchema.statics.findByCredentials = async (email, password) => {
//   const user = await UserModel.findOne({
//     email,
//   });

//   if (!user) throw new Error('User');

//   const isPasswordMatch = await compare(password, user.password);
//   if (!isPasswordMatch) throw new MyError('Password invalid');

//   return user;
// };

export const UserModel = mongoose.model('User', UserSchema);
export const FriendModel = mongoose.model('Friend', FriendSchema);
