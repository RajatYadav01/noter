import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { toast } from "react-toastify";
import { server } from "../__mocks__/server";
import NoteEditModal from "./NoteEditModal";

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe("NoteEditModal component", () => {
  const mockShowNoteEditModal = vi.fn();
  const mockCurrentNoteID = "abc123";
  const mockSetNoteUpdated = vi.fn();

  test("should render the NoteEditModal with correct initial data", async () => {
    render(
      <NoteEditModal
        showNoteEditModal={mockShowNoteEditModal}
        currentNoteID={mockCurrentNoteID}
        setNoteUpdated={mockSetNoteUpdated}
      />
    );

    expect(await screen.findByText("Test Note 1")).toBeInTheDocument();
    expect(
      await screen.findByText("This is test note 1 content.")
    ).toBeInTheDocument();
    expect(screen.queryByText("Download audio")).not.toBeInTheDocument();
  });

  test("should toggle full-screen mode", async () => {
    render(
      <NoteEditModal
        showNoteEditModal={mockShowNoteEditModal}
        currentNoteID={mockCurrentNoteID}
        setNoteUpdated={mockSetNoteUpdated}
      />
    );

    const fullScreenButton = screen.getByRole("button", {
      name: /toggle fullscreen/i,
    });

    fireEvent.click(fullScreenButton);
    expect(screen.getByTestId("note-edit-modal")).toHaveClass("p-0");

    fireEvent.click(fullScreenButton);
    expect(screen.getByTestId("note-edit-modal")).not.toHaveClass("p-0");
  });

  test("should call closeNoteModal on close button click", async () => {
    render(
      <NoteEditModal
        showNoteEditModal={mockShowNoteEditModal}
        currentNoteID={mockCurrentNoteID}
        setNoteUpdated={mockSetNoteUpdated}
      />
    );

    const closeButton = screen.getByRole("button", { name: /✕/i });
    fireEvent.click(closeButton);
    expect(mockShowNoteEditModal).toHaveBeenCalledWith(false);
  });

  test("should update the note details when save is triggered", async () => {
    render(
      <NoteEditModal
        showNoteEditModal={mockShowNoteEditModal}
        currentNoteID={mockCurrentNoteID}
        setNoteUpdated={mockSetNoteUpdated}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /edit heading/i }));
    fireEvent.change(screen.getByRole("textbox", { name: /heading/i }), {
      target: { value: "Updated Heading" },
    });

    fireEvent.blur(screen.getByRole("textbox", { name: /heading/i }));
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Note has been successfully updated."
      );
    });
  });

  test("should show error message if API request fails", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();
    server.use(
      http.get(`${import.meta.env.VITE_BACKEND_API_URL}/note/get`, () => {
        return HttpResponse.json({ message: "Network error" }, { status: 404 });
      })
    );

    render(
      <NoteEditModal
        showNoteEditModal={mockShowNoteEditModal}
        currentNoteID={mockCurrentNoteID}
        setNoteUpdated={mockSetNoteUpdated}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
    console.error = originalConsoleError;
  });
});
