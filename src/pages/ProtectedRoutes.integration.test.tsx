import { describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";

function DummyProtectedComponent() {
  return <div>Protected Content</div>;
}

function DummyLoginComponent() {
  return <div>Login Page</div>;
}

describe("ProtectedRoutes", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders protected content when isLoggedIn is true", () => {
    localStorage.setItem("isLoggedIn", "true");

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/protected" element={<DummyProtectedComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  test("redirects to Login when isLoggedIn is false", () => {
    localStorage.setItem("isLoggedIn", "false");

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/protected" element={<DummyProtectedComponent />} />
          </Route>
          <Route path="/login" element={<DummyLoginComponent />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  test("redirects to Login when isLoggedIn is not set", () => {
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/protected" element={<DummyProtectedComponent />} />
          </Route>
          <Route path="/login" element={<DummyLoginComponent />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
