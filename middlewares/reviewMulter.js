const multer = require('multer');
const path = require('path');

// Set up storage for image uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/reviews/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}_${file.originalname}`);
//   }
// });

// const upload = multer({ storage: storage });
const uploadreview = function () {
  const storage = multer.diskStorage({
    destination: "./public/img/reviewImages",
    filename: (req, file, cb) => {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });
  const fileFilter = (req, file, cb) => {
    const allowedMineType = ["image/jpg", "image/png", "image/jpeg"];
    if (allowedMineType.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, and GIF files are allowed."
        ),
        false
      );
    }
  };

  const uploadreview = multer({
    storage: storage,
    limits: { fileSize: 5000000 },
    fileFilter: fileFilter,
  }).array("reviewImage",3);
  return uploadreview;
};

module.exports = { uploadreview };