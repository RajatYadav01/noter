import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import React, { useEffect, useReducer, useRef, useState } from "react";
import { Link } from "react-router-dom";
import LeftSideBar from "../components/LeftSideBar";
import useAuthContext from "../hooks/useAuthContext";

interface LoginFormType {
  emailAddress: string;
  password: string;
}

interface LoginFormErrorsType {
  emailAddressError: string;
  passwordError: string;
  loginError: string;
}

interface LoginFormErrorsActionType {
  type: string;
  payload: string;
}

interface LoginFormInputStatusType {
  valid: boolean;
  focused: boolean;
}

interface LoginFormInputActionType {
  type: string;
  payload: boolean;
}

const loginFormInputStatusInitialState = {
  valid: true,
  focused: false,
};

const inputStatusReducer = (
  state: LoginFormInputStatusType,
  action: LoginFormInputActionType
) => {
  switch (action.type) {
    case "focus":
      return { ...state, focused: action.payload };
    case "valid":
      return { ...state, valid: action.payload };
    default:
      throw new Error();
  }
};

const loginFormErrorsInitialState = {
  emailAddressError: "",
  passwordError: "",
  loginError: "",
};

const errorReducer = (
  state: LoginFormErrorsType,
  action: LoginFormErrorsActionType
) => {
  switch (action.type) {
    case "emailAddress":
      return { ...state, emailAddressError: action.payload };
    case "password":
      return { ...state, passwordError: action.payload };
    case "login":
      return { ...state, loginError: action.payload };
    default:
      throw new Error();
  }
};

interface LoginFormPasswordVisibilityStatusType {
  visibilityType: string;
  visibilityIcon: string;
}

interface LoginFormPasswordVisibilityActionType {
  name: string;
  type: string;
  icon: string;
}

const loginFormPasswordVisibilityStatusInitialState = {
  visibilityType: "password",
  visibilityIcon: "bi-eye-slash-fill",
};

const passwordVisibilityStatusReducer = (
  state: LoginFormPasswordVisibilityStatusType,
  action: LoginFormPasswordVisibilityActionType
) => {
  switch (action.name) {
    case "password":
      return {
        ...state,
        visibilityType: action.type,
        visibilityIcon: action.icon,
      };
    default:
      throw new Error();
  }
};

const Login = () => {
  const { logIn } = useAuthContext();

  const [loginFormState, setLoginFormState] = useState<LoginFormType>({
    emailAddress: "",
    password: "",
  });

  const [loadingIconState, setLoadingIconState] = useState(false);

  const emailAddressInputRef = useRef<HTMLInputElement | null>(null);

  const loginErrorRef = useRef<HTMLParagraphElement | null>(null);
  const emailAddressErrorRef = useRef<HTMLParagraphElement | null>(null);
  const passwordErrorRef = useRef<HTMLParagraphElement | null>(null);

  const [emailAddressInputStatus, dispatchEmailAddressInputStatus] = useReducer(
    inputStatusReducer,
    loginFormInputStatusInitialState
  );
  const [passwordInputStatus, dispatchPasswordInputStatus] = useReducer(
    inputStatusReducer,
    loginFormInputStatusInitialState
  );

  const [passwordVisibilityStatus, dispatchPasswordVisibilityStatus] =
    useReducer(
      passwordVisibilityStatusReducer,
      loginFormPasswordVisibilityStatusInitialState
    );

  const togglePasswordVisibilityStatus = (inputFieldName: string) => {
    if (
      inputFieldName === "password" &&
      passwordVisibilityStatus.visibilityType === "password"
    )
      dispatchPasswordVisibilityStatus({
        name: inputFieldName,
        type: "text",
        icon: "bi-eye-fill",
      });
    else if (
      inputFieldName === "password" &&
      passwordVisibilityStatus.visibilityType === "text"
    )
      dispatchPasswordVisibilityStatus({
        name: inputFieldName,
        type: "password",
        icon: "bi-eye-slash-fill",
      });
  };

  const [errorMessage, dispatchErrorMessage] = useReducer(
    errorReducer,
    loginFormErrorsInitialState
  );

  useEffect(() => {
    emailAddressInputRef.current?.focus();
  }, []);

  const emailAddressRegEx =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  const isLoginButtonDisabled = !emailAddressInputStatus.valid;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoginFormState((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  };

  useEffect(() => {
    const emailAddressValidationResult = emailAddressRegEx.test(
      loginFormState.emailAddress
    );
    dispatchEmailAddressInputStatus({
      type: "valid",
      payload: emailAddressValidationResult,
    });
  }, [loginFormState.emailAddress]);

  useEffect(() => {
    dispatchErrorMessage({ type: "emailAddress", payload: "" });
    dispatchErrorMessage({ type: "login", payload: "" });
  }, [loginFormState.emailAddress]);

  useEffect(() => {
    dispatchErrorMessage({ type: "password", payload: "" });
    dispatchErrorMessage({ type: "login", payload: "" });
  }, [loginFormState.password]);

  const handleLogin = async (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailAddressValidation = () => {
      if (loginFormState.emailAddress === "") {
        dispatchErrorMessage({
          type: "emailAddress",
          payload: "Email address cannot be empty.",
        });
        dispatchEmailAddressInputStatus({ type: "valid", payload: false });
      } else if (!emailAddressRegEx.test(loginFormState.emailAddress)) {
        dispatchErrorMessage({
          type: "emailAddress",
          payload: "Invalid email address.",
        });
        dispatchEmailAddressInputStatus({ type: "valid", payload: false });
      }
    };
    const passwordValidation = () => {
      if (loginFormState.password === "") {
        dispatchErrorMessage({
          type: "password",
          payload: "Password cannot be empty.",
        });
        dispatchPasswordInputStatus({ type: "valid", payload: false });
      }
    };
    emailAddressValidation();
    passwordValidation();
    if (!emailAddressInputStatus.valid || !passwordInputStatus.valid) {
      dispatchErrorMessage({ type: "login", payload: "Invalid data" });
      return;
    }
    if (emailAddressInputStatus.valid && passwordInputStatus.valid) {
      try {
        setLoadingIconState(true);
        const logInFormData = JSON.stringify(loginFormState);
        const userLogIn = await logIn(logInFormData);
        if (userLogIn === "Logged in successfully")
          dispatchErrorMessage({
            type: "login",
            payload: "",
          });
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error) {
            console.error(error);
            const errorMessage = error.response?.data.message
              ? error.response?.data.message
              : error.message;
            dispatchErrorMessage({ type: "login", payload: errorMessage });
          }
        }
        loginErrorRef.current?.focus();
      } finally {
        setLoadingIconState(false);
      }
    }
  };

  return (
    <div className="p-4 w-full h-full flex flex-row font-lato">
      <LeftSideBar pageType="Login" />
      <div className="w-full h-full md:ml-[30%] lg:ml-[18%] flex flex-col text-[1.25rem] md:text-[2rem] lg:text-[2.75rem]">
        <h3 className="mx-auto mt-[20%] md:mt-[10%] mb-[1%] w-full h-[9%] text-[#646464] text-center text-[1em] font-lato font-[500]">
          Log in
        </h3>
        {errorMessage.loginError && (
          <p
            ref={loginErrorRef}
            className="mx-auto my-[2%] pl-[0.25%] pr-[0.15%] py-[0.15%] w-full lg:w-[80%] rounded-[0.35em] bg-[#fcb2a2] border-[2px] border-[#ff0000] text-[#000000] leading-[1.2] text-[0.55em]"
            aria-live="assertive"
          >
            {errorMessage.loginError}
          </p>
        )}
        <form
          className="mt-[1%] mb-[1%] mx-0 md:mx-auto p-5 w-full lg:w-[80%] h-[40%] lg:h-[60%] rounded-3xl bg-gray-100 text-[1.75rem] font-inter"
          onSubmit={handleLogin}
          method="POST"
        >
          <div className="relative">
            <input
              id="login-form__email-address"
              className={`mt-[2%] mb-[1%] focus:outline-[none] focus:active:opacity-100 block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer ${
                loginFormState.emailAddress !== ""
                  ? emailAddressInputStatus.valid
                    ? "valid-input"
                    : "invalid-input"
                  : ""
              }`}
              lang="en"
              name="emailAddress"
              type="email"
              maxLength={150}
              ref={emailAddressInputRef}
              value={loginFormState.emailAddress}
              onChange={handleInputChange}
              onFocus={() =>
                dispatchEmailAddressInputStatus({
                  type: "focus",
                  payload: true,
                })
              }
              onBlur={() =>
                dispatchEmailAddressInputStatus({
                  type: "focus",
                  payload: false,
                })
              }
              required={true}
              autoComplete="off"
              aria-invalid={emailAddressInputStatus.valid ? "false" : "true"}
              aria-describedby="login-form__emailAddressRequirements"
            />
            <label
              lang="en"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-1 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              htmlFor="login-form__email-address"
            >
              Enter your email address
            </label>
          </div>
          {errorMessage.emailAddressError && (
            <p
              ref={emailAddressErrorRef}
              className="ml-[0] mr-[0] my-[2%] pl-[0.25%] pr-[0.15%] py-[0.15%] w-full rounded-[0.35em] bg-[#fcb2a2] border-[2px] border-[#ff0000] text-[#000000] leading-[1.2] text-[0.55em]"
              aria-live="assertive"
            >
              {errorMessage.emailAddressError}
            </p>
          )}
          <div className="relative">
            <input
              id="login-form__password"
              className={`mt-[2%] mb-[1%] focus:outline-[none] focus:active:opacity-100 block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer ${
                loginFormState.password !== ""
                  ? passwordInputStatus.valid
                    ? "valid-input"
                    : "invalid-input"
                  : ""
              }`}
              lang="en"
              name="password"
              type={passwordVisibilityStatus.visibilityType}
              maxLength={14}
              value={loginFormState.password}
              onChange={handleInputChange}
              onFocus={() =>
                dispatchPasswordInputStatus({ type: "focus", payload: true })
              }
              onBlur={() =>
                dispatchPasswordInputStatus({ type: "focus", payload: false })
              }
              required={true}
              autoComplete="off"
              aria-invalid={passwordInputStatus.valid ? "false" : "true"}
            />
            <label
              lang="en"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-1 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              htmlFor="login-form__password"
            >
              Enter your password
            </label>
            <span className="absolute inset-y-0 end-0 flex items-center z-1 px-3 cursor-pointer text-[0.6em]">
              <i
                className={`bi ${passwordVisibilityStatus.visibilityIcon}`}
                onClick={() => togglePasswordVisibilityStatus("password")}
              ></i>
            </span>
          </div>
          {errorMessage.passwordError && (
            <p
              ref={passwordErrorRef}
              className="ml-[0] mr-[0] my-[2%] pl-[0.25%] pr-[0.15%] py-[0.15%] w-full rounded-[0.35em] bg-[#fcb2a2] border-[2px] border-[#ff0000] text-[#000000] leading-[1.2] text-[0.55em]"
              aria-live="assertive"
            >
              {errorMessage.passwordError}
            </p>
          )}
          <Link
            to="../reset-password"
            className="block mt-[2%] mr-[0] mb-[0] ml-[1%] w-fit no-underline text-[#2d9ef6] text-[0.6em] font-lato hover:underline"
          >
            Forgot password?
          </Link>
          {loadingIconState && (
            <div role="status" className="mx-auto w-8">
              <svg
                aria-hidden="true"
                className="w-8 h-8 text-gray-200 animate-spin fill-blue-600"
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
          <button
            className={`mt-[6%] ml-[40%] lg:ml-[45%] me-2 mb-2 p-1.5 md:p-2.5 w-[25%] md:w-[20%] lg:w-[15%] text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-full font-medium text-[0.5em] text-center ${
              isLoginButtonDisabled
                ? "!bg-[#c8c8c8] !text-[#dcdcdc] !border-[none]"
                : ""
            }`}
            lang="en"
            name="login"
            type="submit"
            disabled={isLoginButtonDisabled ? true : false}
          >
            <i></i>LOG IN
          </button>
        </form>
        <div className="flex flex-row mt-[2%] ml-[0] mr-[0] mb-[14%] w-full h-[9%]">
          <h4 className="flex-[1_1_auto] flex items-center justify-end m-0 p-[0] w-[60%] h-full text-right text-[#646464] font-medium text-[0.7em]">
            Don't have an account yet?
          </h4>
          <Link
            className="overflow-hidden flex-[1_1_auto] flex items-center justify-start relative pl-3 w-[40%] h-full text-[#2d9ef6] no-underline font-medium text-[0.7em] leading-loose rounded [transition:letter-spacing_0.2s,_box-shadow_0.1s,_transform_0.1s,_background-color_0.2s_ease-out] hover:underline"
            to="/signup"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
