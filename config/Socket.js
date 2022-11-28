import { Server } from 'socket.io';
import { recallMessage } from '../controllers/ChatController.js';
import {
  acceptFriend,
  addFriend,
  deleteRequestFriend,
  dontAcceptFriend,
} from '../controllers/UserController.js';

export var io = undefined;
let users = [];
// let socke = [];

export const ConnectSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'OPTION'],
      allowedHeaders: ['my-custom-header'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);

    //------ADD FRIEND------
    socket.on('join_room', (User) => {
      try {
        users.push({
          id: User._id,
          socketId: socket.id,
          friends: User.friends,
          name: User.name,
        });

        users = users.filter((item) => item.id !== undefined);
      } catch (error) {
        console.log('join_room', error);
      }
    });
    socket.on('disconnect', () => {
      try {
        console.log(`${socket.id} disconnected`);

        const data = users.find((user) => user.socketId === socket.id);

        if (data) {
          let clients = users.filter((user) =>
            data.friends.find((item) => item._id === user.id)
          );
          clients = clients.map((friend) => {
            const { friends, ...other } = friend;
            return other;
          });

          if (clients.length > 0) {
            clients.forEach((client) => {
              const { friends, ...other } = data;
              socket.to(`${client.socketId}`).emit('CheckUserOffline', other);
            });
          }
          if (data.call) {
            const callUser = users.find((user) => user.id === data.call);
            if (callUser) {
              users = EditData(users, callUser.id, null);
              socket.to(`${callUser.socketId}`).emit('callerDisconnect');
            }
          }
        }
        users = users.filter((user) => user.socketId !== socket.id);
      } catch (error) {
        console.log('disconnect', error);
      }
    });

    socket.on('requestAddFriend', async (data) => {
      try {
        const { userFrom, userTo } = data;
        console.log(data);
        console.log(users);
        const client = users.find((user) => user.id === userTo);
        const clients = users.find((user) => user.id === userFrom);

        console.log('clients1', clients);

        await addFriend(userFrom, userTo);

        if (client) {
          io.to(`${client.socketId}`).emit('requestAddFriendToClient', data);
        }
        if (clients) {
          console.log('clients');
          io.to(`${clients.socketId}`).emit('requestAddFriendToClient', data);
        }
      } catch (error) {
        console.log('requestAddFriend', error);
      }
    });

    socket.on('acceptAddFriend', async (data) => {
      try {
        const { userFrom, userTo } = data;

        const client = users.find((user) => user.id === userTo);
        const clients = users.find((user) => user.id === userFrom);

        await acceptFriend(userFrom, userTo);

        if (client) {
          io.to(`${client.socketId}`).emit('acceptAddFriendToClient', data);
        }
        if (clients) {
          io.to(`${clients.socketId}`).emit('acceptAddFriendToClient', data);
        }
      } catch (error) {
        console.log('acceptAddFriend', error);
      }
    });

    socket.on('deniedAddFriend', async (data) => {
      try {
        const { userFrom, userTo } = data;

        const client = users.find((user) => user.id === userTo);
        const clients = users.find((user) => user.id === userFrom);
        await dontAcceptFriend(userFrom, userTo);

        if (client) {
          io.to(`${client.socketId}`).emit('deniedAddFriendToClient', data);
        }

        if (clients) {
          io.to(`${clients.socketId}`).emit('deniedAddFriendToClient', data);
        }
      } catch (error) {
        console.log('deniedAddFriend', error);
      }
    });

    socket.on('cancelRequestAddFriend', async (data) => {
      try {
        const { userFrom, userTo } = data;

        const client = users.find((user) => user.id === userTo);
        const clients = users.find((user) => user.id === userFrom);
        await deleteRequestFriend(userFrom, userTo);

        if (client) {
          io.to(`${client.socketId}`).emit(
            'cancelRequestAddFriendToClient',
            data
          );
        }
        if (clients) {
          io.to(`${clients.socketId}`).emit(
            'cancelRequestAddFriendToClient',
            data
          );
        }
      } catch (error) {
        console.log('cancelRequestAddFriend', error);
      }
    });

    socket.on('unFriend', (data) => {
      console.log('unFriend', data);
      try {
        data.members.forEach((element, index) => {
          const client = users.find((u) => u.id === element.idUser);
          console.log('client', client);
          client && io.to(`${client.socketId}`).emit('unFriendToClient', data);
        });
        return;
      } catch (error) {
        console.log('unFriend', error);
      }
    });

    // --------------- GROUP
    socket.on('createGroup', (data) => {
      try {
        console.log('createGroup', data);
        const { members, ...other } = data;
        // console.log(other)
        members.forEach((element, index) => {
          console.log('users', users);

          const user = users.find((user1) => user1.id === element.idUser._id);
          user && io.to(`${user.socketId}`).emit('createGroupToClient', data);
        });
      } catch (error) {
        console.log('createGroup', error);
      }
    });

    socket.on('addMemberToGroup', (data) => {
      try {
        const list = data.members;
        // .concat(member)
        // .filter((a) => a._id !== user._id);

        list.forEach((element, index) => {
          const client = users.find((u) => u.id === element.idUser._id);
          client &&
            io.to(`${client.socketId}`).emit('addMemberToGroupToClient', data);
        });
      } catch (error) {
        console.log('addMemberToGroup', error);
      }
    });

    socket.on('deleteGroup', (data) => {
      try {
        const list = data.members;
        // .concat(member)
        // .filter((a) => a._id !== user._id);
        console.log('deleteGroup', list);

        list.forEach((element, index) => {
          console.log('idUser', element.idUser);
          console.log('users', users);

          const client = users.find((u) => {
            console.log('id', u.id);
            return u.id === element.idUser;
          });
          console.log(client);
          client &&
            io.to(`${client.socketId}`).emit('deleteGroupToClient', data);
        });
      } catch (error) {
        console.log('deleteGroup', error);
      }
    });

    socket.on('leaveGroup', (data) => {
      // const { conversation, userId } = data;
      try {
        console.log('leaveGroup', data);

        // const list = conversation.members.filter((u) => u.idUser._id !== userId);
        data.members.forEach((element, index) => {
          console.log(230, users);

          const client = users.find((user) => {
            return user.id === element.idUser._id;
          });

          console.log(236, client);
          client &&
            io.to(`${client.socketId}`).emit('leaveGroupToClient', data);
        });
      } catch (error) {
        console.log('leaveGroup', error);
      }
    });

    socket.on('kickMemberOutGroup', (data) => {
      try {
        console.log('kickMemberOutGroup', data);

        const { members, deleteUserId } = data;

        const deleteUser = users.find((u) => u.id === deleteUserId);
        deleteUser &&
          io
            .to(`${deleteUser.socketId}`)
            .emit('kickMemberOutGroupToDeleteUser', deleteUserId);
        members.forEach((element, index) => {
          const client = users.find((u) => u.id === element.idUser._id);
          console.log(256, client);
          client &&
            io
              .to(`${client.socketId}`)
              .emit('kickMemberOutGroupToClient', data);
        });
      } catch (error) {
        console.log('kickMemberOutGroup', error);
      }
    });

    socket.on('changeNameGroup', (data) => {
      try {
        console.log('changeNameGroup', data);
        const list = data.members;

        list.forEach((element, index) => {
          const client = users.find((u) => u.id === element.idUser._id);
          client &&
            io.to(`${client.socketId}`).emit('changeNameGroupToClient', data);
        });
      } catch (error) {
        console.log('changeNameGroup', error);
      }
    });

    socket.on('changeAvatarGroup', (data) => {
      try {
        console.log('changeAvatarGroup', data);
        const list = data.members;
        // .concat(member)
        // .filter((a) => a._id !== user._id);

        list.forEach((element, index) => {
          const client = users.find((u) => u.id === element.idUser._id);
          client &&
            io.to(`${client.socketId}`).emit('changeAvatarGroupToClient', data);
        });
      } catch (error) {
        console.log('changeAvatarGroup', error);
      }
    });

    // --------------- CHAT

    socket.on('join_all_conversation', (array) => {
      socket.join(array);
    });

    const EditData = (data, id, call) => {
      const newData = data.map((item) =>
        item.id === id ? { ...item, call } : item
      );
      return newData;
    };

    socket.on('callUser', async (data) => {
      try {
        users = EditData(users, data.sender, data.recipient);
        const client = users.find((user) => user.id === data.recipient);
        if (client) {
          if (client.call) {
            socket.emit('userBusy', data);
            users = EditData(users, data.sender, null);
          } else {
            users = EditData(users, data.recipient, data.sender);
            socket.to(`${client.socketId}`).emit('callUserToClient', data);
          }
        }
      } catch (error) {
        console.log('callUser', error);
      }
    });

    socket.on('endCall', (data) => {
      try {
        const client = users.find((user) => user.id === data.sender);
        if (client) {
          socket.to(`${client.socketId}`).emit('endCallToClient', data);
          users = EditData(users, client.id, null);
          if (client.call) {
            const clientCall = users.find((user) => user.id === client.call);
            clientCall &&
              socket.to(`${clientCall.socketId}`).emit('endCallToClient', data);
            users = EditData(users, client.call, null);
          }
        }
      } catch (error) {
        console.log('endCall', error);
      }
    });

    socket.on('changeGroupName', (data) => {
      try {
        const { conversation, idConversation } = data;
        conversation.members.forEach((element, index) => {
          const user = users.find((user1) => user1.id === element.idUser._id);
          user &&
            socket
              .to(`${user.socketId}`)
              .emit('changeGroupNameToClient', idConversation);
        });
        return;
      } catch (error) {
        console.log('changeGroupName', error);
      }
    });
    socket.on('changeLeader', (data) => {
      try {
        console.log('changeLeader');
        data.members.forEach((element, index) => {
          const user = users.find((user1) => user1.id === element.idUser._id);
          user &&
            socket.to(`${user.socketId}`).emit('changeLeaderToClient', data);
        });
        return;
      } catch (error) {
        console.log('changeLeader', error);
      }
    });

    socket.on('recall_user', async (data) => {
      console.log(data);
      const recallMessages = await recallMessage(data);
      console.log(333, recallMessages);
      io.to(recallMessages.idConversation.toString()).emit(
        'recall_message',
        recallMessages
      );
    });

    socket.on('join_conversation', (idConversation) => {
      console.log(23, idConversation);
      socket.join(idConversation);
    });

    socket.on('sendMessage', (data) => {
      try {
        console.log('sendMessage', data);
        io.to(data.idConversation).emit('newMessage', data);
      } catch (error) {
        console.log('sendMessage', error);
      }
    });

    socket.on('seenMessage', async (data) => {
      try {
        console.log('seenMessage', data);
        const { idUser, idConversation } = data;
        await seenMessage(idConversation, idUser);
        io.to(idConversation).emit('seenMessageToClient', data);
      } catch (error) {
        console.log('seenMessage', error);
      }
    });
  });
};
