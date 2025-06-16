interface SortProps {
  setNotesSorted: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sort = ({ setNotesSorted }: SortProps) => {
  return (
    <button
      lang="en"
      name="sort"
      onClick={() => setNotesSorted((previousValue) => !previousValue)}
      className="flex justify-center items-center ml-1.5 md:ml-2 p-1.2 w-[24%] md:w-[16%] lg:w-[10%] h-full border border-[#f0f0f0] rounded-3xl bg-gray-100 hover:bg-gray-300 text-[1rem] md:text-[1.25rem] lg:text-[1.5rem]"
    >
      <i className="text-[0.75em] p-1 bi bi-sliders"></i>
      <span className="text-[0.9em]">Sort</span>
    </button>
  );
};

export default Sort;
