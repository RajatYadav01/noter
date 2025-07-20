import { beforeEach, describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders the home page at root route", () => {
    window.history.pushState({}, "", "/");
    render(<App />);

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  test("renders login page at /login", () => {
    window.history.pushState({}, "", "/login");
    render(<App />);

    expect(screen.getByRole("heading", { name: "Log in" })).toBeInTheDocument();
  });

  test("renders favourites page for authenticated user", () => {
    localStorage.setItem("isLoggedIn", "true");
    window.history.pushState({}, "", "/favourites");
    render(<App />);

    expect(screen.getByText("Favourites")).toBeInTheDocument();
  });

  test("renders 404 page on unknown route", () => {
    window.history.pushState({}, "", "/some-unknown-path");
    render(<App />);

    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });
});
