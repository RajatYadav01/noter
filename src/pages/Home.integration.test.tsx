import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { server } from "../__mocks__/server";
import { AuthContextType, AuthContext } from "../context/authContext";
import Home from "./Home";

describe("Home page", () => {
  let mockAuthValue: AuthContextType = {
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

  vi.mock("./NoteCard", () => ({
    default: () => <div>NoteCard</div>,
  }));

  vi.mock("./NoteEditModal", () => ({
    default: () => <div>NoteEditModal</div>,
  }));

  vi.mock("./NoteTakingModal", () => ({
    default: () => <div>NoteTakingModal</div>,
  }));

  vi.mock("./AudioTranslator", () => ({
    default: () => <div>AudioTranslator</div>,
  }));

  vi.mock("./LeftSideBar", () => ({
    default: () => <div>LeftSideBar</div>,
  }));

  vi.mock("./SearchBar", () => ({
    default: () => <div>SearchBar</div>,
  }));

  vi.mock("./Sort", () => ({
    default: () => <div>Sort</div>,
  }));

  vi.mock("./Pagination", () => ({
    default: () => <div>Pagination</div>,
  }));

  test("renders loading state initially", async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <Home />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Home/)).toBeInTheDocument();
  });

  test("displays notes after loading", async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <Home />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText("Text").length).toBeGreaterThan(0);
    });
  });

  test("shows error message when API fails", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();
    server.use(
      http.get(`${import.meta.env.VITE_BACKEND_API_URL}/note/get-all`, () => {
        return HttpResponse.json(
          { message: "Internal server error" },
          { status: 500 }
        );
      })
    );

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <Home />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Internal server error")).toBeInTheDocument();
    });
    console.error = originalConsoleError;
  });

  test("displays empty state for non-logged-in users", () => {
    mockAuthValue = {
      ...mockAuthValue,
      loginStatusState: {
        loggedIn: false,
        userID: "",
        userName: "",
      },
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <Home />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("place")).toBeInTheDocument();
    expect(screen.getByText("for noting")).toBeInTheDocument();
    expect(screen.getByText("what's on your mind")).toBeInTheDocument();
  });

  test("opens note taking modal when create button is clicked", async () => {
    mockAuthValue = {
      ...mockAuthValue,
      loginStatusState: {
        loggedIn: true,
        userID: "xyz123",
        userName: "Test User",
      },
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <Home />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const createButton = screen.getByRole("button", {
      name: "Create a new note",
    });

    fireEvent.click(createButton);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Enter a heading for the note")
      ).toBeInTheDocument();
    });
  });

  test("filters notes based on search query", async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <Home />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText("Text").length).toBe(2);
    });

    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "Test Note 1" },
    });

    await waitFor(() => {
      expect(screen.getAllByText("Text").length).toBe(1);
    });
  });

  test("displays only favorite notes when displayOnlyFavouriteNotes is true", async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <Home displayOnlyFavouriteNotes={true} />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText("Text").length).toBe(1);
    });
  });

  test("handles pagination correctly", async () => {
    const manyMockNotes = Array.from({ length: 20 }, (_, i) => ({
      _id: `abc${i}`,
      userID: "xyz123",
      type: "text",
      heading: `Test Note ${i}`,
      content: `This is test content ${i}`,
      audioRecording: null,
      audioDuration: null,
      images: null,
      imageCount: null,
      isFavourite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    server.use(
      http.get(`${import.meta.env.VITE_BACKEND_API_URL}/note/get-all`, () => {
        return HttpResponse.json({ notes: manyMockNotes }, { status: 200 });
      })
    );

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <Home />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText("Text").length).toBe(10);
    });
  });

  test("shows audio translator component", async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <Home />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText("Start recording")).toBeInTheDocument();
  });
});
