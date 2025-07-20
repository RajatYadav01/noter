import { afterEach, describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";

function DummyPublicComponent() {
  return <div>Public content</div>;
}

function DummyLoginComponent() {
  return <div>Login page</div>;
}

describe("PublicRoutes", () => {
  afterEach(() => {
    localStorage.clear();
  });

  test("renders Outlet when user is not logged in", () => {
    localStorage.setItem("isLoggedIn", "false");

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route element={<PublicRoutes />}>
            <Route path="/login" element={<DummyLoginComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  test("redirects to Home when user is logged in", () => {
    localStorage.setItem("isLoggedIn", "true");

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/" element={<DummyPublicComponent />} />
          <Route element={<PublicRoutes />}>
            <Route path="/login" element={<DummyLoginComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Public content")).toBeInTheDocument();
  });
});
