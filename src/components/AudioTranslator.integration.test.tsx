import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  AuthContextType,
  AuthContext,
  AuthContextProvider,
} from "../context/authContext";
import AudioTranslator from "./AudioTranslator";

class MediaRecorderMock {
  start = vi.fn();
  stop = vi.fn();
  pause = vi.fn();
  resume = vi.fn();
  requestData = vi.fn();
  ondataavailable: ((event: BlobEvent) => void) | null = null;
  onstop: (() => void) | null = null;
  state: "inactive" | "recording" | "paused" = "inactive";
  stream: MediaStream;

  constructor(stream: MediaStream) {
    this.stream = stream;
  }

  triggerDataAvailable(blob: Blob) {
    this.ondataavailable?.({ data: blob } as any);
  }

  triggerStop() {
    this.onstop?.();
  }
}

(globalThis as any).MediaRecorder = MediaRecorderMock;

class MediaStreamMock {
  getTracks() {
    return [];
  }
}

(globalThis as any).MediaStream = MediaStreamMock;

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

describe("AudioTranslator component", () => {
  const mockSetTranslatedAudio = vi.fn();
  const mockShowNoteTakingModal = vi.fn();

  let mockGetUserMedia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetUserMedia = vi
      .fn()
      .mockRejectedValue(new Error("Microphone access denied"));

    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: mockGetUserMedia,
      },
      configurable: true,
    });
  });

  test("renders the recording button", () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <AudioTranslator
            setTranslatedAudio={mockSetTranslatedAudio}
            showNoteTakingModal={mockShowNoteTakingModal}
          />
        </AuthContextProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Start recording")).toBeInTheDocument();
  });

  test("shows error when user is not logged in", async () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <AudioTranslator
            setTranslatedAudio={mockSetTranslatedAudio}
            showNoteTakingModal={mockShowNoteTakingModal}
          />
          <ToastContainer />
        </AuthContextProvider>
      </MemoryRouter>
    );

    const startRecordingButton = screen.getByRole("button", {
      name: "Start recording",
    });
    fireEvent.click(startRecordingButton);
    await waitFor(() => {
      expect(
        screen.getByText(/You should be logged in to perform this action./i)
      ).toBeInTheDocument();
    });
  });

  test("shows error when microphone access fails", async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <AudioTranslator
            setTranslatedAudio={mockSetTranslatedAudio}
            showNoteTakingModal={mockShowNoteTakingModal}
          />
          <ToastContainer />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Start recording"));

    await waitFor(() => {
      expect(
        screen.getByText(
          "Can't access microphone due to Error: Microphone access denied"
        )
      ).toBeInTheDocument();
    });
  });

  test("starts recording when button is clicked", async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <AudioTranslator
            setTranslatedAudio={mockSetTranslatedAudio}
            showNoteTakingModal={mockShowNoteTakingModal}
          />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const mockStream = new MediaStream();
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
      configurable: true,
    });

    const startRecordingButton = screen.getByRole("button", {
      name: "Start recording",
    });
    fireEvent.click(startRecordingButton);
    await waitFor(() => {
      expect(screen.getByText("Stop recording")).toBeInTheDocument();
    });
  });

  test("shows recording timer when recording", async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <AudioTranslator
            setTranslatedAudio={mockSetTranslatedAudio}
            showNoteTakingModal={mockShowNoteTakingModal}
          />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const mockStream = new MediaStream();
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
      configurable: true,
    });

    const startRecordingButton = screen.getByRole("button", {
      name: "Start recording",
    });
    fireEvent.click(startRecordingButton);
    await waitFor(() => {
      expect(screen.getByText(/00:00/)).toBeInTheDocument();
    });
  });

  test("shows error when Web Speech API is not supported", async () => {
    delete (global as any).SpeechRecognition;
    delete (global as any).webkitSpeechRecognition;

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <AudioTranslator
            setTranslatedAudio={mockSetTranslatedAudio}
            showNoteTakingModal={mockShowNoteTakingModal}
          />
          <ToastContainer />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const mockStream = new MediaStream();
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
      configurable: true,
    });

    const startRecordingButton = screen.getByRole("button", {
      name: "Start recording",
    });
    fireEvent.click(startRecordingButton);

    await waitFor(() => {
      expect(
        screen.getAllByText("Web Speech API is not supported.").length
      ).toBeGreaterThan(0);
    });
  });
});
