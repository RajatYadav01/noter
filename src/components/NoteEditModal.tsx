import axios from "axios";
import { toast } from "react-toastify";
import React, { useState, useEffect, useRef } from "react";
import NoteContentEditModal from "./NoteContentEditModal";
import {
  getNote,
  getAudioRecording,
  updateNote,
  uploadImage,
  deleteImage,
} from "../services/Note";
import formatTimestamp from "../utilities/formatTimestamp";
import isJSONData from "../utilities/isJSONData";

interface NoteModalProps {
  showNoteEditModal: React.Dispatch<React.SetStateAction<boolean>>;
  currentNoteID: string;
  setNoteUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}

const NoteEditModal = ({
  showNoteEditModal,
  currentNoteID,
  setNoteUpdated,
}: NoteModalProps) => {
  const [note, setNote] = useState<EditNote>({
    _id: currentNoteID,
    userID: "",
    type: "",
    heading: "",
    content: "",
    audioRecording: null,
    audioDuration: null,
    images: null,
    imageCount: 0,
    isFavourite: false,
    createdAt: "",
  });
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const animationFrameRef = useRef<number>(0);
  const [isEditingHeading, setIsEditingHeading] = useState<boolean>(false);
  const noteHeadingRef = useRef<string>("");
  const [noteContent, setNoteContent] = useState<string>("");
  const [isEditingContent, setIsEditingContent] = useState<boolean>(false);
  const noteContentRef = useRef<string>("");
  const noteIsFavouriteRef = useRef<boolean>(false);
  const [noteEditModalError, setnoteEditModalError] = useState<string>("");
  const noteEditModalErrorRef = useRef<HTMLParagraphElement | null>(null);
  const [loadingIconState, setLoadingIconState] = useState(false);
  const [showNoteContentModal, setShowNoteContentModal] =
    useState<boolean>(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const closeNoteModal = () => {
    showNoteEditModal(false);
  };

  useEffect(() => {
    if (note.content) {
      const content = isJSONData(note.content)
        ? JSON.parse(note.content)[0].children[0].text
        : note.content;
      setNoteContent(content);
    }
  }, [note.content]);

  useEffect(() => {
    if (currentNoteID) {
      const fetchNoteDetails = async () => {
        try {
          setLoadingIconState(true);
          const note = await getNote(currentNoteID);
          if (note) {
            setNote((prevData) => ({
              ...prevData,
              userID: note.userID,
              type: note.type,
              heading: note.heading,
              content: note.content,
              audioRecording: note.audioRecording,
              audioDuration: note.audioDuration,
              images: note.images,
              imageCount: note.imageCount,
              isFavourite: note.isFavourite,
              createdAt: note.createdAt,
            }));
            noteHeadingRef.current = note.heading;
            noteContentRef.current = note.content;
            noteIsFavouriteRef.current = note.isFavourite;
          }
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            console.error(error);
            const errorMessage = error.response?.data.message
              ? error.response?.data.message
              : error.message;
            setnoteEditModalError(errorMessage);
          }
          noteEditModalErrorRef.current?.focus();
        } finally {
          setLoadingIconState(false);
        }
      };

      fetchNoteDetails();
    }
  }, [currentNoteID]);

  useEffect(() => {
    if (note._id) {
      if (
        (!isEditingHeading && note.heading !== noteHeadingRef.current) ||
        (!isEditingContent && note.content !== noteContentRef.current) ||
        note.isFavourite !== noteIsFavouriteRef.current
      ) {
        const updateNoteDetails = async () => {
          try {
            setLoadingIconState(true);
            const noteDetailsEditData = JSON.stringify({
              id: note._id,
              heading: note.heading,
              content: note.content,
              isFavourite: note.isFavourite,
            });
            const noteDetailsUpdate = await updateNote(noteDetailsEditData);
            if (noteDetailsUpdate) {
              noteHeadingRef.current = noteDetailsUpdate.heading;
              noteContentRef.current = noteDetailsUpdate.content;
              noteIsFavouriteRef.current = noteDetailsUpdate.isFavourite;
              setnoteEditModalError("");
              setNoteUpdated(true);
              toast.success("Note has been successfully updated.");
            }
          } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
              if (error) {
                console.error(error);
                const errorMessage = error.response?.data.message
                  ? error.response?.data.message
                  : error.message;
                setnoteEditModalError(errorMessage);
              }
            }
            noteEditModalErrorRef.current?.focus();
          } finally {
            setLoadingIconState(false);
          }
        };

        updateNoteDetails();
      }
    }
  }, [
    note._id,
    isEditingHeading,
    note.heading,
    noteHeadingRef,
    isEditingContent,
    note.content,
    noteContentRef,
    note.isFavourite,
    noteIsFavouriteRef,
    setNoteUpdated,
  ]);

  useEffect(() => {
    if (note.audioRecording && audioRef.current) {
      audioRef.current.src = note.audioRecording;
      audioRef.current.load();
    }
  }, [note.audioRecording]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (note.audioDuration && audioRef.current) {
      audioRef.current.onloadedmetadata = () => {
        setDuration(note.audioDuration);
      };
    }
  }, [note.audioDuration]);

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const seekBar = event.currentTarget;
      const rect = seekBar.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const newProgress = (offsetX / rect.width) * 100;
      const newTime = duration && newProgress * duration;
      if (newTime) {
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
      setProgress(newProgress);
    }
  };

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      const updateProgress = () => {
        if (audioRef.current && duration) {
          const currentTime = audioRef.current.currentTime;
          const progressPercent = (currentTime / duration) * 100;
          setProgress(progressPercent);
        }
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      };
      animationFrameRef.current = requestAnimationFrame(updateProgress);
      return () => cancelAnimationFrame(animationFrameRef.current);
    }
  }, [isPlaying, duration]);

  const handleAudioDownload = () => {
    const downloadNoteAudioRecording = async () => {
      try {
        setLoadingIconState(true);
        if (note._id) {
          const noteAudioRecording = await getAudioRecording(note._id);
          if (noteAudioRecording && note.audioRecording) {
            const url = window.URL.createObjectURL(
              new Blob([noteAudioRecording])
            );
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
              "download",
              `${note.audioRecording.split(`${note.userID}@`, 2)[1]}`
            );
            link.click();
          }
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error(error);
          const errorMessage = error.response?.data.message
            ? error.response?.data.message
            : error.message;
          setnoteEditModalError(errorMessage);
        }
        noteEditModalErrorRef.current?.focus();
      } finally {
        setLoadingIconState(false);
      }
    };

    downloadNoteAudioRecording();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNote((prevData) => ({
      ...prevData,
      [event.target.name]: event.target.value,
    }));
  };

  const updateNoteContent = (updatedContent: string) => {
    setNote((prevData) => ({
      ...prevData,
      content: updatedContent,
    }));
    setIsEditingContent(false);
  };

  const handleIsFavourite = () => {
    setNote((prevData) => ({
      ...prevData,
      isFavourite: !note.isFavourite,
    }));
  };

  const handleSaveHeading = () => {
    setIsEditingHeading(false);
  };

  const displayNoteContentModal = () => {
    setIsEditingContent(true);
    setShowNoteContentModal((prevValue) => !prevValue);
  };

  const handleImageUploadClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const imageFile = event.target.files[0];
      const formData = new FormData();
      if (note._id) formData.append("id", note._id);
      formData.append("userID", note.userID);
      formData.append("image", imageFile);
      const uploadNoteImage = async () => {
        try {
          setLoadingIconState(true);
          const noteImageUpload = await uploadImage(formData);
          if (noteImageUpload) {
            setNote((prevData) => ({
              ...prevData,
              images: noteImageUpload.images,
              imageCount: noteImageUpload.imageCount,
            }));
            setnoteEditModalError("");
            toast.success("Image uploaded successfully.");
          }
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            console.error(error);
            const errorMessage = error.response?.data.message
              ? error.response?.data.message
              : error.message;
            setnoteEditModalError(errorMessage);
          }
          noteEditModalErrorRef.current?.focus();
        } finally {
          setLoadingIconState(false);
        }
      };

      uploadNoteImage();
    }
  };

  const handleDeleteImage = (index: number) => {
    const deleteNoteImage = async () => {
      try {
        setLoadingIconState(true);
        if (note._id && note.images) {
          const noteImageDelete = await deleteImage(
            note._id,
            note.images[index]
          );
          if (noteImageDelete) {
            setNote((prevData) => ({
              ...prevData,
              images: noteImageDelete.images,
              imageCount: noteImageDelete.imageCount,
            }));
            setnoteEditModalError("");
            toast.success("Image deleted successfully.");
          }
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error(error);
          const errorMessage = error.response?.data.message
            ? error.response?.data.message
            : error.message;
          setnoteEditModalError(errorMessage);
        }
        noteEditModalErrorRef.current?.focus();
      } finally {
        setLoadingIconState(false);
      }
    };

    deleteNoteImage();
  };

  return (
    <div
      className={`z-4 fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 ${
        isFullScreen ? "p-0" : ""
      }`}
      data-testid="note-edit-modal"
    >
      <div
        className={`bg-white rounded-3xl shadow-lg flex flex-col ${
          isFullScreen ? "w-full h-full rounded-none" : "max-w-5xl w-full"
        }`}
      >
        {noteEditModalError && (
          <p
            ref={noteEditModalErrorRef}
            className="mx-auto my-[2%] pl-[0.25%] pr-[0.15%] py-[0.15%] w-[60%] rounded-[0.35em] bg-[#fcb2a2] border-[2px] border-[#ff0000] text-[#000000] leading-[1.2] text-[0.55em]"
            aria-live="assertive"
          >
            {noteEditModalError}
          </p>
        )}
        <div className="flex justify-between items-center p-4">
          <button
            onClick={toggleFullScreen}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            aria-label="Toggle fullscreen"
          >
            {isFullScreen ? (
              <i className="bi bi-arrows-angle-contract"></i>
            ) : (
              <i className="bi bi-arrows-angle-expand"></i>
            )}
          </button>
          <div className="flex space-x-2">
            <button
              onClick={handleIsFavourite}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              {note.isFavourite ? (
                <i className="bi bi-star-fill"></i>
              ) : (
                <i className="bi bi-star"></i>
              )}
            </button>
            <button
              onClick={closeNoteModal}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-300">
            {note.createdAt && formatTimestamp(note.createdAt, "long")}
          </p>
          <div className="flex items-center mb-2">
            {isEditingHeading ? (
              <input
                type="text"
                name="heading"
                value={note.heading}
                onChange={handleInputChange}
                onBlur={handleSaveHeading}
                className="text-xl font-bold outline-none"
                autoFocus
                aria-label="heading"
              />
            ) : (
              <h2 className="text-xl font-bold">{note.heading}</h2>
            )}
            <button
              onClick={() => setIsEditingHeading(true)}
              className="ml-2 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              aria-label="Edit heading"
            >
              <i className="bi bi-pencil-fill"></i>
            </button>
          </div>
        </div>
        {note.type === "audio" && (
          <div className="mt-3 mx-3 p-2 border border-gray-100 rounded-3xl flex items-center space-x-4 bg-gray-100 text-[0.8rem] md:text-[1.1rem]">
            <button
              onClick={handlePlayPause}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black hover:bg-gray-500 text-white" aria-label="Play and Pause button"
            >
              {isPlaying ? (
                <i className="bi bi-pause-fill"></i>
              ) : (
                <i className="bi bi-play-fill"></i>
              )}
            </button>
            <div
              className="flex-1 bg-gray-200 h-2 rounded-full relative cursor-pointer"
              onClick={handleSeek}
            >
              <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleAudioEnded}
              />
              <div
                className="bg-blue-700 h-2 rounded-full absolute left-0 top-0"
                style={{ width: `${progress}%` }}
              />
              <span
                className="w-4 h-4 bg-blue-700 rounded-full absolute top-1/2 transform -translate-y-1/2"
                style={{ left: `${progress}%`, marginLeft: "-0.5rem" }}
              />
            </div>
            <p className="text-[1em] text-gray-500">
              {new Date(currentTime * 1000).toISOString().slice(14, 19)} /{" "}
              {duration &&
                new Date(duration * 1000).toISOString().slice(14, 19)}
            </p>
            <button
              onClick={handleAudioDownload}
              className="p-2.5 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 text-[1em]"
            >
              <i className="pr-2 bi bi-download"></i>Download audio
            </button>
          </div>
        )}
        <div className="mt-3 mx-3 p-2 w-[60%] md:w-[30%] border border-gray-100 rounded-3xl bg-gray-100">
          <div className="flex space-x-4">
            {[
              {
                label: "Text",
                type: "text",
                icon: <i className="bi bi-journal-bookmark"></i>,
              },
              {
                label: "Transcript",
                type: "audio",
                icon: <i className="bi bi-text-left"></i>,
              },
            ].map((link) => (
              <div
                key={link.label}
                className={`flex items-center space-x-2 py-1 pr-2.5 pl-2.5 rounded-3xl ${
                  note.type === link.type
                    ? "bg-white text-black"
                    : "text-gray-400"
                }`}
              >
                <span>{link.icon}</span>
                <span className="text-sm">{link.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 mx-3 p-4 border border-gray-100 rounded-3xl">
          <div className="flex justify-end items-center mb-2">
            <button
              onClick={displayNoteContentModal}
              className="ml-2 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <i className="bi bi-pencil-fill"></i>
            </button>
            <button className="ml-2 w-22 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-400">
              <i className="pr-2 bi bi-files"></i> Copy
            </button>
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">{noteContent}</p>
          {noteContent.length >= 200 ? (
            <button
              onClick={displayNoteContentModal}
              className="text-sm text-gray-500 mt-2 underline"
            >
              Read more
            </button>
          ) : (
            ""
          )}
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-10 overflow-auto max-h-40">
            {note.images &&
              note.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Uploaded ${index}`}
                    className="w-40 h-40 object-cover border border-gray-100 rounded-3xl"
                  />
                  <button
                    onClick={() => handleDeleteImage(index)}
                    className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                  >
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </div>
              ))}
            <div className="w-40 h-40 bg-gray-100 border-1 border-dashed border-gray-300 rounded-3xl flex items-center justify-center cursor-pointer">
              <span
                className="inline-flex flex-col justify-center items-center w-full h-full text-gray-500"
                onClick={handleImageUploadClick}
              >
                <i className="bi bi-plus"></i>
                Image
              </span>
              <input
                className="hidden"
                ref={imageInputRef}
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </div>
        </div>
        {showNoteContentModal && (
          <NoteContentEditModal
            initialContent={note.content}
            showNoteContentEditModal={setShowNoteContentModal}
            editContent={updateNoteContent}
          />
        )}
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

export default NoteEditModal;
