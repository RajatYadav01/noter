import { describe, test, expect } from "vitest";
import {
  newNote,
  getNote,
  getAllNotes,
  getAudioRecording,
  updateNote,
  uploadImage,
  deleteImage,
  deleteNote,
  deleteAllNotes,
} from "./Note";

describe("Note API service", () => {
  test("creates a new note", async () => {
    const formData = new FormData();
    formData.append("title", "Test Note");

    const message = await newNote(formData);
    expect(message).toBe("Note created successfully");
  });

  test("retrieves a single note", async () => {
    const note = await getNote("abc123");
    expect(note).toHaveProperty("_id", "abc123");
  });

  test("retrieves all notes", async () => {
    const notes = await getAllNotes("xyz123");
    expect(Array.isArray(notes)).toBe(true);
    expect(notes.length).toBeGreaterThan(0);
  });

  test("retrieves audio recording as Blob", async () => {
    const audioBlob = await getAudioRecording("abc123");
    expect(audioBlob).toBeInstanceOf(Blob);
    expect(audioBlob.type).toBe("audio/wav");
  });

  test("updates a note", async () => {
    const updatedNote = await updateNote(
      JSON.stringify({ id: "abc123", heading: "Updated heading" })
    );
    expect(updatedNote).toHaveProperty("heading", "Updated heading");
  });

  test("uploads an image to a note", async () => {
    const formData = new FormData();
    formData.append(
      "image",
      new Blob(["dummy"], { type: "image/jpeg" }),
      "test-image.jpg"
    );

    const note = await uploadImage(formData);
    expect(note).toHaveProperty("images", "test-image.jpg");
  });

  test("deletes an image from a note", async () => {
    const note = await deleteImage("abc123", "test-image.jpg");
    expect(note).toHaveProperty("images", null);
  });

  test("deletes a note", async () => {
    const message = await deleteNote("abc123");
    expect(message).toBe("Note deleted successfully");
  });

  test("deletes all notes for a user", async () => {
    const message = await deleteAllNotes("user123");
    expect(message).toBe("All notes deleted successfully");
  });
});
