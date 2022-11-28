import mongoose from 'mongoose';
// const dotenv = require('dotenv');
import dotenv from 'dotenv';
dotenv.config();
// console.log(require('dotenv').config());
// const url = process.env.CONNECT_DB;
const url = process.env.URL_DB;
// .CONNECT_DB;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// module.exports.ConnectToDatabase = function () {
//   try {
//     return mongoose.connect(url);
//   } catch (error) {
//     console.log(error);
//   }
// };

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(url, options);
    console.log(`mongo database is connected!!! ${conn.connection.host} `);
  } catch (error) {
    console.error(`Error: ${error} `);
    console.log(url);
    process.exit(1); //passing 1 - will exit the proccess with error
  }
};
