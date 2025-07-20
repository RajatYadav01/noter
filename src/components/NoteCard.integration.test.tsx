import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { toast } from "react-toastify";
import { server } from "../__mocks__/server";
import formatTimestamp from "../utilities/formatTimestamp";
import NoteCard from "./NoteCard";

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
  },
}));

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe("NoteCard component", () => {
  const mockNote: Note = {
    _id: "abc123",
    userID: "xyz123",
    type: "text",
    heading: "Test Note",
    content: "This is test note content.",
    audioRecording: null,
    audioDuration: null,
    images: null,
    imageCount: null,
    isFavourite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockAudioNote: Note = {
    ...mockNote,
    type: "audio",
    audioDuration: 65,
  };

  const mockNoteWithImages: Note = {
    ...mockNote,
    imageCount: 2,
  };

  const mockNoteWithJSONContent: Note = {
    ...mockNote,
    content: JSON.stringify([{ children: [{ text: "JSON Content" }] }]),
  };

  const mockShowNoteEditModal = vi.fn();
  const mockSetCurrentNoteID = vi.fn();
  const mockSetNoteDeleted = vi.fn();

  test("renders text note correctly", () => {
    render(
      <NoteCard
        note={mockNote}
        showNoteEditModal={mockShowNoteEditModal}
        setCurrentNoteID={mockSetCurrentNoteID}
        setNoteDeleted={mockSetNoteDeleted}
      />
    );

    expect(screen.getByText("Test Note")).toBeInTheDocument();
    expect(screen.getByText("This is test note content.")).toBeInTheDocument();
    expect(
      screen.getByText(
        formatTimestamp(new Date().toISOString()).substring(0, 12),
        { exact: false }
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Text/)).toBeInTheDocument();
  });

  test("renders audio note with duration correctly", () => {
    render(
      <NoteCard
        note={mockAudioNote}
        showNoteEditModal={mockShowNoteEditModal}
        setCurrentNoteID={mockSetCurrentNoteID}
        setNoteDeleted={mockSetNoteDeleted}
      />
    );

    expect(screen.getByText(/01:05/)).toBeInTheDocument();
  });

  test("renders note with images count correctly", () => {
    render(
      <NoteCard
        note={mockNoteWithImages}
        showNoteEditModal={mockShowNoteEditModal}
        setCurrentNoteID={mockSetCurrentNoteID}
        setNoteDeleted={mockSetNoteDeleted}
      />
    );

    expect(screen.getByText("2 Images")).toBeInTheDocument();
  });

  test("parses JSON content correctly", () => {
    render(
      <NoteCard
        note={mockNoteWithJSONContent}
        showNoteEditModal={mockShowNoteEditModal}
        setCurrentNoteID={mockSetCurrentNoteID}
        setNoteDeleted={mockSetNoteDeleted}
      />
    );

    expect(screen.getByText("JSON Content")).toBeInTheDocument();
  });

  test("opens edit modal when clicked", () => {
    render(
      <NoteCard
        note={mockNote}
        showNoteEditModal={mockShowNoteEditModal}
        setCurrentNoteID={mockSetCurrentNoteID}
        setNoteDeleted={mockSetNoteDeleted}
      />
    );

    fireEvent.click(screen.getByText("Test Note"));

    expect(mockSetCurrentNoteID).toHaveBeenCalledWith("abc123");
    expect(mockShowNoteEditModal).toHaveBeenCalledWith(true);
  });

  test("copies content to clipboard", async () => {
    vi.mocked(navigator.clipboard.writeText).mockResolvedValueOnce();

    render(
      <NoteCard
        note={mockNote}
        showNoteEditModal={mockShowNoteEditModal}
        setCurrentNoteID={mockSetCurrentNoteID}
        setNoteDeleted={mockSetNoteDeleted}
      />
    );

    fireEvent.click(screen.getByLabelText(/copy note content/i));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        mockNote.content
      );
      expect(screen.getByLabelText(/copied/i)).toBeInTheDocument();
    });
  });

  test("shows error when clipboard write fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const error = new Error("Clipboard write failed");
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(error);

    render(
      <NoteCard
        note={mockNote}
        showNoteEditModal={mockShowNoteEditModal}
        setCurrentNoteID={mockSetCurrentNoteID}
        setNoteDeleted={mockSetNoteDeleted}
      />
    );

    fireEvent.click(screen.getByLabelText(/copy/i));

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to copy text to clipboard/i)
      ).toBeInTheDocument();
    });
  });

  test("toggles menu dropdown", () => {
    render(
      <NoteCard
        note={mockNote}
        showNoteEditModal={mockShowNoteEditModal}
        setCurrentNoteID={mockSetCurrentNoteID}
        setNoteDeleted={mockSetNoteDeleted}
      />
    );

    fireEvent.click(screen.getByLabelText(/note options menu/i));

    expect(screen.getByText("Update")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/note options menu/i));

    expect(screen.queryByText("Update")).not.toBeInTheDocument();
  });

  test("deletes note successfully", async () => {
    // const mockDeleteNote = vi
    //   .fn()
    //   .mockResolvedValue("Note deleted successfully");
    // vi.mocked(require("../services/Note.ts").deleteNote).mockImplementation(
    //   mockDeleteNote
    // );

    render(
      <NoteCard
        note={mockNote}
        showNoteEditModal={mockShowNoteEditModal}
        setCurrentNoteID={mockSetCurrentNoteID}
        setNoteDeleted={mockSetNoteDeleted}
      />
    );

    fireEvent.click(screen.getByLabelText(/note options menu/i));

    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(mockSetNoteDeleted).toHaveBeenCalledWith(true);
      expect(toast.success).toHaveBeenCalledWith(
        "Note has been deleted successfully."
      );
    });
  });

  test("shows error when note deletion fails", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();
    server.use(
      http.delete(`${import.meta.env.VITE_BACKEND_API_URL}/note/delete`, () => {
        return HttpResponse.json({ message: "Network error" }, { status: 404 });
      })
    );

    render(
      <NoteCard
        note={mockNote}
        showNoteEditModal={mockShowNoteEditModal}
        setCurrentNoteID={mockSetCurrentNoteID}
        setNoteDeleted={mockSetNoteDeleted}
      />
    );

    fireEvent.click(screen.getByLabelText(/note options menu/i));
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
    console.error = originalConsoleError;
  });

  test("shows loading spinner during deletion", async () => {
    // const mockDeleteNote = vi
    //   .fn()
    //   .mockImplementation(
    //     () =>
    //       new Promise((resolve) =>
    //         setTimeout(() => resolve("Note deleted successfully"), 1000)
    //       )
    //   );
    // vi.mocked(require("../services/notes").deleteNote).mockImplementation(
    //   mockDeleteNote
    // );

    render(
      <NoteCard
        note={mockNote}
        showNoteEditModal={mockShowNoteEditModal}
        setCurrentNoteID={mockSetCurrentNoteID}
        setNoteDeleted={mockSetNoteDeleted}
      />
    );

    fireEvent.click(screen.getByLabelText(/note options menu/i));

    fireEvent.click(screen.getByText("Delete"));

    expect(screen.getByRole("status")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });
});
