import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NoteContentEditModal from "./NoteContentEditModal";

vi.mock("slate-react", async () => {
  const actual = await vi.importActual("slate-react");
  return {
    ...actual,
    Slate: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="slate-mock">{children}</div>
    ),
    Editable: () => <div data-testid="editable-mock" />,
  };
});

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

describe("NoteContentEditModal component", () => {
  const mockShowModal = vi.fn();
  const mockEditContent = vi.fn();
  const initialContent = "Initial note content";

  test("renders the modal with initial content", () => {
    render(
      <NoteContentEditModal
        showNoteContentEditModal={mockShowModal}
        initialContent={initialContent}
        editContent={mockEditContent}
      />
    );

    expect(screen.getByTestId("slate-mock")).toBeInTheDocument();
    expect(screen.getByTestId("editable-mock")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("✕")).toBeInTheDocument();
  });

  test("closes the modal when close button is clicked", () => {
    render(
      <NoteContentEditModal
        showNoteContentEditModal={mockShowModal}
        initialContent={initialContent}
        editContent={mockEditContent}
      />
    );

    fireEvent.click(screen.getByText("✕"));
    expect(mockShowModal).toHaveBeenCalledWith(false);
  });

  test("copies content to clipboard when copy button is clicked", async () => {
    render(
      <NoteContentEditModal
        showNoteContentEditModal={mockShowModal}
        initialContent={initialContent}
        editContent={mockEditContent}
      />
    );

    fireEvent.click(screen.getByLabelText(/copy note content/i));
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        initialContent
      );
    });
  });

  test("saves content when save button is clicked", () => {
    render(
      <NoteContentEditModal
        showNoteContentEditModal={mockShowModal}
        initialContent={initialContent}
        editContent={mockEditContent}
      />
    );

    fireEvent.click(screen.getByText("Save"));
    expect(mockEditContent).toHaveBeenCalledWith(initialContent);
    expect(mockShowModal).toHaveBeenCalledWith(false);
  });

  test("handles JSON content correctly", () => {
    const jsonContent = JSON.stringify([
      { type: "paragraph", children: [{ text: "JSON content" }] },
    ]);

    render(
      <NoteContentEditModal
        showNoteContentEditModal={mockShowModal}
        initialContent={jsonContent}
        editContent={mockEditContent}
      />
    );

    expect(screen.getByTestId("slate-mock")).toBeInTheDocument();
  });

  test("renders all formatting toolbar buttons", () => {
    render(
      <NoteContentEditModal
        showNoteContentEditModal={mockShowModal}
        initialContent={initialContent}
        editContent={mockEditContent}
      />
    );

    expect(screen.getByLabelText(/bold/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/italic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/underline/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/strikethrough/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/heading one/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/heading two/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/block quote/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bulleted list/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/numbered list/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/undo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/redo/i)).toBeInTheDocument();
  });
});
