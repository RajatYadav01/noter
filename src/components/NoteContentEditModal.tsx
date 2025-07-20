import {
  Editor,
  Transforms,
  Element as SlateElement,
  Descendant,
  createEditor,
} from "slate";
import { withHistory } from "slate-history";
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  withReact,
} from "slate-react";
import React, { useState, useMemo, useCallback } from "react";
import {
  CustomEditor,
  CustomElement,
  CustomElementType,
  CustomElementWithAlign,
  CustomTextKey,
} from "../types/slate.d";

interface NoteContentEditModalProps {
  showNoteContentEditModal: React.Dispatch<React.SetStateAction<boolean>>;
  initialContent: string;
  editContent: (editedContent: string) => void;
}

const HOTKEYS: Record<string, CustomTextKey> = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+shift+x": "strikethrough",
};

const LIST_TYPES = ["numbered-list", "bulleted-list"] as const;
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"] as const;

type AlignType = (typeof TEXT_ALIGN_TYPES)[number];
type ListType = (typeof LIST_TYPES)[number];
type CustomElementFormat = CustomElementType | AlignType | ListType;

const toggleBlock = (editor: CustomEditor, format: CustomElementFormat) => {
  const isActive = isBlockActive(
    editor,
    format,
    isAlignType(format) ? "align" : "type"
  );
  const isList = isListType(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      isListType(n.type) &&
      !isAlignType(format),
    split: true,
  });
  let newProperties: Partial<SlateElement>;
  if (isAlignType(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor: CustomEditor, format: CustomTextKey) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (
  editor: CustomEditor,
  format: CustomElementFormat,
  blockType: "type" | "align" = "type"
) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => {
        if (!Editor.isEditor(n) && SlateElement.isElement(n)) {
          if (blockType === "align" && isAlignElement(n)) {
            return n.align === format;
          }
          return n.type === format;
        }
        return false;
      },
    })
  );

  return !!match;
};

const isMarkActive = (editor: CustomEditor, format: CustomTextKey) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const Element = ({ attributes, children, element }: RenderElementProps) => {
  const style: React.CSSProperties = {};
  if (isAlignElement(element)) {
    style.textAlign = element.align as AlignType;
  }
  switch (element.type) {
    case "block-quote":
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case "bulleted-list":
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      );
    case "heading-one":
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case "list-item":
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case "numbered-list":
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.strikethrough) {
    children = <s>{children}</s>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const isAlignType = (format: CustomElementFormat): format is AlignType => {
  return TEXT_ALIGN_TYPES.includes(format as AlignType);
};

const isListType = (format: CustomElementFormat): format is ListType => {
  return LIST_TYPES.includes(format as ListType);
};

const isAlignElement = (
  element: CustomElement
): element is CustomElementWithAlign => {
  return "align" in element;
};

const NoteContentEditModal = ({
  showNoteContentEditModal,
  initialContent,
  editContent,
}: NoteContentEditModalProps) => {
  const [content, setContent] = useState<string>(initialContent);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const handleSave = () => {
    editContent(content);
    showNoteContentEditModal(false);
  };

  const renderElement = useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    []
  );
  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    []
  );
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const isJSONData = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };
  const initialValue: Descendant[] = isJSONData(content)
    ? JSON.parse(content)
    : [
        {
          type: "paragraph",
          children: [{ text: content }],
        },
      ];

  return (
    <div className="z-4 fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg flex flex-col w-full max-w-5xl">
        <div className="flex justify-between p-4">
          <button
            onClick={() => showNoteContentEditModal(false)}
            className="w-8 h-8 rounded-full bg-gray-100 inline-flex items-center justify-center hover:bg-gray-200"
          >
            ✕
          </button>
          <div className="basis-1/6 flex justify-between">
            <button
              onClick={handleCopy}
              className="ml-2 w-8 h-8 rounded-full inline-flex items-center justify-center hover:bg-gray-200" aria-label="Copy note content"
            >
              <i className="bi bi-files"></i>
            </button>
            <button
              onClick={handleSave}
              className="w-20 h-8 py-2 rounded-full bg-gray-400 text-white inline-flex items-center justify-center hover:bg-gray-500"
            >
              Save
            </button>
          </div>
        </div>
        <Slate
          editor={editor}
          initialValue={initialValue}
          onValueChange={(value) => {
            const isAstChange = editor.operations.some(
              (op) => "set_selection" !== op.type
            );
            if (isAstChange) {
              const content = JSON.stringify(value);
              setContent(content);
            }
          }}
        >
          <div className="mx-auto my-4 p-2 w-fit border border-gray-100 rounded-lg flex justify-center space-x-2 shadow-[8px_-10px_10px_-5px_rgba(0,_0,_0,_0.1),-8px_10px_10px_-5px_rgba(0,_0,_0,_0.1)]">
            <button
              onClick={() => toggleMark(editor, "bold")}
              className="mr-0 w-6.5 md:w-10 h-6.5 md:h-10 border-r border-gray-100 flex items-center justify-center hover:bg-gray-200" aria-label="Bold"
            >
              <i className="bi bi-type-bold"></i>
            </button>
            <button
              onClick={() => toggleMark(editor, "italic")}
              className="mr-0 w-6.5 md:w-10 h-6.5 md:h-10 border-r border-gray-100 flex items-center justify-center hover:bg-gray-200" aria-label="Italic"
            >
              <i className="bi bi-type-italic"></i>
            </button>
            <button
              onClick={() => toggleMark(editor, "underline")}
              className="mr-0 w-6.5 md:w-10 h-6.5 md:h-10 border-r border-gray-100 flex items-center justify-center hover:bg-gray-200" aria-label="Underline"
            >
              <i className="bi bi-type-underline"></i>
            </button>
            <button
              onClick={() => toggleMark(editor, "strikethrough")}
              className="mr-0 w-6.5 md:w-10 h-6.5 md:h-10 border-r border-gray-100 flex items-center justify-center hover:bg-gray-200" aria-label="Strikethrough"
            >
              <i className="bi bi-type-strikethrough"></i>
            </button>
            <button
              onClick={() => toggleMark(editor, "code")}
              className="mr-0 w-6.5 md:w-10 h-6.5 md:h-10 border-r border-gray-100 flex items-center justify-center hover:bg-gray-200" aria-label="Code"
            >
              <i className="bi bi-code"></i>
            </button>
            <button
              onClick={() => toggleBlock(editor, "heading-one")}
              className="mr-0 w-6.5 md:w-10 h-6.5 md:h-10 border-r border-gray-100 flex items-center justify-center hover:bg-gray-200" aria-label="Heading one"
            >
              <i className="bi bi-type-h1"></i>
            </button>
            <button
              onClick={() => toggleBlock(editor, "heading-two")}
              className="mr-0 w-6.5 md:w-10 h-6.5 md:h-10 border-r border-gray-100 flex items-center justify-center hover:bg-gray-200" aria-label="Heading two"
            >
              <i className="bi bi-type-h2"></i>
            </button>
            <button
              onClick={() => toggleBlock(editor, "block-quote")}
              className="mr-0 w-6.5 md:w-10 h-6.5 md:h-10 border-r border-gray-100 flex items-center justify-center hover:bg-gray-200" aria-label="Block quote"
            >
              <i className="bi bi-quote"></i>
            </button>
            <button
              onClick={() => toggleBlock(editor, "bulleted-list")}
              className="mr-0 w-6.5 md:w-10 h-6.5 md:h-10 border-r border-gray-100 flex items-center justify-center hover:bg-gray-200" aria-label="Bulleted list"
            >
              <i className="bi bi-list-ul"></i>
            </button>
            <button
              onClick={() => toggleBlock(editor, "numbered-list")}
              className="mr-0 w-6.5 md:w-10 h-6.5 md:h-10 border-r border-gray-100 flex items-center justify-center hover:bg-gray-200" aria-label="Numbered list"
            >
              <i className="bi bi-list-ol"></i>
            </button>
            <button
              onClick={() => editor.undo()}
              className="mr-0 w-6.5 md:w-10 h-6.5 md:h-10 border-r border-gray-100 flex items-center justify-center hover:bg-gray-200" aria-label="Undo"
            >
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
            <button
              onClick={() => editor.redo()}
              className="mr-0 w-6.5 md:w-10 h-6.5 md:h-10 border-gray-100 flex items-center justify-center hover:bg-gray-200" aria-label="Redo"
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
          <Editable
            className="p-2 w-full h-100"
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            spellCheck
            onKeyDown={(event) => {
              for (const hotkey in HOTKEYS) {
                if (
                  event.metaKey &&
                  event.key.toLowerCase() === hotkey.split("+")[1]
                ) {
                  event.preventDefault();
                  const mark = HOTKEYS[hotkey];
                  toggleMark(editor, mark);
                }
              }
            }}
          />
        </Slate>
      </div>
    </div>
  );
};

export default NoteContentEditModal;
