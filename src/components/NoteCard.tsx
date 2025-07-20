import axios from "axios";
import { toast } from "react-toastify";
import { Fragment, useState, useRef, useEffect } from "react";
import { deleteNote } from "../services/Note";
import formatTimestamp from "../utilities/formatTimestamp";
import isJSONData from "../utilities/isJSONData";

interface NoteCardProps {
  note: Note;
  showNoteEditModal: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentNoteID: React.Dispatch<React.SetStateAction<string>>;
  setNoteDeleted: React.Dispatch<React.SetStateAction<boolean>>;
}

const NoteCard = ({
  note,
  showNoteEditModal,
  setCurrentNoteID,
  setNoteDeleted,
}: NoteCardProps) => {
  const [noteContent, setNoteContent] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [noteCardError, setNoteCardError] = useState<string>("");
  const noteCardErrorRef = useRef<HTMLParagraphElement | null>(null);
  const [loadingIconState, setLoadingIconState] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (note.content) {
      const content = isJSONData(note.content)
        ? JSON.parse(note.content)[0].children[0].text
        : note.content;
      setNoteContent(content);
    }
  }, [note.content]);

  const displayNoteModal = () => {
    if (note._id) setCurrentNoteID(note._id);
    showNoteEditModal(true);
    toggleMenu();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCopy = async () => {
    try {
      setNoteCardError("");
      await navigator.clipboard.writeText(note.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    } catch (error) {
      console.error("Failed to copy text to clipboard: ", error);
      setNoteCardError(`Failed to copy text to clipboard: ${error}`);
    }
  };

  const handleDelete = () => {
    const deleteCurrentNote = async () => {
      try {
        setLoadingIconState(true);
        const noteDelete = note._id && (await deleteNote(note._id));
        if (noteDelete === "Note deleted successfully") {
          setNoteCardError("");
          setNoteDeleted(true);
          toast.success("Note has been deleted successfully.");
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error(error);
          const errorMessage = error.response?.data.message
            ? error.response?.data.message
            : error.message;
          setNoteCardError(errorMessage);
        }
        noteCardErrorRef.current?.focus();
      } finally {
        setLoadingIconState(false);
      }
    };

    deleteCurrentNote();
  };

  return (
    <div className="p-4 flex flex-col justify-between w-full h-100 bg-white border border-[#f0f0f0] rounded-3xl">
      {noteCardError && (
        <p
          ref={noteCardErrorRef}
          className="mx-auto my-[2%] pl-[0.25%] pr-[0.15%] py-[0.15%] w-[60%] rounded-[0.35em] bg-[#fcb2a2] border-[2px] border-[#ff0000] text-[#000000] leading-[1.2] text-[0.55em]"
          aria-live="assertive"
        >
          {noteCardError}
        </p>
      )}
      <div
        className="flex justify-between items-center"
        onClick={displayNoteModal}
      >
        <p className="text-sm text-gray-300">
          {note.createdAt && formatTimestamp(note.createdAt).substring(0, 12)}
          <i className="bi bi-dot"></i>
          {note.createdAt && formatTimestamp(note.createdAt).substring(13, 22)}
        </p>
        <span className="text-sm bg-gray-100 px-2 py-1 rounded-3xl">
          {note.type === "text" ? (
            <Fragment>
              <i className="bi bi-file-font-fill" />
              Text
            </Fragment>
          ) : (
            <Fragment>
              <i className="bi bi-play-fill" />
              {note.audioDuration &&
                new Date(note.audioDuration * 1000).toISOString().slice(14, 19)}
            </Fragment>
          )}
        </span>
      </div>
      <div className="flex-1 mt-2" onClick={displayNoteModal}>
        <h3 className="text-lg font-bold truncate">{note.heading}</h3>
        <p className="text-sm text-gray-700 mt-1 line-clamp-3">{noteContent}</p>
        {note.imageCount && note.imageCount > 0 ? (
          <div className="w-[30%] flex items-center mt-2 p-1 rounded">
            <span className="text-sm">
              <i className="pr-1.5 bi bi-card-image"></i>
              {note.imageCount} {note.imageCount > 1 ? "Images" : "Image"}
            </span>
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="flex justify-end space-x-2">
        <button
          onClick={handleCopy}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300"
        >
          {isCopied ? (
            <i className="bi bi-check-square-fill" aria-label="Copied"></i>
          ) : (
            <i
              className="text-gray-400 bi bi-files"
              aria-label="Copy note content"
            ></i>
          )}
        </button>
        <div className="relative">
          <button
            onClick={toggleMenu}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300"
            aria-label="Note options menu"
          >
            <i className="text-gray-400 bi bi-three-dots"></i>
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-24 bg-white rounded-lg shadow-lg">
              <button
                onClick={displayNoteModal}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Update
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      {loadingIconState && (
        <div role="status" className="mx-auto w-8">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      )}
    </div>
  );
};

export default NoteCard;
