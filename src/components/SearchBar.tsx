interface SearchBarProps {
  setSearchBarQuery: React.Dispatch<React.SetStateAction<string>>;
}

const SearchBar = ({ setSearchBarQuery }: SearchBarProps) => {
  return (
    <div className="ml-1.5 md:ml-4 w-[74%] md:w-[78%] lg:w-[90%] h-full relative flex items-center font-inter">
      <input
        type="text"
        placeholder="Search"
        onChange={(event) => setSearchBarQuery(event.target.value)}
        className="w-full pt-2 pr-2 pb-2 pl-10 border border-[#f0f0f0] rounded-3xl placeholder-gray-300 focus:outline-none"
      />
      <i className="absolute left-4 text-[#dbdbdb] pointer-events-none bi bi-search"></i>
    </div>
  );
};

export default SearchBar;
