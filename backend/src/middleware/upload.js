const multer = require('multer');

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new Error('Resume must be a PDF or Word document (.pdf, .doc, .docx)');
      err.statusCode = 400;
      err.code = 'INVALID_FILE_TYPE';
      cb(err);
    }
  },
});

module.exports = upload;
