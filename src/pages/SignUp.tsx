import axios from "axios";
import parse from "html-react-parser";
import { Link } from "react-router-dom";
import { useState, useEffect, useReducer, useRef } from "react";
import LeftSideBar from "../components/LeftSideBar";
import useAuthContext from "../hooks/useAuthContext";

interface SignUpFormType {
  name: string;
  emailAddress: string;
  password: string;
  confirmPassword: string;
}

interface SignUpFormInputStatusType {
  valid: boolean;
  focused: boolean;
}

interface SignUpFormInputActionType {
  type: string;
  payload: boolean;
}

const signUpFormInputStatusInitialState = {
  valid: true,
  focused: false,
};

const inputStatusReducer = (
  state: SignUpFormInputStatusType,
  action: SignUpFormInputActionType
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

interface SignUpFormErrorsType {
  nameError: string;
  emailAddressError: string;
  passwordError: string;
  confirmPasswordError: string;
  signUpError: string;
}

interface SignUpFormErrorsActionType {
  type: string;
  payload: string;
}

const signUpFormErrorsInitialState = {
  nameError: "",
  emailAddressError: "",
  passwordError: "",
  confirmPasswordError: "",
  signUpError: "",
};

function errorReducer(
  state: SignUpFormErrorsType,
  action: SignUpFormErrorsActionType
) {
  switch (action.type) {
    case "name":
      return { ...state, nameError: action.payload };
    case "emailAddress":
      return { ...state, emailAddressError: action.payload };
    case "password":
      return { ...state, passwordError: action.payload };
    case "confirmPassword":
      return { ...state, confirmPasswordError: action.payload };
    case "signUp":
      return { ...state, signUpError: action.payload };
    default:
      throw new Error();
  }
}

type SignUpFormPasswordVisibilityStatusType = {
  passwordVisibilityType: string;
  passwordVisibilityIcon: string;
  confirmPasswordVisibilityType: string;
  confirmPasswordVisibilityIcon: string;
};

type SignUpFormPasswordVisibilityActionType = {
  name: string;
  type: string;
  icon: string;
};

const signUpFormPasswordVisibilityStatusInitialState = {
  passwordVisibilityType: "password",
  passwordVisibilityIcon: "bi-eye-slash-fill",
  confirmPasswordVisibilityType: "password",
  confirmPasswordVisibilityIcon: "bi-eye-slash-fill",
};

const passwordVisibilityStatusReducer = (
  state: SignUpFormPasswordVisibilityStatusType,
  action: SignUpFormPasswordVisibilityActionType
) => {
  switch (action.name) {
    case "password":
      return {
        ...state,
        passwordVisibilityType: action.type,
        passwordVisibilityIcon: action.icon,
      };
    case "confirmPassword":
      return {
        ...state,
        confirmPasswordVisibilityType: action.type,
        confirmPasswordVisibilityIcon: action.icon,
      };
    default:
      throw new Error();
  }
};

const inputInstructions = {
  nameInstructions:
    '<i className="bi bi-info-circle-fill"></i> Must be between 2 to 75 characters<br />Only letters allowed',
  emailAddressInstructions:
    '<i className="bi bi-info-circle-fill"></i> Must be between 3 to 150 characters<br />Letters, numbers and some special characters allowed<br />Allowed special characters: <span aria-label="at symbol">@</span> <span aria-label="dot symbol">.</span> <span aria-label="hyphen">-</span> <span aria-label="underscore symbol">_</span>',
  passwordInstructions:
    '<i className="bi bi-info-circle-fill"></i> Must contain at least 8 characters<br />Must contain at least 1 upper case letter<br />Must contain at least 1 lower case letter<br />Must contain at least 1 digit<br />Must contain at least 1 of the special characters: <span aria-label="exclamation symbol">!</span> <span aria-label="at symbol">@</span> <span aria-label="hash symbol">#</span> <span aria-label="dollar symbol">$</span> <span aria-label="percent symbol">%</span> <span aria-label="caret symbol">^</span> <span aria-label="ampersand symbol">&</span> <span aria-label="asterisk symbol">*</span> <span aria-label="hyphen symbol">-</span> <span aria-label="underscore symbol">_</span> <span aria-label="dot symbol">.</span> <span aria-label="question mark symbol">?</span>',
  confirmPasswordInstructions:
    '<i className="bi bi-info-circle-fill"></i> Must match with the password',
};

const SignUp = () => {
  const { signUp } = useAuthContext();

  const [signUpFormState, setSignUpFormState] = useState<SignUpFormType>({
    name: "",
    emailAddress: "",
    password: "",
    confirmPassword: "",
  });

  const [loadingIconState, setLoadingIconState] = useState(false);

  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const signUpErrorRef = useRef<HTMLParagraphElement | null>(null);
  const nameErrorRef = useRef<HTMLParagraphElement | null>(null);
  const emailAddressErrorRef = useRef<HTMLParagraphElement | null>(null);
  const passwordErrorRef = useRef<HTMLParagraphElement | null>(null);
  const confirmPasswordErrorRef = useRef<HTMLParagraphElement | null>(null);

  const [nameInputStatus, dispatchNameInputStatus] = useReducer(
    inputStatusReducer,
    signUpFormInputStatusInitialState
  );
  const [emailAddressInputStatus, dispatchEmailAddressInputStatus] = useReducer(
    inputStatusReducer,
    signUpFormInputStatusInitialState
  );
  const [passwordInputStatus, dispatchPasswordInputStatus] = useReducer(
    inputStatusReducer,
    signUpFormInputStatusInitialState
  );
  const [confirmPasswordInputStatus, dispatchConfirmPasswordInputStatus] =
    useReducer(inputStatusReducer, signUpFormInputStatusInitialState);

  const [passwordVisibilityStatus, dispatchPasswordVisibilityStatus] =
    useReducer(
      passwordVisibilityStatusReducer,
      signUpFormPasswordVisibilityStatusInitialState
    );

  const togglePasswordVisibilityStatus = (fieldName: string) => {
    if (
      (fieldName === "password" &&
        passwordVisibilityStatus.passwordVisibilityType === "password") ||
      (fieldName === "confirmPassword" &&
        passwordVisibilityStatus.confirmPasswordVisibilityType === "password")
    )
      dispatchPasswordVisibilityStatus({
        name: fieldName,
        type: "text",
        icon: "bi-eye-fill",
      });
    else if (
      (fieldName === "password" &&
        passwordVisibilityStatus.passwordVisibilityType === "text") ||
      (fieldName === "confirmPassword" &&
        passwordVisibilityStatus.confirmPasswordVisibilityType === "text")
    )
      dispatchPasswordVisibilityStatus({
        name: fieldName,
        type: "password",
        icon: "bi-eye-slash-fill",
      });
  };

  const [errorMessage, dispatchErrorMessage] = useReducer(
    errorReducer,
    signUpFormErrorsInitialState
  );

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const nameRegEx = /^\s*([A-Za-z]{1,}([\.,] |[-']| )?)+[A-Za-z]+\.?\s*$/;
  const emailAddressRegEx =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const passwordRegEx =
    /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*\-_.?]).{8,50}$/;

  const isSignUpButtonDisabled =
    !nameInputStatus.valid ||
    !emailAddressInputStatus.valid ||
    !passwordInputStatus.valid ||
    !confirmPasswordInputStatus.valid;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpFormState((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  };

  useEffect(() => {
    const nameValidationResult = nameRegEx.test(signUpFormState.name);
    dispatchNameInputStatus({ type: "valid", payload: nameValidationResult });
  }, [signUpFormState.name]);

  useEffect(() => {
    const emailAddressValidationResult = emailAddressRegEx.test(
      signUpFormState.emailAddress
    );
    dispatchEmailAddressInputStatus({
      type: "valid",
      payload: emailAddressValidationResult,
    });
  }, [signUpFormState.emailAddress]);

  useEffect(() => {
    const passwordValidationResult = passwordRegEx.test(
      signUpFormState.password
    );
    dispatchPasswordInputStatus({
      type: "valid",
      payload: passwordValidationResult,
    });
  }, [signUpFormState.password]);

  useEffect(() => {
    const confirmPasswordValidationResult =
      passwordRegEx.test(signUpFormState.confirmPassword) &&
      signUpFormState.confirmPassword === signUpFormState.password
        ? true
        : false;
    dispatchConfirmPasswordInputStatus({
      type: "valid",
      payload: confirmPasswordValidationResult,
    });
  }, [signUpFormState.password, signUpFormState.confirmPassword]);

  useEffect(() => {
    dispatchErrorMessage({ type: "name", payload: "" });
    dispatchErrorMessage({ type: "signUp", payload: "" });
  }, [signUpFormState.name]);

  useEffect(() => {
    dispatchErrorMessage({ type: "emailAddress", payload: "" });
    dispatchErrorMessage({ type: "signUp", payload: "" });
  }, [signUpFormState.emailAddress]);

  useEffect(() => {
    dispatchErrorMessage({ type: "password", payload: "" });
    dispatchErrorMessage({ type: "signUp", payload: "" });
  }, [signUpFormState.password]);

  useEffect(() => {
    dispatchErrorMessage({ type: "confirmPassword", payload: "" });
    dispatchErrorMessage({ type: "signUp", payload: "" });
  }, [signUpFormState.confirmPassword]);

  const handleSignUp = async (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nameValidation = () => {
      if (signUpFormState.name === "") {
        dispatchErrorMessage({
          type: "name",
          payload: "Name cannot be empty.",
        });
        dispatchNameInputStatus({ type: "valid", payload: false });
      } else if (!nameRegEx.test(signUpFormState.name)) {
        dispatchErrorMessage({ type: "name", payload: "Invalid first name." });
        dispatchNameInputStatus({ type: "valid", payload: false });
      }
    };
    const emailAddressValidation = () => {
      if (signUpFormState.emailAddress === "") {
        dispatchErrorMessage({
          type: "emailAddress",
          payload: "Email address cannot be empty.",
        });
        dispatchEmailAddressInputStatus({ type: "valid", payload: false });
      } else if (!emailAddressRegEx.test(signUpFormState.emailAddress)) {
        dispatchErrorMessage({
          type: "emailAddress",
          payload: "Invalid email address.",
        });
        dispatchEmailAddressInputStatus({ type: "valid", payload: false });
      }
    };
    const passwordValidation = () => {
      if (signUpFormState.password === "") {
        dispatchErrorMessage({
          type: "password",
          payload: "Password cannot be empty.",
        });
        dispatchPasswordInputStatus({ type: "valid", payload: false });
      } else if (!passwordRegEx.test(signUpFormState.password)) {
        dispatchErrorMessage({
          type: "password",
          payload: "Invalid password.",
        });
        dispatchPasswordInputStatus({ type: "valid", payload: false });
      }
    };
    const confirmPasswordValidation = () => {
      if (signUpFormState.confirmPassword === "") {
        dispatchErrorMessage({
          type: "confirmPassword",
          payload: "Confirm password cannot be empty.",
        });
        dispatchConfirmPasswordInputStatus({ type: "valid", payload: false });
      } else if (
        !(
          passwordRegEx.test(signUpFormState.confirmPassword) &&
          signUpFormState.confirmPassword === signUpFormState.password
        )
      ) {
        dispatchErrorMessage({
          type: "confirmPassword",
          payload: "Confirm password not matching with password.",
        });
        dispatchConfirmPasswordInputStatus({ type: "valid", payload: false });
      }
    };
    nameValidation();
    emailAddressValidation();
    passwordValidation();
    confirmPasswordValidation();
    if (
      !nameInputStatus.valid ||
      !emailAddressInputStatus.valid ||
      !passwordInputStatus.valid ||
      !confirmPasswordInputStatus.valid
    ) {
      dispatchErrorMessage({ type: "signUp", payload: "Invalid data" });
      return;
    }
    if (
      nameInputStatus.valid &&
      emailAddressInputStatus.valid &&
      passwordInputStatus.valid &&
      confirmPasswordInputStatus.valid
    ) {
      try {
        setLoadingIconState(true);
        const signUpFormData = JSON.stringify(signUpFormState);
        const userSignUp = await signUp(signUpFormData);
        if (userSignUp === "SignUp successful") {
          setSignUpFormState({
            name: "",
            emailAddress: "",
            password: "",
            confirmPassword: "",
          });
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error) {
            console.error(error);
            const errorMessage = error.response?.data.message
              ? error.response?.data.message
              : error.message;
            dispatchErrorMessage({ type: "signUp", payload: errorMessage });
          }
        }
        signUpErrorRef.current?.focus();
      } finally {
        setLoadingIconState(false);
      }
    }
  };

  return (
    <div className="p-4 w-full h-full flex flex-row font-lato">
      <LeftSideBar pageType="SignUp" />
      <div className="w-full h-full md:ml-[30%] lg:ml-[18%] flex flex-col text-[1.25rem] md:text-[2rem] lg:text-[2.75rem]">
        <h3 className="mx-auto mt-[20%] md:mt-[10%] mb-[1%] w-full h-[9%] text-[#646464] text-center text-[1em] font-lato font-[500]">
          Sign up
        </h3>
        {errorMessage.signUpError && (
          <p
            ref={signUpErrorRef}
            className="mx-auto my-[2%] pl-[0.25%] pr-[0.15%] py-[0.15%] w-full lg:w-[80%] rounded-[0.35em] bg-[#fcb2a2] border-[2px] border-[#ff0000] text-[#000000] leading-[1.2] text-[0.55em]"
            aria-live="assertive"
          >
            {errorMessage.signUpError}
          </p>
        )}
        <form
          className="mt-[1%] mb-[1%] mx-0 md:mx-auto p-5 w-full lg:w-[80%] h-[50%] lg:h-[60%] rounded-3xl bg-gray-100 text-[1.75rem] font-inter"
          onSubmit={handleSignUp}
          method="POST"
        >
          <div className="relative">
            <input
              id="signUp-form__name"
              className={`mt-[2%] mb-[1%] focus:outline-[none] focus:active:opacity-100 block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer ${
                signUpFormState.name !== ""
                  ? nameInputStatus.valid
                    ? "!border-[2px] !border-[#0bd40b]"
                    : "!border-[2px] !border-[#ff0000]"
                  : ""
              }`}
              lang="en"
              name="name"
              ref={nameInputRef}
              type="text"
              maxLength={75}
              value={signUpFormState.name}
              onChange={handleInputChange}
              onFocus={() =>
                dispatchNameInputStatus({ type: "focus", payload: true })
              }
              onBlur={() =>
                dispatchNameInputStatus({ type: "focus", payload: false })
              }
              required={true}
              autoComplete="off"
              aria-invalid={nameInputStatus.valid ? "false" : "true"}
              aria-describedby="signUp-form__name-requirements"
            />
            <label
              lang="en"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-1 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              htmlFor="signUp-form__name"
            >
              Enter your name
            </label>
          </div>
          {signUpFormState.name &&
            nameInputStatus.focused &&
            !nameInputStatus.valid && (
              <p
                id="signUp-form__name-requirements"
                className="m-0 pl-[0.25%] pr-[0.15%] py-[0.15%] w-full rounded-[0.35em] bg-[#748696] text-[#ffffff] leading-[1.2] text-[0.55em]"
              >
                {parse(inputInstructions.nameInstructions)}
              </p>
            )}
          {errorMessage.nameError && (
            <p
              ref={nameErrorRef}
              className="ml-[0] mr-[0] my-[2%] pl-[0.25%] pr-[0.0.555%] py-[0.15%] w-full rounded-[0.35em] bg-[#fcb2a2] border-[2px] border-[#ff0000] text-[#000000] leading-[1.2] text-[0.55em]"
              aria-live="assertive"
            >
              {errorMessage.nameError}
            </p>
          )}
          <div className="relative">
            <input
              id="signUp-form__email-address"
              className={`mt-[2%] mb-[1%] focus:outline-[none] focus:active:opacity-100 block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer ${
                signUpFormState.emailAddress !== ""
                  ? emailAddressInputStatus.valid
                    ? "!border-[2px] !border-[#0bd40b]"
                    : "!border-[2px] !border-[#ff0000]"
                  : ""
              }`}
              lang="en"
              name="emailAddress"
              type="email"
              maxLength={150}
              value={signUpFormState.emailAddress}
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
              aria-describedby="signUp-form__email-address-requirements"
            />
            <label
              lang="en"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-1 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              htmlFor="signUp-form__email-address"
            >
              Enter your email address
            </label>
          </div>
          {signUpFormState.emailAddress &&
            emailAddressInputStatus.focused &&
            !emailAddressInputStatus.valid && (
              <p
                id="signUp-form__email-address-requirements"
                className="m-0 pl-[0.25%] pr-[0.15%] py-[0.15%] w-full rounded-[0.35em] bg-[#748696] text-[#ffffff] leading-[1.2] text-[0.55em]"
              >
                {parse(inputInstructions.emailAddressInstructions)}
              </p>
            )}
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
              id="signUp-form__password"
              className={`mt-[2%] mb-[1%] focus:outline-[none] focus:active:opacity-100 block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer ${
                signUpFormState.password !== ""
                  ? passwordInputStatus.valid
                    ? "!border-[2px] !border-[#0bd40b]"
                    : "!border-[2px] !border-[#ff0000]"
                  : ""
              }`}
              lang="en"
              name="password"
              type={passwordVisibilityStatus.passwordVisibilityType}
              maxLength={50}
              value={signUpFormState.password}
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
              aria-describedby="signUp-form__password-requirements"
            />
            <label
              lang="en"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-1 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              htmlFor="signUp-form__password"
            >
              Create new password
            </label>
            <span className="absolute inset-y-0 end-0 flex items-center z-1 px-3 cursor-pointer text-[0.6em]">
              <i
                className={`bi ${passwordVisibilityStatus.passwordVisibilityIcon}`}
                onClick={() => togglePasswordVisibilityStatus("password")}
              ></i>
            </span>
          </div>
          {signUpFormState.password &&
            passwordInputStatus.focused &&
            !passwordInputStatus.valid && (
              <p
                id="signUp-form__password-requirements"
                className="m-0 pl-[0.25%] pr-[0.15%] py-[0.15%] w-full rounded-[0.35em] bg-[#748696] text-[#ffffff] leading-[1.2] text-[0.55em]"
              >
                {parse(inputInstructions.passwordInstructions)}
              </p>
            )}
          {errorMessage.passwordError && (
            <p
              ref={passwordErrorRef}
              className="ml-[0] mr-[0] my-[2%] pl-[0.25%] pr-[0.15%] py-[0.15%] w-full rounded-[0.35em] bg-[#fcb2a2] border-[2px] border-[#ff0000] text-[#000000] leading-[1.2] text-[0.55em]"
              aria-live="assertive"
            >
              {errorMessage.passwordError}
            </p>
          )}
          <div className="relative">
            <input
              id="signUp-form__confirm-password"
              className={`mt-[2%] mb-[1%] focus:outline-[none] focus:active:opacity-100 block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer ${
                signUpFormState.confirmPassword !== ""
                  ? confirmPasswordInputStatus.valid
                    ? "!border-[2px] !border-[#0bd40b]"
                    : "!border-[2px] !border-[#ff0000]"
                  : ""
              }`}
              lang="en"
              name="confirmPassword"
              type={passwordVisibilityStatus.confirmPasswordVisibilityType}
              maxLength={50}
              value={signUpFormState.confirmPassword}
              onChange={handleInputChange}
              onFocus={() =>
                dispatchConfirmPasswordInputStatus({
                  type: "focus",
                  payload: true,
                })
              }
              onBlur={() =>
                dispatchConfirmPasswordInputStatus({
                  type: "focus",
                  payload: false,
                })
              }
              required={true}
              autoComplete="off"
              aria-invalid={confirmPasswordInputStatus.valid ? "false" : "true"}
              aria-describedby="signUp-form__confirm-password-requirements"
            />
            <label
              lang="en"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-1 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              htmlFor="signUp-form__confirm-password"
            >
              Confirm password
            </label>
            <span className="absolute inset-y-0 end-0 flex items-center z-1 px-3 cursor-pointer text-[0.6em]">
              <i
                className={`bi ${passwordVisibilityStatus.confirmPasswordVisibilityIcon}`}
                onClick={() =>
                  togglePasswordVisibilityStatus("confirmPassword")
                }
              ></i>
            </span>
          </div>
          {signUpFormState.confirmPassword &&
            confirmPasswordInputStatus.focused &&
            !confirmPasswordInputStatus.valid && (
              <p
                id="signUp-form__confirm-password-requirements"
                className="m-0 pl-[0.25%] pr-[0.15%] py-[0.15%] w-full rounded-[0.35em] bg-[#748696] text-[#ffffff] leading-[1.2] text-[0.55em]"
              >
                {parse(inputInstructions.confirmPasswordInstructions)}
              </p>
            )}
          {errorMessage.confirmPasswordError && (
            <p
              ref={confirmPasswordErrorRef}
              className="ml-[0] mr-[0] my-[2%] pl-[0.25%] pr-[0.15%] py-[0.15%] w-full rounded-[0.35em] bg-[#fcb2a2] border-[2px] border-[#ff0000] text-[#000000] leading-[1.2] text-[0.55em]"
              aria-live="assertive"
            >
              {errorMessage.confirmPasswordError}
            </p>
          )}
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
              isSignUpButtonDisabled
                ? "!bg-[#c8c8c8] !text-[#dcdcdc] !border-[none]"
                : ""
            }`}
            lang="en"
            name="signup"
            type="submit"
            disabled={isSignUpButtonDisabled ? true : false}
          >
            <i></i>SIGN UP
          </button>
        </form>
        <div className="flex flex-row mt-[2%] ml-[0] mr-[0] mb-[14%] w-full h-[9%]">
          <h4 className="flex-[1_1_auto] flex items-center justify-end m-0 p-[0] w-[60%] h-full text-right text-[#646464] font-medium text-[0.7em]">
            Already have an account?
          </h4>
          <Link
            className="overflow-hidden flex-[1_1_auto] flex items-center justify-start relative pl-3 w-[40%] h-full text-[#2d9ef6] no-underline font-medium text-[0.7em] leading-loose rounded [transition:letter-spacing_0.2s,_box-shadow_0.1s,_transform_0.1s,_background-color_0.2s_ease-out] hover:underline"
            to="/login"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
    // </Fragment>
  );
};

export default SignUp;
