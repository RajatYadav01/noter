import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import React, { useEffect, useReducer, useRef, useState } from "react";
import LeftSideBar from "../components/LeftSideBar";
import useAuthContext from "../hooks/useAuthContext";

interface ResetPasswordFormType {
  emailAddress: string;
  password: string;
  confirmPassword: string;
}

interface ResetPasswordFormErrorsType {
  emailAddressError: string;
  passwordError: string;
  confirmPasswordError: string;
  resetPasswordError: string;
}

interface ResetPasswordFormErrorsActionType {
  type: string;
  payload: string;
}

interface ResetPasswordFormInputStatusType {
  valid: boolean;
  focused: boolean;
}

interface ResetPasswordFormInputActionType {
  type: string;
  payload: boolean;
}

const resetPasswordFormInputStatusInitialState = {
  valid: true,
  focused: false,
};

const inputStatusReducer = (
  state: ResetPasswordFormInputStatusType,
  action: ResetPasswordFormInputActionType
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

const resetPasswordFormErrorsInitialState = {
  emailAddressError: "",
  passwordError: "",
  confirmPasswordError: "",
  resetPasswordError: "",
};

const errorReducer = (
  state: ResetPasswordFormErrorsType,
  action: ResetPasswordFormErrorsActionType
) => {
  switch (action.type) {
    case "emailAddress":
      return { ...state, emailAddressError: action.payload };
    case "password":
      return { ...state, passwordError: action.payload };
    case "confirmPassword":
      return { ...state, confirmPasswordError: action.payload };
    case "resetPassword":
      return { ...state, resetPasswordError: action.payload };
    default:
      throw new Error();
  }
};

interface ResetPasswordFormPasswordVisibilityStatusType {
  passwordVisibilityType: string;
  passwordVisibilityIcon: string;
  confirmPasswordVisibilityType: string;
  confirmPasswordVisibilityIcon: string;
}

interface ResetPasswordFormPasswordVisibilityActionType {
  name: string;
  type: string;
  icon: string;
}

const resetPasswordFormPasswordVisibilityStatusInitialState = {
  passwordVisibilityType: "password",
  passwordVisibilityIcon: "bi-eye-slash-fill",
  confirmPasswordVisibilityType: "password",
  confirmPasswordVisibilityIcon: "bi-eye-slash-fill",
};

const passwordVisibilityStatusReducer = (
  state: ResetPasswordFormPasswordVisibilityStatusType,
  action: ResetPasswordFormPasswordVisibilityActionType
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

const ResetPassword = () => {
  const { resetPassword } = useAuthContext();

  const [resetPasswordFormState, setResetPasswordFormState] =
    useState<ResetPasswordFormType>({
      emailAddress: "",
      password: "",
      confirmPassword: "",
    });

  const [loadingIconState, setLoadingIconState] = useState(false);

  const emailAddressInputRef = useRef<HTMLInputElement | null>(null);

  const resetPasswordErrorRef = useRef<HTMLParagraphElement | null>(null);
  const emailAddressErrorRef = useRef<HTMLParagraphElement | null>(null);
  const passwordErrorRef = useRef<HTMLParagraphElement | null>(null);
  const confirmPasswordErrorRef = useRef<HTMLParagraphElement | null>(null);

  const [emailAddressInputStatus, dispatchEmailAddressInputStatus] = useReducer(
    inputStatusReducer,
    resetPasswordFormInputStatusInitialState
  );
  const [passwordInputStatus, dispatchPasswordInputStatus] = useReducer(
    inputStatusReducer,
    resetPasswordFormInputStatusInitialState
  );
  const [confirmPasswordInputStatus, dispatchConfirmPasswordInputStatus] =
    useReducer(inputStatusReducer, resetPasswordFormInputStatusInitialState);

  const [passwordVisibilityStatus, dispatchPasswordVisibilityStatus] =
    useReducer(
      passwordVisibilityStatusReducer,
      resetPasswordFormPasswordVisibilityStatusInitialState
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
    resetPasswordFormErrorsInitialState
  );

  useEffect(() => {
    emailAddressInputRef.current?.focus();
  }, []);

  const emailAddressRegEx =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const passwordRegEx =
    /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*\-_.?]).{8,50}$/;

  const isResetPasswordButtonDisabled =
    !emailAddressInputStatus.valid ||
    !passwordInputStatus.valid ||
    !confirmPasswordInputStatus.valid;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResetPasswordFormState((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  };

  useEffect(() => {
    const emailAddressValidationResult = emailAddressRegEx.test(
      resetPasswordFormState.emailAddress
    );
    dispatchEmailAddressInputStatus({
      type: "valid",
      payload: emailAddressValidationResult,
    });
  }, [resetPasswordFormState.emailAddress]);

  useEffect(() => {
    const passwordValidationResult = passwordRegEx.test(
      resetPasswordFormState.password
    );
    dispatchPasswordInputStatus({
      type: "valid",
      payload: passwordValidationResult,
    });
  }, [resetPasswordFormState.password]);

  useEffect(() => {
    const confirmPasswordValidationResult =
      passwordRegEx.test(resetPasswordFormState.confirmPassword) &&
      resetPasswordFormState.confirmPassword === resetPasswordFormState.password
        ? true
        : false;
    dispatchConfirmPasswordInputStatus({
      type: "valid",
      payload: confirmPasswordValidationResult,
    });
  }, [resetPasswordFormState.password, resetPasswordFormState.confirmPassword]);

  useEffect(() => {
    dispatchErrorMessage({ type: "emailAddress", payload: "" });
    dispatchErrorMessage({ type: "resetPassword", payload: "" });
  }, [resetPasswordFormState.emailAddress]);

  useEffect(() => {
    dispatchErrorMessage({ type: "password", payload: "" });
    dispatchErrorMessage({ type: "resetPassword", payload: "" });
  }, [resetPasswordFormState.password]);

  useEffect(() => {
    dispatchErrorMessage({ type: "confirmPassword", payload: "" });
    dispatchErrorMessage({ type: "resetPassword", payload: "" });
  }, [resetPasswordFormState.confirmPassword]);

  const handleResetPassword = async (
    event: React.ChangeEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const emailAddressValidation = () => {
      if (resetPasswordFormState.emailAddress === "") {
        dispatchErrorMessage({
          type: "emailAddress",
          payload: "Email address cannot be empty.",
        });
        dispatchEmailAddressInputStatus({ type: "valid", payload: false });
      } else if (!emailAddressRegEx.test(resetPasswordFormState.emailAddress)) {
        dispatchErrorMessage({
          type: "emailAddress",
          payload: "Invalid email address.",
        });
        dispatchEmailAddressInputStatus({ type: "valid", payload: false });
      }
    };
    const passwordValidation = () => {
      if (resetPasswordFormState.password === "") {
        dispatchErrorMessage({
          type: "password",
          payload: "Password cannot be empty.",
        });
        dispatchPasswordInputStatus({ type: "valid", payload: false });
      } else if (!passwordRegEx.test(resetPasswordFormState.password)) {
        dispatchErrorMessage({
          type: "password",
          payload: "Invalid password.",
        });
        dispatchPasswordInputStatus({ type: "valid", payload: false });
      }
    };
    const confirmPasswordValidation = () => {
      if (resetPasswordFormState.confirmPassword === "") {
        dispatchErrorMessage({
          type: "confirmPassword",
          payload: "Confirm password cannot be empty.",
        });
        dispatchConfirmPasswordInputStatus({ type: "valid", payload: false });
      } else if (
        !(
          passwordRegEx.test(resetPasswordFormState.confirmPassword) &&
          resetPasswordFormState.confirmPassword ===
            resetPasswordFormState.password
        )
      ) {
        dispatchErrorMessage({
          type: "confirmPassword",
          payload: "Confirm password not matching with password.",
        });
        dispatchConfirmPasswordInputStatus({ type: "valid", payload: false });
      }
    };
    emailAddressValidation();
    passwordValidation();
    confirmPasswordValidation();
    if (
      !emailAddressInputStatus.valid ||
      !passwordInputStatus.valid ||
      !confirmPasswordInputStatus.valid
    ) {
      dispatchErrorMessage({ type: "resetPassword", payload: "Invalid data" });
      return;
    }
    if (
      emailAddressInputStatus.valid &&
      passwordInputStatus.valid &&
      confirmPasswordInputStatus.valid
    ) {
      try {
        setLoadingIconState(true);
        const resetPasswordFormData = JSON.stringify(resetPasswordFormState);
        const userResetPassword = await resetPassword(resetPasswordFormData);
        if (userResetPassword === "Password reset successful") {
          dispatchErrorMessage({
            type: "resetPassword",
            payload: "",
          });
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error) {
            console.error(error);
            const errorMessage = error.response?.data.message
              ? error.response?.data.message
              : error.message;
            dispatchErrorMessage({
              type: "resetPassword",
              payload: errorMessage,
            });
          }
        }
        resetPasswordErrorRef.current?.focus();
      } finally {
        setLoadingIconState(false);
      }
    }
  };

  return (
    <div className="p-4 w-full h-full flex flex-row font-lato">
      <LeftSideBar pageType="Reset Password" />
      <div className="w-full h-full md:ml-[30%] lg:ml-[18%] flex flex-col text-[1.25rem] md:text-[2rem] lg:text-[2.75rem]">
        <h3 className="mx-auto mt-[20%] md:mt-[10%] mb-[1%] w-full h-[9%] text-[#646464] text-center text-[1em] font-lato font-[500]">
          Reset password
        </h3>
        {errorMessage.resetPasswordError && (
          <p
            ref={resetPasswordErrorRef}
            className="mx-auto my-[2%] pl-[0.25%] pr-[0.15%] py-[0.15%] w-full lg:w-[80%] rounded-[0.35em] bg-[#fcb2a2] border-[2px] border-[#ff0000] text-[#000000] leading-[1.2] text-[0.55em]"
            aria-live="assertive"
          >
            {errorMessage.resetPasswordError}
          </p>
        )}
        <form
          className="mt-[1%] mb-[1%] mx-0 md:mx-auto p-5 w-full lg:w-[80%] h-[40%] rounded-3xl bg-gray-100 text-[1.75rem] font-inter"
          onSubmit={handleResetPassword}
          method="POST"
        >
          <div className="relative">
            <input
              id="reset-password-form__email-address"
              className={`mt-[2%] mb-[1%] focus:outline-[none] focus:active:opacity-100 block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer ${
                resetPasswordFormState.emailAddress !== ""
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
              value={resetPasswordFormState.emailAddress}
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
              aria-describedby="reset-password-form__emailAddressRequirements"
            />
            <label
              lang="en"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-1 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              htmlFor="reset-password-form__email-address"
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
              id="reset-password-form__password"
              className={`mt-[2%] mb-[1%] focus:outline-[none] focus:active:opacity-100 block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer ${
                resetPasswordFormState.password !== ""
                  ? passwordInputStatus.valid
                    ? "valid-input"
                    : "invalid-input"
                  : ""
              }`}
              lang="en"
              name="password"
              type={passwordVisibilityStatus.passwordVisibilityType}
              maxLength={14}
              value={resetPasswordFormState.password}
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
              htmlFor="reset-password-form__password"
            >
              Enter new password
            </label>
            <span className="absolute inset-y-0 end-0 flex items-center z-1 px-3 cursor-pointer text-[0.6em]">
              <i
                className={`bi ${passwordVisibilityStatus.passwordVisibilityIcon}`}
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
          <div className="relative">
            <input
              id="reset-password-form__confirm-password"
              className={`mt-[2%] mb-[1%] focus:outline-[none] focus:active:opacity-100 block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer ${
                resetPasswordFormState.confirmPassword !== ""
                  ? confirmPasswordInputStatus.valid
                    ? "valid-input"
                    : "invalid-input"
                  : ""
              }`}
              lang="en"
              name="confirmPassword"
              type={passwordVisibilityStatus.confirmPasswordVisibilityType}
              maxLength={14}
              value={resetPasswordFormState.confirmPassword}
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
            />
            <label
              lang="en"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-1 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              htmlFor="reset-password-form__confirm-Password"
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
              isResetPasswordButtonDisabled
                ? "!bg-[#c8c8c8] !text-[#dcdcdc] !border-[none]"
                : ""
            }`}
            lang="en"
            name="resetPassword"
            type="submit"
            disabled={isResetPasswordButtonDisabled ? true : false}
          >
            <i></i>RESET
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
