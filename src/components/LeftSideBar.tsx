import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { Fragment, useEffect, useState } from "react";
import useAuthContext from "../hooks/useAuthContext";

interface LeftSideBarProps {
  pageType: string;
}

const LeftSideBar = ({ pageType }: LeftSideBarProps) => {
  const { loginStatusState, tokenRefresh, logOut } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (loginStatusState.loggedIn) {
      tokenRefresh();
    }
  }, [loginStatusState.loggedIn]);

  const displaySignUpForm = () => {
    navigate("/signup");
  };

  const displayLogInForm = () => {
    navigate("/login");
  };

  const displayFavouriteNotes = () => {
    if (!loginStatusState.loggedIn)
      toast.error("You should be logged in to perform this action.");
    else navigate("/favourites");
  };

  const showLogOutMenu = () => {
    if (isMenuOpen) setIsMenuOpen(false);
    else setIsMenuOpen(true);
  };

  const handleUpdateProfile = () => {
    if (loginStatusState.loggedIn) {
      navigate("/update-profile");
    }
  };

  const [hamburgerMenuDisplay, setHamburgerMenuDisplay] =
    useState<boolean>(false);
  const toggleHamburgerMenuDisplay = () => {
    setHamburgerMenuDisplay(!hamburgerMenuDisplay);
  };

  return (
    <div
      className={`z-3 fixed p-2 md:p-2 w-[33%] md:w-[25%] lg:w-[20%] xl:w-[15%] ${
        hamburgerMenuDisplay ? "h-[98%]" : ""
      } md:h-[96%] flex flex-col border border-[#f0f0f0] rounded-3xl bg-white text-[1rem] md:text-[1.5rem] lg:text-[1.75rem]`}
    >
      <div
        className={`md:mb-4 md:p-3 h-[8%] flex ${
          hamburgerMenuDisplay ? "border-b-1 border-[#f0f0f0]" : ""
        } md:border-b-1 md:border-[#f0f0f0]`}
      >
        <svg
          className="flex p-0 w-[15%] bg-transparent cursor-pointer md:hidden"
          onClick={toggleHamburgerMenuDisplay}
          viewBox="0 0 100 100"
        >
          <path
            className={`[fill:none] stroke-[black] stroke-[6] [transition:stroke-dasharray_600ms_cubic-bezier(0.4,_0,_0.2,_1),_stroke-dashoffset_600ms_cubic-bezier(0.4,_0,_0.2,_1)] 
                    ${
                      hamburgerMenuDisplay
                        ? "[stroke-dasharray:90_207] [stroke-dashoffset:-134]"
                        : "[stroke-dasharray:60_207]"
                    }`}
            d="M 20,29.000046 H 80.000231 C 80.000231,29.000046 94.498839,28.817352 94.532987,66.711331 94.543142,77.980673 90.966081,81.670246 85.259173,81.668997 79.552261,81.667751 75.000211,74.999942 75.000211,74.999942 L 25.000021,25.000058"
          />
          <path
            className={`[fill:none] stroke-[black] stroke-[6] [transition:stroke-dasharray_600ms_cubic-bezier(0.4,_0,_0.2,_1),_stroke-dashoffset_600ms_cubic-bezier(0.4,_0,_0.2,_1)] 
                    ${
                      hamburgerMenuDisplay
                        ? "[stroke-dasharray:1_60] [stroke-dashoffset:-30]"
                        : "[stroke-dasharray:60_60]"
                    }`}
            d="M 20,50 H 80"
          />
          <path
            className={`[fill:none] stroke-[black] stroke-[6] [transition:stroke-dasharray_600ms_cubic-bezier(0.4,_0,_0.2,_1),_stroke-dashoffset_600ms_cubic-bezier(0.4,_0,_0.2,_1)] 
                    ${
                      hamburgerMenuDisplay
                        ? "[stroke-dasharray:90_207] [stroke-dashoffset:-134]"
                        : "[stroke-dasharray:60_207]"
                    }`}
            d="M 20,70.999954 H 80.000231 C 80.000231,70.999954 94.498839,71.182648 94.532987,33.288669 94.543142,22.019327 90.966081,18.329754 85.259173,18.331003 79.552261,18.332249 75.000211,25.000058 75.000211,25.000058 L 25.000021,74.999942"
          />
        </svg>
        <div className="flex items-center w-[85%]">
          <i className="text-[1em] pr-1 pl-2 bi bi-journal-text"></i>
          <Link className="text-[1.1em] pl-1" to="/">
            Noter
          </Link>
        </div>
      </div>
      <div
        className={`${
          hamburgerMenuDisplay
            ? "overflow-visible max-md:top-[2.5rem] h-[92%]"
            : "max-md:overflow-hidden h-[0]"
        } max-md:left-0 md:h-[90%] flex flex-col justify-between`}
      >
        <div className="h-[15%] flex flex-col">
          <div className="flex flex-row items-center w-full h-10 group rounded-3xl hover:bg-[#f2e7fe]">
            <i className="group-hover:text-[#61319c] text-[0.75em] pr-1 pl-2 bi bi-house-fill"></i>
            <Link
              className="text-[0.75em] pl-1 group-hover:text-[#61319c]"
              to="/"
            >
              Home
            </Link>
          </div>
          {loginStatusState.loggedIn && (
            <div className="flex flex-row items-center w-full h-10 group rounded-3xl hover:bg-[#f2e7fe]">
              <i className="group-hover:text-[#61319c] text-[0.75em] pr-1 pl-2 bi bi-star-fill"></i>
              <button
                onClick={displayFavouriteNotes}
                className="text-[0.75em] pl-1 group-hover:text-[#61319c]"
              >
                Favourites
              </button>
            </div>
          )}
        </div>
        <div
          className={`${
            isMenuOpen ? "mb-15" : "mb-2"
          } h-[15%] flex flex-col justify-end`}
        >
          {loginStatusState.loggedIn ? (
            <div className="relative w-full h-10 flex flex-row items-center rounded-3xl text-[0.9rem] md:text-[1.5rem] lg:text-[1.75rem]">
              <span className="inline-flex justify-center items-center w-[1.25rem] md:w-[1.75rem] h-[1.25rem] md:h-[1.75rem] rounded-[50%] bg-[#111111] text-[#ffffff] text-center text-[0.75em]">
                {loginStatusState.userName.substring(0, 1)}
              </span>
              <p className="pl-2 flex-[1_1_auto] text-[0.75em]">
                {loginStatusState.userName}
              </p>
              <span onClick={showLogOutMenu}>
                <i
                  className={`pl-6 text-[0.75em] bi ${
                    isMenuOpen ? "bi-chevron-up" : "bi-chevron-down"
                  }`}
                  aria-label="User menu toggle"
                ></i>
                {isMenuOpen && (
                  <div className="absolute top-[2.25rem] left-[81%] w-[80%] bg-white rounded-lg shadow-lg">
                    <button
                      type="button"
                      onClick={handleUpdateProfile}
                      className="w-full py-2 px-2 hover:bg-gray-100 text-[0.75em] text-left"
                    >
                      Update profile
                    </button>
                    <button
                      type="button"
                      onClick={logOut}
                      className="w-full py-2 px-2 hover:bg-gray-100 text-[0.75em] text-left"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </span>
            </div>
          ) : (
            <Fragment>
              {pageType !== "Login" &&  (
                <button
                  type="button"
                  onClick={displayLogInForm}
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2"
                >
                  Log in
                </button>
              )}
              {pageType !== "SignUp" && pageType !== "Reset Password" && (
                <button
                  type="button"
                  onClick={displaySignUpForm}
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2"
                >
                  Sign up
                </button>
              )}
            </Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftSideBar;
