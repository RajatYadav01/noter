import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { useContext } from "react";
import { AuthContextProvider, AuthContext } from "./authContext";

const TestComponent = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthContext not found");

  const { loginStatusState, logIn, logOut } = context;

  return (
    <div>
      <div data-testid="username">
        {loginStatusState.loggedIn ? loginStatusState.userName : "No user"}
      </div>
      <button
        onClick={() =>
          logIn(
            JSON.stringify({
              emailAddress: "testuser@example.com",
              password: "Password.123",
            })
          )
        }
      >
        Login
      </button>
      <button onClick={logOut}>Logout</button>
    </div>
  );
};

describe("authContext", () => {
  test("should show 'No user' by default", () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <TestComponent />
        </AuthContextProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId("username").textContent).toBe("No user");
  });

  test("should update user after login", async () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <TestComponent />
        </AuthContextProvider>
      </MemoryRouter>
    );

    screen.getByText("Login").click();
    await waitFor(() => {
      expect(screen.getByTestId("username").textContent).toBe("Test User");
    });
  });

  test("should reset user after logout", async () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <TestComponent />
        </AuthContextProvider>
      </MemoryRouter>
    );

    screen.getByText("Login").click();
    await waitFor(() => {
      expect(screen.getByTestId("username").textContent).toBe("Test User");
    });
    screen.getByText("Logout").click();
    await waitFor(() => {
      expect(screen.getByTestId("username").textContent).toBe("No user");
    });
  });
});
