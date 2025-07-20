import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  AuthContextType,
  AuthContext,
  AuthContextProvider,
} from "../context/authContext";
import LeftSideBar from "./LeftSideBar";

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

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

describe("LeftSideBar component", () => {
  test("renders the component with default closed state", () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <LeftSideBar pageType="Home" />
        </AuthContextProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Noter")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Log in")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  test("hides login/signup buttons on respective pages", () => {
    const { rerender } = render(
      <MemoryRouter>
        <AuthContextProvider>
          <LeftSideBar pageType="Login" />
        </AuthContextProvider>
      </MemoryRouter>
    );

    expect(screen.queryByText("Log in")).not.toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <AuthContextProvider>
          <LeftSideBar pageType="SignUp" />
        </AuthContextProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Log in")).toBeInTheDocument();
    expect(screen.queryByText("Sign up")).not.toBeInTheDocument();
  });

  test("shows user menu when logged in", () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <LeftSideBar pageType="Home" />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText("T")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.queryByText("Log in")).not.toBeInTheDocument();
    expect(screen.queryByText("Sign up")).not.toBeInTheDocument();
  });

  test("toggles user menu dropdown", () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <LeftSideBar pageType="Home" />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText(/user menu toggle/i));

    expect(screen.getByText("Update profile")).toBeInTheDocument();
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  test("shows error when trying to access favorites while not logged in", () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <LeftSideBar pageType="Home" />
        </AuthContextProvider>
      </MemoryRouter>
    );

    expect(screen.queryByText("Favourites")).not.toBeInTheDocument();
  });

  test("calls tokenRefresh when logged in", () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <LeftSideBar pageType="Home" />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(mockAuthValue.tokenRefresh).toHaveBeenCalled();
  });

  test("navigates to correct routes", () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <LeftSideBar pageType="Home" />
        </AuthContextProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Log in"));
    expect(mockNavigate).toHaveBeenCalledWith("/login");

    fireEvent.click(screen.getByText("Sign up"));
    expect(mockNavigate).toHaveBeenCalledWith("/signup");
  });

  test("handles logout", () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <LeftSideBar pageType="Home" />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText(/user menu toggle/i));
    fireEvent.click(screen.getByText("Log out"));

    expect(mockAuthValue.logOut).toHaveBeenCalled();
  });
});
