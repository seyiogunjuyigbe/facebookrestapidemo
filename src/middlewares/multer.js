const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const { cloudinaryConfig } = require('../config/cloudinary');

cloudinaryConfig();
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'media',
    resource_type: file.mimetype.includes('image') ? 'image' : 'video',
  }),
});

module.exports = multer({
  storage,
});
