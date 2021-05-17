const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const { cloudinaryConfig } = require('../config/cloudinary');

cloudinaryConfig();
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'content',
  },
});

const multiStorage = new CloudinaryStorage({
  cloudinary,

  params: {
    folder: 'images',
  },
});
const parser = multer({
  // dest: __dirname + "../../uploads",
  storage,
});
const multiParser = multer({
  storage: multiStorage,
});
module.exports = {
  parser,
  multiParser,
};
