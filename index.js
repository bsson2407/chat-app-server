import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import UserRouter from './routers/UserRouter.js';
import { connectDB } from './config/Database.js';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { ConnectSocket } from './config/Socket.js';
import ChatRouter from './routers/ChatRouter.js';
import GroupRouter from './routers/GroupRouter.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;
const io = ConnectSocket(server);
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded({ extended: false }));

// app.use(express.json({ extended: false }));

app.use('/user', UserRouter);
app.use('/chat', ChatRouter);
app.use('/group', GroupRouter);

server.listen(PORT, () => {
  console.log(`app run  on port ${PORT}`);
});
