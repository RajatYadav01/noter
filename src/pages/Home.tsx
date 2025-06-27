import axios from "axios";
import { toast } from "react-toastify";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState, useEffect, useRef, Fragment } from "react";
import LeftSideBar from "../components/LeftSideBar";
import NoteTakingModal from "../components/NoteTakingModal";
import NoteCard from "../components/NoteCard";
import NoteEditModal from "../components/NoteEditModal";
import SearchBar from "../components/SearchBar";
import Sort from "../components/Sort";
import AudioTranslator from "../components/AudioTranslator";
import Pagination from "../components/Pagination";
import { Note, getAllNotes } from "../services/Note";
import useAuthContext from "../hooks/useAuthContext";

interface HomePropsType {
  displayOnlyFavouriteNotes?: boolean;
}

interface TranslatedAudio {
  audio: Blob | null;
  audioName: string;
  audioDuration: number;
  audioTranscript: string;
}

const Home = ({ displayOnlyFavouriteNotes }: HomePropsType) => {
  const { loginStatusState } = useAuthContext();

  const [isNoteTakingModalOpen, setIsNoteTakingModalOpen] =
    useState<boolean>(false);
  const [isTranslatedAudio, setIsTranslatedAudio] = useState<TranslatedAudio>({
    audio: null,
    audioName: "",
    audioDuration: 0,
    audioTranscript: "",
  });
  const [isNoteEditModalOpen, setIsNoteEditModalOpen] =
    useState<boolean>(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isNoteCreated, setIsNoteCreated] = useState<boolean>(false);
  const [isNoteUpdated, setIsNoteUpdated] = useState<boolean>(false);
  const [isNoteDeleted, setIsNoteDeleted] = useState<boolean>(false);
  const [selectedNoteID, setSelectedNoteID] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sort, setSort] = useState<boolean>(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [notesPerPage, setNotesPerPage] = useState(10);
  const [homeError, setHomeError] = useState<string>("");
  const homeErrorRef = useRef<HTMLParagraphElement | null>(null);
  const [loadingIconState, setLoadingIconState] = useState(false);

  useEffect(() => {
    if (loginStatusState.userID) {
      const fetchNotes = async () => {
        try {
          setLoadingIconState(true);
          const fetchedNotes = await getAllNotes();
          if (fetchedNotes) setNotes(fetchedNotes);
          else setNotes([]);
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            console.error(error);
            const errorMessage = error.response?.data.message
              ? error.response?.data.message
              : error.message;
            setHomeError(errorMessage);
          }
          homeErrorRef.current?.focus();
        } finally {
          setLoadingIconState(false);
        }
      };

      fetchNotes();
      setIsNoteCreated(false);
      setIsNoteUpdated(false);
      setIsNoteDeleted(false);
    } else if (!loginStatusState.userID) {
        setNotes([]);
        setFilteredNotes([]);
    }
  }, [loginStatusState.userID, isNoteCreated, isNoteUpdated, isNoteDeleted]);

  const createChunks = (array: Note[], size: number) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const indexOfLastNote = currentPageNumber * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentPageNumberNotes = filteredNotes.slice(
    indexOfFirstNote,
    indexOfLastNote
  );
  const totalNumberOfPages = Math.ceil(filteredNotes.length / notesPerPage);

  const notesListChunks = createChunks(currentPageNumberNotes, 4);

  const changeNotesPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNotesPerPage(parseInt(event.target.value, 10));
  };

  const paginate = (
    selectionType: string,
    selectedPageNumber: string | number
  ) => {
    if (selectionType === "Previous" && currentPageNumber > 1)
      setCurrentPageNumber(currentPageNumber - 1);
    else if (
      selectionType === "Change" &&
      typeof selectedPageNumber === "number"
    )
      setCurrentPageNumber(selectedPageNumber);
    else if (
      selectionType === "Change" &&
      typeof selectedPageNumber === "string" &&
      selectedPageNumber === "... "
    )
      setCurrentPageNumber(1);
    else if (
      selectionType === "Change" &&
      typeof selectedPageNumber === "string" &&
      selectedPageNumber === " ..."
    )
      setCurrentPageNumber(totalNumberOfPages);
    else if (selectionType === "Next" && currentPageNumber < totalNumberOfPages)
      setCurrentPageNumber(currentPageNumber + 1);
  };

  useEffect(() => {
    if (!isNoteTakingModalOpen) {
      setIsTranslatedAudio({
        audio: null,
        audioName: "",
        audioDuration: 0,
        audioTranscript: "",
      });
    }
  }, [isNoteTakingModalOpen]);

  const displayNoteTakingModal = () => {
    if (!loginStatusState.loggedIn)
      toast.error("You should be logged in to perform this action.");
    else setIsNoteTakingModalOpen(true);
  };

  useEffect(() => {
    let currentNotes;
    currentNotes = notes.filter(
      (note) =>
        note.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (sort)
      currentNotes = currentNotes.sort((a, b) => {
        return (
          new Date(a.createdAt ?? 0).getTime() -
          new Date(b.createdAt ?? 0).getTime()
        );
      });
    else
      currentNotes = currentNotes.sort((a, b) => {
        return (
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
        );
      });
    if (displayOnlyFavouriteNotes)
      currentNotes = currentNotes.filter((note) => note.isFavourite === true);
    setFilteredNotes(currentNotes);
  }, [notes, searchQuery, sort, displayOnlyFavouriteNotes]);

  return (
    <Fragment>
      <div className="p-2 md:p-2 w-full flex flex-row font-lato">
        <LeftSideBar pageType="Home" />
        <div className="ml-[35%] md:ml-[26%] lg:ml-[21%] xl:ml-[16%] w-[65%] md:w-[74%] lg:w-[84%] flex flex-row">
          <SearchBar setSearchBarQuery={setSearchQuery} />
          <Sort setNotesSorted={setSort} />
        </div>
      </div>
      {homeError && (
        <p
          ref={homeErrorRef}
          className="mx-auto my-[2%] pl-[0.25%] pr-[0.15%] py-[0.15%] w-[60%] rounded-[0.35em] bg-[#fcb2a2] border-[2px] border-[#ff0000] text-[#000000] leading-[1.2] text-[0.55em]"
          aria-live="assertive"
        >
          {homeError}
        </p>
      )}
      {loadingIconState ? (
        <div
          role="status"
          className="flex flex-row justify-center items-center w-[100%] h-[100%]"
        >
          <svg
            aria-hidden="true"
            className="w-16 h-16 text-gray-200 animate-spin fill-blue-600"
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
      ) : (
        <Fragment>
          {filteredNotes.length !== 0 &&
            notesListChunks.map((chunk, i) => (
              <div
                id="notes-list"
                className="md:ml-[28%] lg:ml-[21%] xl:ml-[17%] p-2 w-full md:w-[72%] lg:w-[79%] xl:w-[83%] grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
                key={i}
              >
                {chunk.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    showNoteEditModal={setIsNoteEditModalOpen}
                    setCurrentNoteID={setSelectedNoteID}
                    setNoteDeleted={setIsNoteDeleted}
                  />
                ))}
              </div>
            ))}
          {filteredNotes.length !== 0 && (
            <div className="flex flex-row md:ml-[28%] lg:ml-[21%] xl:ml-[17%] p-2 pb-40 w-full md:w-[72%] lg:w-[79%] xl:w-[83%]">
              <select
                defaultValue={8}
                className="w-[20%] lg:w-[6%] h-[2.5rem] border-1 border-solid border-[#f0f0f0] rounded-xl"
                aria-label="Select number of notes"
                onChange={changeNotesPerPage}
              >
                <option>Select number of notes per page</option>
                <option value="4">4</option>
                <option value="8">8</option>
                <option value="12">12</option>
                <option value="16">16</option>
                <option value="20">20</option>
              </select>
              <Pagination
                currentPageNumber={currentPageNumber}
                totalNumberOfPages={totalNumberOfPages}
                paginate={paginate}
              />
            </div>
          )}
        </Fragment>
      )}
      {isNoteEditModalOpen && (
        <NoteEditModal
          showNoteEditModal={setIsNoteEditModalOpen}
          currentNoteID={selectedNoteID}
          setNoteUpdated={setIsNoteUpdated}
        />
      )}
      {isNoteTakingModalOpen && (
        <NoteTakingModal
          showNoteTakingModal={setIsNoteTakingModalOpen}
          audio={isTranslatedAudio.audio}
          audioName={isTranslatedAudio.audioName}
          audioDuration={isTranslatedAudio.audioDuration}
          audioTranscription={isTranslatedAudio.audioTranscript}
          setNewNoteCreated={setIsNoteCreated}
        />
      )}
      <div className="z-2 mt-2 mr-auto ml-auto p-2 fixed bottom-[2%] left-[5%] md:left-[40%] w-[90%] md:w-[40%] h-16 flex flex-row justify-between items-center border border-[#f0f0f0] rounded-4xl shadow-[8px_-10px_10px_-5px_rgba(0,_0,_0,_0.1),-8px_10px_10px_-5px_rgba(0,_0,_0,_0.1)] bg-white">
        <button
          type="button"
          className="inline-flex justify-center items-center ml-2 p-1 w-[3rem] h-[3rem] rounded-[50%] bg-gray-100 hover:bg-gray-300 text-center"
          onClick={displayNoteTakingModal}
        >
          <i className="bi bi-pencil-fill"></i>
        </button>
        <AudioTranslator
          setTranslatedAudio={setIsTranslatedAudio}
          showNoteTakingModal={setIsNoteTakingModalOpen}
        />
      </div>
    </Fragment>
  );
};

export default Home;
