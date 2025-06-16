const router = require("express").Router();
const authorization = require("../middleware/user-authorization");
const multerUpload = require("../middleware/upload-data");
const noteController = require("../controllers/note");

router.use(authorization);

router.post(
  "/new",
  multerUpload.fields([{ name: "audioRecording" }, { name: "images" }]),
  noteController.newNote
);

router.get("/get", noteController.getNote);

router.get("/get-all", noteController.getAllNotes);

router.get("/get-audio-recording", noteController.getAudioRecording);

router.patch("/update", noteController.updateNote);

router.patch(
  "/upload-image",
  multerUpload.fields([{ name: "image", maxCount: 1 }]),
  noteController.uploadImage
);

router.delete("/delete-image", noteController.deleteImage);

router.delete("/delete", noteController.deleteNote);

router.delete("/delete-all", noteController.deleteAllNotes);

module.exports = router;
