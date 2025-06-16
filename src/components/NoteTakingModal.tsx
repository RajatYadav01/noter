import axios from "axios";
import { toast } from "react-toastify";
import React, { useEffect, useRef, useState } from "react";
import { Note, newNote } from "../services/Note";
import useAuthContext from "../hooks/useAuthContext";

interface NoteTakingModalProps {
  showNoteTakingModal: React.Dispatch<React.SetStateAction<boolean>>;
  audio: Blob | null;
  audioName: string;
  audioDuration: number;
  audioTranscription: string;
  setNewNoteCreated: React.Dispatch<React.SetStateAction<boolean>>;
}

const NoteTakingModal = ({
  showNoteTakingModal,
  audio,
  audioName,
  audioDuration,
  audioTranscription,
  setNewNoteCreated,
}: NoteTakingModalProps) => {
  const { loginStatusState } = useAuthContext();

  const [note, setNote] = useState<Note>({
    userID: loginStatusState.userID,
    type: audio ? "audio" : "text",
    heading: "",
    content: audioTranscription,
    audioRecording: audio,
    audioDuration: audioDuration,
    images: null,
    imageCount: 0,
    isFavourite: false,
  });
  const audioURL = useRef<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const animationFrameRef = useRef<number>(0);
  const [noteTakingError, setNoteTakingError] = useState<string>("");
  const noteTakingErrorRef = useRef<HTMLParagraphElement | null>(null);
  const [loadingIconState, setLoadingIconState] = useState(false);

  useEffect(() => {
    return () => {
      setNote({
        userID: "",
        type: "text",
        heading: "",
        content: "",
        audioRecording: null,
        audioDuration: 0,
        images: null,
        imageCount: 0,
        isFavourite: false,
      });
    };
  }, []);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNote((prevData) => ({
      ...prevData,
      [event.target.name]: event.target.value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const imageFiles = Array.from(event.target.files);
      const imageFileCount = event.target.files.length;
      setNote((prevData) => ({
        ...prevData,
        image: imageFiles,
        imageCount: imageFileCount,
      }));
    }
  };

  useEffect(() => {
    if (note.audioRecording && audioRef.current) {
      audioURL.current = URL.createObjectURL(note.audioRecording);
      audioRef.current.src = audioURL.current;
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

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(note.audioDuration);
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
        if (note.audioRecording) {
          const url = window.URL.createObjectURL(
            new Blob([note.audioRecording])
          );
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", audioName);
          link.click();
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error(error);
          const errorMessage = error.response?.data.message
            ? error.response?.data.message
            : error.message;
          setNoteTakingError(errorMessage);
        }
        noteTakingErrorRef.current?.focus();
      } finally {
        setLoadingIconState(false);
      }
    };
    downloadNoteAudioRecording();
  };

  const handleCancel = () => {
    showNoteTakingModal(false);
  };

  const getFormData = (object: Note) =>
    Object.keys(object).reduce((formData, key) => {
      const value = note[key as keyof Note];
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append("images", item));
      } else if (value instanceof Blob) {
        formData.append(key, value, audioName);
      } else if (typeof value === "string" || typeof value === "number") {
        formData.append(key, value.toString());
      }
      return formData;
    }, new FormData());

  const handleSave = async () => {
    const formData = getFormData(note);
    try {
      setLoadingIconState(true);
      const createNote = await newNote(formData);
      if (createNote === "Note created successfully") {
        toast.success("New note created successfully");
        setNoteTakingError("");
        setNewNoteCreated(true);
        showNoteTakingModal(false);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error) {
          console.error(error);
          const errorMessage = error.response?.data.message
            ? error.response?.data.message
            : error.message;
          setNoteTakingError(errorMessage);
        }
      }
      noteTakingErrorRef.current?.focus();
    } finally {
      setLoadingIconState(false);
    }
  };

  return (
    <div className="z-4 fixed inset-0 p-4 bg-gray-900/50 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-2xl min-h-[400px] max-h-[90vh] flex flex-col overflow-hidden">
        {noteTakingError && (
          <p
            ref={noteTakingErrorRef}
            className="mx-auto my-[2%] pl-[0.25%] pr-[0.15%] py-[0.15%] w-[60%] rounded-[0.35em] bg-[#fcb2a2] border-[2px] border-[#ff0000] text-[#000000] leading-[1.2] text-[0.55em]"
            aria-live="assertive"
          >
            {noteTakingError}
          </p>
        )}
        <div className="px-4 py-8">
          <input
            type="text"
            placeholder="Enter a heading for the note"
            name="heading"
            value={note.heading}
            onChange={handleInputChange}
            className="block w-full px-4 py-2 text-sm font-normal shadow-xs text-gray-900 bg-transparent border border-gray-300 rounded-2xl placeholder-gray-400 focus:outline-none leading-relaxed"
          />
        </div>
        {audio && (
          <div className="mt-3 mx-3 p-2 border border-gray-100 rounded-3xl flex items-center space-x-4 bg-gray-100">
            <button
              onClick={handlePlayPause}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black hover:bg-gray-500 text-white"
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
                onLoadedMetadata={handleLoadedMetadata}
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
            <p className="text-sm text-gray-500">
              {new Date(currentTime * 1000).toISOString().slice(14, 19)} /{" "}
              {duration &&
                new Date(duration * 1000).toISOString().slice(14, 19)}
            </p>
            <button
              onClick={handleAudioDownload}
              className="p-2.5 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200"
            >
              <i className="pr-2 bi bi-download"></i>Download audio
            </button>
          </div>
        )}
        <div className="p-4 flex-1 overflow-auto">
          <textarea
            placeholder="Enter the content of note"
            name="content"
            value={note.content}
            onChange={handleInputChange}
            className="block w-full h-40 px-4 py-2 text-sm font-normal shadow-xs text-gray-900 bg-transparent border border-gray-300 rounded-2xl placeholder-gray-400 focus:outline-none resize-y leading-relaxed"
            style={{ minHeight: "150px" }}
          />
        </div>
        <div className="p-4">
          <label
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            htmlFor="file_input"
          >
            Upload image
          </label>
          <input
            id="file_input"
            name="images"
            type="file"
            accept="image/*"
            multiple={true}
            onChange={handleImageUpload}
            className="w-full text-gray-400 font-semibold text-sm bg-white border border-gray-300 rounded-2xl file:cursor-pointer cursor-pointer file:border-0 file:py-3 file:px-4 file:mr-4 file:bg-gray-100 file:hover:bg-gray-200 file:text-gray-500"
          />
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
        <div className="p-4 flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteTakingModal;
