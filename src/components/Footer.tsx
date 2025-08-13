import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="fixed left-0 bottom-0 flex flex-row justify-center w-full py-1 border-t border-gray-100 rounded-3xl bg-white text-center text-gray-400 text-sm md:text-md lg:text-lg xl:text-2xl font-manrope font-[300]">
      <span>Made by </span>
      <Link
        to="https://github.com/RajatYadav01"
        className="flex flex-row items-center"
      >
        <span className="ml-1.75 mr-1.75">Rajat Yadav</span>
        <i className="bi bi-github text-sm md:text-md lg:text-lg xl:text-xl"></i>
      </Link>
    </footer>
  );
}