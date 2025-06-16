const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { type: String, enum: ["text", "audio"], default: "text" },
    heading: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    audioRecording: { type: String, required: false },
    audioDuration: { type: Number, default: null },
    images: { type: [String], default: [] },
    imageCount: { type: Number, default: null },
    isFavourite: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const noteModel = mongoose.model("Note", noteSchema);

module.exports = noteModel;
