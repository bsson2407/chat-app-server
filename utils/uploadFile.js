import path from 'path';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();
const FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE);

export const upload = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);

    if (
      ext !== '.jpg' &&
      ext !== '.jpeg' &&
      ext !== '.png' &&
      ext !== '.PNG' &&
      ext !== '.mp4' &&
      ext !== '.avi' &&
      ext !== '.flv' &&
      ext !== '.mkv'
    ) {
      cb(new Error('file type is not supported'));
      return;
    }
    cb(null, true);
  },
});

export const uploadFile = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    console.log(ext);
    if (
      ext !== '.mp4' &&
      ext !== '.avi' &&
      ext !== '.flv' &&
      ext !== '.mkv' &&
      ext !== '.webm' &&
      ext !== '.doc' &&
      ext !== '.docx' &&
      ext !== '.pdf' &&
      ext !== '.csv' &&
      ext !== '.txt' &&
      ext !== '.rar' &&
      ext !== '.zip'
    ) {
      console.log(11);

      cb(new Error('file type is not supported'));
      return;
    }
    console.log(12);

    cb(null, true);
  },
  limits: { fileSize: FILE_SIZE },
});

export const uploadImage = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    console.log(file);
    console.log('file', file.fileSize);

    let ext = path.extname(file.originalname);
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.PNG') {
      cb(new Error('file type is not supported'));
      return;
    }

    cb(null, true);
  },
  limits: (file) => {
    console.log('file', file.fileSize);
  },
  limits: { fileSize: FILE_SIZE },
});

// let multipleUploadMiddleware = util.promisify(uploadManyFiles);
