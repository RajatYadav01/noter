import { beforeEach, describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../__mocks__/server";
import { AuthContextType, AuthContext } from "../context/authContext";
import NoteTakingModal from "./NoteTakingModal";

global.URL.createObjectURL = vi.fn(() => "mocked-url");

const mockAuthValue: AuthContextType = {
  loginStatusState: {
    loggedIn: true,
    userID: "xyz123",
    userName: "Test User",
  },
  dispatchLoginStatusState: vi.fn(),
  signUp: vi.fn(),
  logIn: vi.fn(),
  tokenRefresh: vi.fn(),
  resetPassword: vi.fn(),
  logOut: vi.fn(),
  startLogOutTimer: vi.fn(),
  clearLogOutTimer: vi.fn(),
  isLogOutTimerActive: { current: false } as React.RefObject<boolean>,
};

describe("NoteTakingModal component", () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(() =>
      Promise.resolve()
    );
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  });

  const mockShowNoteTakingModal = vi.fn();
  const mockSetNewNoteCreated = vi.fn();

  test("should render the modal correctly", () => {
    render(
      <AuthContext.Provider value={mockAuthValue}>
        <NoteTakingModal
          showNoteTakingModal={mockShowNoteTakingModal}
          audio={null}
          audioName=""
          audioDuration={0}
          audioTranscription=""
          setNewNoteCreated={mockSetNewNoteCreated}
        />
      </AuthContext.Provider>
    );

    expect(
      screen.getByPlaceholderText("Enter a heading for the note")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter the content of note")
    ).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  test("should handle input changes correctly for heading and content", () => {
    render(
      <AuthContext.Provider value={mockAuthValue}>
        <NoteTakingModal
          showNoteTakingModal={mockShowNoteTakingModal}
          audio={null}
          audioName=""
          audioDuration={0}
          audioTranscription=""
          setNewNoteCreated={mockSetNewNoteCreated}
        />
      </AuthContext.Provider>
    );

    const headingInput = screen.getByPlaceholderText(
      "Enter a heading for the note"
    ) as HTMLInputElement;
    const contentInput = screen.getByPlaceholderText(
      "Enter the content of note"
    ) as HTMLInputElement;

    fireEvent.change(headingInput, { target: { value: "New Heading" } });
    expect(headingInput.value).toBe("New Heading");

    fireEvent.change(contentInput, { target: { value: "New note content" } });
    expect(contentInput.value).toBe("New note content");
  });

  test("should handle file input for image upload", async () => {
    const file = new File(["image content"], "test.jpg", {
      type: "image/jpeg",
    });

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <NoteTakingModal
          showNoteTakingModal={mockShowNoteTakingModal}
          audio={null}
          audioName=""
          audioDuration={0}
          audioTranscription=""
          setNewNoteCreated={mockSetNewNoteCreated}
        />
      </AuthContext.Provider>
    );

    const fileInput = screen.getByLabelText("Upload image") as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(fileInput.files?.[0]).toBe(file);
      expect(fileInput.files?.[0].name).toBe("test.jpg");
    });
  });

  test("should handle audio play/pause", () => {
    const audioBlob = new Blob([], { type: "audio/wav" });

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <NoteTakingModal
          showNoteTakingModal={mockShowNoteTakingModal}
          audio={audioBlob}
          audioName="test-audio.wav"
          audioDuration={100}
          audioTranscription="Test audio transcription"
          setNewNoteCreated={mockSetNewNoteCreated}
        />
      </AuthContext.Provider>
    );

    const playPauseButton = screen.getByLabelText(/play and pause button/i);

    let icon = playPauseButton.querySelector("i");
    expect(icon).toHaveClass("bi-play-fill");

    fireEvent.click(playPauseButton);

    icon = playPauseButton.querySelector("i");
    expect(icon).toHaveClass("bi-pause-fill");
  });

  test("should handle save button click and mock the save process", async () => {
    const audioBlob = new Blob([], { type: "audio/wav" });

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <NoteTakingModal
          showNoteTakingModal={mockShowNoteTakingModal}
          audio={audioBlob}
          audioName="test-audio.wav"
          audioDuration={100}
          audioTranscription="Test audio transcription"
          setNewNoteCreated={mockSetNewNoteCreated}
        />
      </AuthContext.Provider>
    );

    const saveButton = screen.getByText("Save");
    mockSetNewNoteCreated.mockResolvedValue(true);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSetNewNoteCreated).toHaveBeenCalled();
      expect(mockShowNoteTakingModal).toHaveBeenCalledWith(false);
    });
  });

  test("should handle error messages when an error occurs during save", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();
    server.use(
      http.post(`${import.meta.env.VITE_BACKEND_API_URL}/note/new`, () => {
        return HttpResponse.json({ message: "Network error" }, { status: 404 });
      })
    );
    const audioBlob = new Blob([], { type: "audio/wav" });

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <NoteTakingModal
          showNoteTakingModal={mockShowNoteTakingModal}
          audio={audioBlob}
          audioName="test-audio.wav"
          audioDuration={100}
          audioTranscription="Test audio transcription"
          setNewNoteCreated={mockSetNewNoteCreated}
        />
      </AuthContext.Provider>
    );

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
    console.error = originalConsoleError;
  });

  test("should close the modal when cancel button is clicked", () => {
    render(
      <AuthContext.Provider value={mockAuthValue}>
        <NoteTakingModal
          showNoteTakingModal={mockShowNoteTakingModal}
          audio={null}
          audioName=""
          audioDuration={0}
          audioTranscription=""
          setNewNoteCreated={mockSetNewNoteCreated}
        />
      </AuthContext.Provider>
    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);
    expect(mockShowNoteTakingModal).toHaveBeenCalledWith(false);
  });
});
