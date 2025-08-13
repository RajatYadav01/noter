import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer";

describe("Footer component", () => {
  test("renders the footer with correct text", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText("Made by")).toBeInTheDocument();
  });

  test("contains a link with the correct href", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const link = screen.getByRole("link", { name: /Rajat Yadav/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://github.com/RajatYadav01");
  });

  test("renders the GitHub icon", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const icon = document.querySelector("i.bi-github");
    expect(icon).toBeInTheDocument();
  });
});
