import { Link } from "react-router-dom";

function PageNotFound() {
  return (
    <div className="w-full h-full text-center text-[3rem] md:text-[6rem] lg:text-[7.5rem] xl:text-[8.5rem] 2xl:text-[10rem]">
      <h1 className="mt-[10%] mb-[2%] text-[#969696] text-[1em] font-[700]">
        404 Error
      </h1>
      <h2 className="mt-[2%] mb-[2%] text-[#646464] text-[0.5em] font-[500]">
        Page not found
      </h2>
      <h2 className="mt-[2%] mb-[2%] text-[#646464] text-[0.3em] font-[400]">
        Click{" "}
        <Link
          to=".."
          className="no-underline text-[#2d9ef6] leading-[2] font-[400]"
        >
          here
        </Link>{" "}
        to go back
      </h2>
    </div>
  );
}

export default PageNotFound;
