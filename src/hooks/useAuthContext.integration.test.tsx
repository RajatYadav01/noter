import { renderHook, waitFor } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import { AuthContextProvider } from "../context/authContext";
import useAuthContext from "./useAuthContext";


const wrapperWithProvider = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <AuthContextProvider>{children}</AuthContextProvider>
  </MemoryRouter>
);

describe("useAuthContext hook", () => {
  test("throws error when used outside AuthContextProvider", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuthContext());
    }).toThrow("useAuthContext must be used within an AuthContextProvider");

    errorSpy.mockRestore();
  });

  test("provides auth context inside AuthContextProvider", () => {
    const { result } = renderHook(() => useAuthContext(), {
      wrapper: wrapperWithProvider,
    });

    expect(result.current).toHaveProperty("loginStatusState");
    expect(result.current).toHaveProperty("logIn");
    expect(result.current).toHaveProperty("logOut");
  });

  test("login and logout work correctly", async () => {
    const { result } = renderHook(() => useAuthContext(), {
      wrapper: wrapperWithProvider,
    });

    expect(result.current.loginStatusState.userName).toEqual("");

    result.current.logIn(
      JSON.stringify({
        emailAddress: "testuser@example.com",
        password: "Password.123",
      })
    );
    await waitFor(() => {
      expect(result.current.loginStatusState.userName).toEqual("Test User");
    });

    result.current.logOut();
    await waitFor(() => {
      expect(result.current.loginStatusState.userName).toEqual("");
    });
  });
});
