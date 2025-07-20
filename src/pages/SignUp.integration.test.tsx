import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { server } from "../__mocks__/server";
import { AuthContextProvider } from "../context/authContext";
import SignUp from "./SignUp";

describe("SignUp page", () => {
  test("renders without crashing", () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <SignUp />
        </AuthContextProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Sign up/)).toBeInTheDocument();
  });

  test("handles empty inputs", () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <SignUp />
        </AuthContextProvider>
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText("Enter your name");
    const emailAddressInput = screen.getByLabelText("Enter your email address");
    const passwordInput = screen.getByLabelText("Create new password");
    const confirmPasswordInput = screen.getByLabelText("Confirm password");
    const signUpButton = screen.getByRole("button", { name: "SIGN UP" });

    fireEvent.change(nameInput, { target: { value: "" } });
    fireEvent.change(emailAddressInput, { target: { value: "" } });
    fireEvent.change(passwordInput, { target: { value: "" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "" } });

    expect(signUpButton).toBeDisabled();
  });

  test("handles invalid inputs", () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <SignUp />
        </AuthContextProvider>
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText("Enter your name");
    const emailAddressInput = screen.getByLabelText("Enter your email address");
    const passwordInput = screen.getByLabelText("Create new password");
    const confirmPasswordInput = screen.getByLabelText("Confirm password");
    const signUpButton = screen.getByRole("button", { name: "SIGN UP" });

    fireEvent.change(nameInput, { target: { value: "T" } });
    fireEvent.change(emailAddressInput, { target: { value: "e" } });
    fireEvent.change(passwordInput, { target: { value: "s" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "t" } });

    expect(signUpButton).toBeDisabled();
  });

  test("shows loading state during submission", async () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <SignUp />
          <ToastContainer />
        </AuthContextProvider>
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText("Enter your name");
    const emailAddressInput = screen.getByLabelText("Enter your email address");
    const passwordInput = screen.getByLabelText("Create new password");
    const confirmPasswordInput = screen.getByLabelText("Confirm password");
    const signUpButton = screen.getByRole("button", { name: "SIGN UP" });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailAddressInput, {
      target: { value: "testuser@example.com" },
    });
    fireEvent.change(passwordInput, { target: { value: "Password.123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password.123" },
    });
    fireEvent.click(signUpButton);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    );
  });

  test("shows success message on successful submission", async () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <SignUp />
          <ToastContainer />
        </AuthContextProvider>
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText("Enter your name");
    const emailAddressInput = screen.getByLabelText("Enter your email address");
    const passwordInput = screen.getByLabelText("Create new password");
    const confirmPasswordInput = screen.getByLabelText("Confirm password");
    const signUpButton = screen.getByRole("button", { name: "SIGN UP" });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailAddressInput, {
      target: { value: "testuser@example.com" },
    });
    fireEvent.change(passwordInput, { target: { value: "Password.123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password.123" },
    });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Your account has been successfully created/i)
      ).toBeInTheDocument();
    });
  });

  test("handles API errors gracefully", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();
    server.use(
      http.post(`${import.meta.env.VITE_BACKEND_API_URL}/user/new`, () => {
        return HttpResponse.json({ message: "Network error" }, { status: 404 });
      })
    );

    render(
      <MemoryRouter>
        <AuthContextProvider>
          <SignUp />
        </AuthContextProvider>
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText("Enter your name");
    const emailAddressInput = screen.getByLabelText("Enter your email address");
    const passwordInput = screen.getByLabelText("Create new password");
    const confirmPasswordInput = screen.getByLabelText("Confirm password");
    const signUpButton = screen.getByRole("button", { name: "SIGN UP" });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailAddressInput, {
      target: { value: "testuser@example.com" },
    });
    fireEvent.change(passwordInput, { target: { value: "Password.123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password.123" },
    });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
    console.error = originalConsoleError;
  });
});
