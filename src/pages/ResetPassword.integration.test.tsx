import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { server } from "../__mocks__/server";
import { AuthContextProvider } from "../context/authContext";
import ResetPassword from "./ResetPassword";

describe("ResetPassword page", () => {
  test("renders without crashing", () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <ResetPassword />
        </AuthContextProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("RESET")).toBeInTheDocument();
  });

  test("handles empty inputs", () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <ResetPassword />
        </AuthContextProvider>
      </MemoryRouter>
    );

    const emailAddressInput = screen.getByLabelText("Enter your email address");
    const passwordInput = screen.getByLabelText("Enter new password");
    const confirmPasswordInput = screen.getByLabelText("Confirm password");
    const resetButton = screen.getByRole("button", { name: "RESET" });

    fireEvent.change(emailAddressInput, { target: { value: "" } });
    fireEvent.change(passwordInput, { target: { value: "" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "" } });

    expect(resetButton).toBeDisabled();
  });

  test("handles invalid inputs", () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <ResetPassword />
        </AuthContextProvider>
      </MemoryRouter>
    );

    const emailAddressInput = screen.getByLabelText("Enter your email address");
    const passwordInput = screen.getByLabelText("Enter new password");
    const confirmPasswordInput = screen.getByLabelText("Confirm password");
    const resetButton = screen.getByRole("button", { name: "RESET" });

    fireEvent.change(emailAddressInput, { target: { value: "T" } });
    fireEvent.change(passwordInput, { target: { value: "e" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "s" } });

    expect(resetButton).toBeDisabled();
  });

  test("shows loading state during password reset", async () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <ResetPassword />
          <ToastContainer />
        </AuthContextProvider>
      </MemoryRouter>
    );

    const emailAddressInput = screen.getByLabelText("Enter your email address");
    const passwordInput = screen.getByLabelText("Enter new password");
    const confirmPasswordInput = screen.getByLabelText("Confirm password");
    const resetButton = screen.getByRole("button", { name: "RESET" });

    fireEvent.change(emailAddressInput, {
      target: { value: "testuser@example.com" },
    });
    fireEvent.change(passwordInput, { target: { value: "Password.123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password.123" },
    });
    fireEvent.click(resetButton);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    );
  });

  test("shows success message on successful submission", async () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <ResetPassword />
          <ToastContainer />
        </AuthContextProvider>
      </MemoryRouter>
    );

    const emailAddressInput = screen.getByLabelText("Enter your email address");
    const passwordInput = screen.getByLabelText("Enter new password");
    const confirmPasswordInput = screen.getByLabelText("Confirm password");
    const resetButton = screen.getByRole("button", { name: "RESET" });

    fireEvent.change(emailAddressInput, {
      target: { value: "testuser@example.com" },
    });
    fireEvent.change(passwordInput, { target: { value: "Password.123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password.123" },
    });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          /Password reset successful. You can now log in with the new password./i
        )
      ).toBeInTheDocument();
    });
  });

  test("handles API errors gracefully", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();
    server.use(
      http.patch(
        `${import.meta.env.VITE_BACKEND_API_URL}/user/reset-password`,
        () => {
          return HttpResponse.json(
            { message: "Network error" },
            { status: 404 }
          );
        }
      )
    );

    render(
      <MemoryRouter>
        <AuthContextProvider>
          <ResetPassword />
        </AuthContextProvider>
      </MemoryRouter>
    );

    const emailAddressInput = screen.getByLabelText("Enter your email address");
    const passwordInput = screen.getByLabelText("Enter new password");
    const confirmPasswordInput = screen.getByLabelText("Confirm password");
    const resetButton = screen.getByRole("button", { name: "RESET" });

    fireEvent.change(emailAddressInput, {
      target: { value: "testuser@example.com" },
    });
    fireEvent.change(passwordInput, { target: { value: "Password.123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password.123" },
    });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
    console.error = originalConsoleError;
  });
});
