const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = file.mimetype.startsWith("audio") ? "audio" : "images";
    cb(null, `./data/uploads/${folder}`);
  },
  filename: function (req, file, cb) {
    let currentDate = new Date();
    let currentTimestamp =
      currentDate.getDate() +
      "-" +
      (currentDate.getMonth() + 1) +
      "-" +
      currentDate.getFullYear() +
      "@" +
      currentDate.getHours() +
      ":" +
      currentDate.getMinutes() +
      ":" +
      currentDate.getSeconds();
    const uniquePrefix = req.body.userID + "@" + currentTimestamp;
    cb(null, `${uniquePrefix}-${file.originalname}`);
  },
});

module.exports = multer({ storage: storage });
