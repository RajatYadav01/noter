require("dotenv").config({ path: [".env", ".env.example"] });
const { promisify } = require("util");
const fs = require("fs");
const unlinkAsync = promisify(fs.unlink);
const Note = require("../models/note");

const newNote = async (request, response) => {
  try {
    const {
      userID,
      type,
      heading,
      content,
      audioDuration,
      imageCount,
      createdAt,
      updatedAt,
    } = request.body;

    const audioRecordingPath = request.files["audioRecording"]
      ? request.files["audioRecording"][0].path
      : null;
    const imagesPaths = request.files["images"]
      ? request.files["images"].map((image) => image.path)
      : [];
    const note = await Note.find({
      userID: userID,
      type: type,
      heading: heading,
      content: content,
      audioRecording: audioRecordingPath,
      audioDuration: audioDuration,
      images: imagesPaths,
      imageCount: imageCount,
      createdAt: createdAt,
      updatedAt: updatedAt,
    });
    if (note.length !== 0) {
      await unlinkAsync(audioRecordingPath);
      imagesPaths.forEach(async (image) => {
        await unlinkAsync(image);
      });
      return response.status(409).json({
        message: "Note with the given details already exists",
      });
    }

    const newNote = new Note({
      userID: userID,
      type: type,
      heading: heading,
      content: content,
      audioRecording: audioRecordingPath,
      audioDuration: audioDuration,
      images: imagesPaths,
      imageCount: imageCount,
      createdAt: createdAt,
      updatedAt: updatedAt,
    });
    await newNote.save();

    return response.status(201).json({
      message: "Note created successfully",
    });
  } catch (error) {
    const audioRecordingPath = request.files["audioRecording"]
      ? request.files["audioRecording"][0].path
      : null;
    const imagesPaths = request.files["images"]
      ? request.files["images"].map((image) => image.path)
      : [];
    if (audioRecordingPath) await unlinkAsync(audioRecordingPath);
    if (imagesPaths)
      imagesPaths.forEach(async (image) => {
        await unlinkAsync(image);
      });
    console.error(error.message);
    return response.status(500).json({ message: "Internal server error" });
  }
};

const getNote = async (request, response) => {
  try {
    const { id } = request.query;
    const note = await Note.findOne({ _id: id });
    if (note.length === 0)
      return response.status(404).json({
        message: "Note not found",
      });

    const audioURL = note.audioRecording
      ? `${request.protocol}://${request.get("host")}/${note.audioRecording}`
      : null;

    const imagesURLs = note.images.map((image) => {
      return `${request.protocol}://${request.get("host")}/${image}`;
    });

    const updatedNote = {
      ...note._doc,
      audioRecording: audioURL,
      images: imagesURLs,
    };

    return response.status(200).json({ note: updatedNote });
  } catch (error) {
    console.error(error.message);
    return response.status(500).json({ message: "Internal server error" });
  }
};

const getAllNotes = async (request, response) => {
  try {
    const { id } = request.query;
    const notes = await Note.find({ userID: id }).sort({ createdAt: -1 });
    if (notes.length === 0)
      return response.status(204).json({
        message: "No note exists in the database",
      });

    const updatedNotes = notes.map((note) => {
      const audioURL = note.audioRecording
        ? `${request.protocol}://${request.get("host")}/${note.audioRecording}`
        : null;

      const imagesURLs = note.images.map((image) => {
        return `${request.protocol}://${request.get("host")}/${image}`;
      });

      return (note = {
        ...note._doc,
        audioRecording: audioURL,
        images: imagesURLs,
      });
    });

    return response.status(200).json({ notes: updatedNotes });
  } catch (error) {
    console.error(error.message);
    return response.status(500).json({ message: "Internal server error" });
  }
};

const getAudioRecording = async (request, response) => {
  try {
    const { id } = request.query;

    const note = await Note.findById(id);
    if (!note)
      return response.status(404).json({
        message: "Audio recording not found",
      });

    response.set("Content-Type", "audio");
    response.set(
      "Content-Disposition",
      `attachment; filename=${note.audioRecording.split("audio/", 2)[1]}`
    );

    return fs.createReadStream(note.audioRecording).pipe(response);
  } catch (error) {
    console.error(error.message);
    return response.status(500).json({ message: "Internal server error" });
  }
};

const updateNote = async (request, response) => {
  try {
    const { id, heading, content, isFavourite } = request.body;
    const note = await Note.findOne({ _id: id });
    if (note.length === 0)
      return response.status(404).json({
        message: "Note not found",
      });

    const newNoteDetails = {
      heading: heading,
      content: content,
      isFavourite: isFavourite,
      updatedAt: Date.now(),
    };
    Object.keys(newNoteDetails).forEach(
      (i) => newNoteDetails[i] === "" && delete newNoteDetails[i]
    );

    let updatedNote = await Note.findOneAndUpdate({ _id: id }, newNoteDetails, {
      new: true,
    });

    const audioURL = updatedNote.audioRecording
      ? `${request.protocol}://${request.get("host")}/${note.audioRecording}`
      : null;

    const imagesURLs = updatedNote.images.map((image) => {
      return `${request.protocol}://${request.get("host")}/${image}`;
    });

    updatedNote = {
      ...updatedNote._doc,
      audioRecording: audioURL,
      images: imagesURLs,
    };

    return response.status(201).json({
      message: "Note details updated successfully",
      note: updatedNote,
    });
  } catch (error) {
    console.error(error.message);
    return response.status(500).json({ message: "Internal server error" });
  }
};

const uploadImage = async (request, response) => {
  try {
    const { id } = request.body;

    const note = await Note.find({
      _id: id,
    });
    if (note.length === 0) {
      await unlinkAsync(request.files["image"][0].path);
      return response.status(404).json({
        message: "Note not found",
      });
    }

    const imagePath = request.files["image"]
      ? request.files["image"][0].path
      : null;

    let updatedNote = await Note.findOneAndUpdate(
      { _id: id },
      {
        $push: { images: imagePath },
        $inc: { imageCount: 1 },
        updatedAt: Date.now(),
      },
      { new: true }
    );

    const audioURL = updatedNote.audioRecording
      ? `${request.protocol}://${request.get("host")}/${note.audioRecording}`
      : null;

    const imagesURLs = updatedNote.images.map((image) => {
      return `${request.protocol}://${request.get("host")}/${image}`;
    });

    updatedNote = {
      ...note._doc,
      audioRecording: audioURL,
      images: imagesURLs,
    };

    return response.status(201).json({
      message: "Image uploaded successfully",
      note: updatedNote,
    });
  } catch (error) {
    const imagePath = request.files["image"]
      ? request.files["image"][0].path
      : null;
    if (imagePath) await unlinkAsync(imagePath);
    console.error(error.message);
    return response.status(500).json({ message: "Internal server error" });
  }
};

const deleteImage = async (request, response) => {
  try {
    const { id, image } = request.query;
    const note = await Note.findOne({ _id: id });
    if (note.length === 0)
      return response.status(404).json({
        message: "Note not found",
      });

    if (note.images.length !== 0)
      note.images.forEach(async (imagePath) => {
        if (imagePath === image.split(process.env.BACKEND_HOST_URL, 2)[1])
          await unlinkAsync(imagePath);
      });

    let updatedNote = await Note.findOneAndUpdate(
      { _id: id },
      {
        $pull: { images: image.split(process.env.BACKEND_HOST_URL, 2)[1] },
        $inc: { imageCount: -1 },
        updatedAt: Date.now(),
      },
      { new: true }
    );

    const audioURL = updatedNote.audioRecording
      ? `${request.protocol}://${request.get("host")}/${note.audioRecording}`
      : null;

    const imagesURLs = updatedNote.images.map((image) => {
      return `${request.protocol}://${request.get("host")}/${image}`;
    });

    updatedNote = {
      ...note._doc,
      audioRecording: audioURL,
      images: imagesURLs,
    };

    return response.status(200).json({
      message: "Image deleted successfully",
      note: updatedNote,
    });
  } catch (error) {
    console.error(error.message);
    return response.status(500).json({ message: "Internal server error" });
  }
};

const deleteNote = async (request, response) => {
  try {
    const { id } = request.query;
    const note = await Note.findOne({ _id: id });
    if (note.length === 0)
      return response.status(404).json({
        message: "Note not found",
      });

    if (note.audioRecording) await unlinkAsync(note.audioRecording);
    if (note.images.length !== 0)
      note.images.forEach(async (image) => {
        await unlinkAsync(image);
      });

    await Note.findByIdAndDelete(id);

    return response.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error(error.message);
    return response.status(500).json({ message: "Internal server error" });
  }
};

const deleteAllNotes = async (request, response) => {
  try {
    const { userID } = request.query;
    const notes = await Note.find({ userID: userID });
    if (notes.length === 0)
      return response.status(404).json({
        message: "Note not found",
      });

    notes.forEach(async (note) => {
      if (note.audioRecording) await unlinkAsync(note.audioRecording);
      if (note.images.length !== 0)
        note.images.forEach(async (image) => {
          await unlinkAsync(image);
        });
    });

    await Note.deleteMany({ userID: userID });

    return response.status(200).json({
      message: "All notes deleted successfully",
    });
  } catch (error) {
    console.error(error.message);
    return response.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  newNote,
  uploadImage,
  getNote,
  getAllNotes,
  getAudioRecording,
  updateNote,
  uploadImage,
  deleteImage,
  deleteNote,
  deleteAllNotes,
};
