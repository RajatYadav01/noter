import axios from "axios";
import parse from "html-react-parser";
import { toast } from "react-toastify";
import React, { useRef, useState, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, updateUser, deleteUser } from "../services/User";
import { deleteAllNotes } from "../services/Note";
import useAuthContext from "../hooks/useAuthContext";
import LeftSideBar from "./LeftSideBar";

interface UserProfileEditForm {
  id: string;
  name: string;
  emailAddress: string;
  password: string;
  confirmPassword: string;
}

interface UserProfileEditFormInputStatusType {
  valid: boolean;
  focused: boolean;
}

interface UserProfileEditFormInputActionType {
  type: string;
  payload: boolean;
}

const userProfileEditFormInputStatusInitialState = {
  valid: true,
  focused: false,
};

const inputStatusReducer = (
  state: UserProfileEditFormInputStatusType,
  action: UserProfileEditFormInputActionType
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

interface UserProfileEditFormErrorsType {
  nameError: string;
  emailAddressError: string;
  passwordError: string;
  confirmPasswordError: string;
  userProfileEditError: string;
}

interface UserProfileEditFormErrorsActionType {
  type: string;
  payload: string;
}

const userProfileEditFormErrorsInitialState = {
  nameError: "",
  emailAddressError: "",
  passwordError: "",
  confirmPasswordError: "",
  userProfileEditError: "",
};

function errorReducer(
  state: UserProfileEditFormErrorsType,
  action: UserProfileEditFormErrorsActionType
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
    case "updateProfile":
      return { ...state, userProfileEditError: action.payload };
    default:
      throw new Error();
  }
}

type UserProfileEditFormPasswordVisibilityStatusType = {
  passwordVisibilityType: string;
  passwordVisibilityIcon: string;
  confirmPasswordVisibilityType: string;
  confirmPasswordVisibilityIcon: string;
};

type UserProfileEditFormPasswordVisibilityActionType = {
  name: string;
  type: string;
  icon: string;
};

const userProfileEditFormPasswordVisibilityStatusInitialState = {
  passwordVisibilityType: "password",
  passwordVisibilityIcon: "bi-eye-slash-fill",
  confirmPasswordVisibilityType: "password",
  confirmPasswordVisibilityIcon: "bi-eye-slash-fill",
};

const passwordVisibilityStatusReducer = (
  state: UserProfileEditFormPasswordVisibilityStatusType,
  action: UserProfileEditFormPasswordVisibilityActionType
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

const UserProfileEditModal = () => {
  const { loginStatusState, logOut } = useAuthContext();

  const [userProfileEditFormState, setUserProfileEditFormState] =
    useState<UserProfileEditForm>({
      id: "",
      name: "",
      emailAddress: "",
      password: "",
      confirmPassword: "",
    });

  const [loadingIconState, setLoadingIconState] = useState(false);

  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const userProfileEditErrorRef = useRef<HTMLParagraphElement | null>(null);
  const nameErrorRef = useRef<HTMLParagraphElement | null>(null);
  const emailAddressErrorRef = useRef<HTMLParagraphElement | null>(null);
  const passwordErrorRef = useRef<HTMLParagraphElement | null>(null);
  const confirmPasswordErrorRef = useRef<HTMLParagraphElement | null>(null);

  const [nameInputStatus, dispatchNameInputStatus] = useReducer(
    inputStatusReducer,
    userProfileEditFormInputStatusInitialState
  );
  const [emailAddressInputStatus, dispatchEmailAddressInputStatus] = useReducer(
    inputStatusReducer,
    userProfileEditFormInputStatusInitialState
  );
  const [passwordInputStatus, dispatchPasswordInputStatus] = useReducer(
    inputStatusReducer,
    userProfileEditFormInputStatusInitialState
  );
  const [confirmPasswordInputStatus, dispatchConfirmPasswordInputStatus] =
    useReducer(inputStatusReducer, userProfileEditFormInputStatusInitialState);

  const [passwordVisibilityStatus, dispatchPasswordVisibilityStatus] =
    useReducer(
      passwordVisibilityStatusReducer,
      userProfileEditFormPasswordVisibilityStatusInitialState
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
    userProfileEditFormErrorsInitialState
  );

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const nameRegEx = /^\s*([A-Za-z]{1,}([\.,] |[-']| )?)+[A-Za-z]+\.?\s*$/;
  const emailAddressRegEx =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const passwordRegEx =
    /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*\-_.?]).{8,50}$/;

  const isSaveButtonDisabled = useRef(true);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserProfileEditFormState((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  };

  useEffect(() => {
    const nameValidationResult = nameRegEx.test(userProfileEditFormState.name);
    dispatchNameInputStatus({ type: "valid", payload: nameValidationResult });
  }, [userProfileEditFormState.name]);

  useEffect(() => {
    const emailAddressValidationResult = emailAddressRegEx.test(
      userProfileEditFormState.emailAddress
    );
    dispatchEmailAddressInputStatus({
      type: "valid",
      payload: emailAddressValidationResult,
    });
  }, [userProfileEditFormState.emailAddress]);

  useEffect(() => {
    const passwordValidationResult = passwordRegEx.test(
      userProfileEditFormState.password
    );
    dispatchPasswordInputStatus({
      type: "valid",
      payload: passwordValidationResult,
    });
  }, [userProfileEditFormState.password]);

  useEffect(() => {
    const confirmPasswordValidationResult =
      passwordRegEx.test(userProfileEditFormState.confirmPassword) &&
      userProfileEditFormState.confirmPassword ===
        userProfileEditFormState.password
        ? true
        : false;
    dispatchConfirmPasswordInputStatus({
      type: "valid",
      payload: confirmPasswordValidationResult,
    });
  }, [
    userProfileEditFormState.password,
    userProfileEditFormState.confirmPassword,
  ]);

  useEffect(() => {
    dispatchErrorMessage({ type: "name", payload: "" });
    dispatchErrorMessage({ type: "updateProfile", payload: "" });
  }, [userProfileEditFormState.name]);

  useEffect(() => {
    dispatchErrorMessage({ type: "emailAddress", payload: "" });
    dispatchErrorMessage({ type: "updateProfile", payload: "" });
  }, [userProfileEditFormState.emailAddress]);

  useEffect(() => {
    dispatchErrorMessage({ type: "password", payload: "" });
    dispatchErrorMessage({ type: "updateProfile", payload: "" });
  }, [userProfileEditFormState.password]);

  useEffect(() => {
    dispatchErrorMessage({ type: "confirmPassword", payload: "" });
    dispatchErrorMessage({ type: "updateProfile", payload: "" });
  }, [userProfileEditFormState.confirmPassword]);

  const currentUserName = useRef("");
  const currentUserEmailAddress = useRef("");

  useEffect(() => {
    if (loginStatusState.userID) {
      const fetchUserDetails = async () => {
        try {
          const userDetails = await getUser(loginStatusState.userID);
          if (userDetails) {
            setUserProfileEditFormState((prevFormData) => ({
              ...prevFormData,
              id: userDetails.id,
              name: userDetails.name,
              emailAddress: userDetails.emailAddress,
            }));
            currentUserName.current = userDetails.name;
            currentUserEmailAddress.current = userDetails.emailAddress;
          }
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            console.error(error);
            const errorMessage = error.response?.data.message
              ? error.response?.data.message
              : error.message;
            dispatchErrorMessage({
              type: "updateProfile",
              payload: errorMessage,
            });
          }
          userProfileEditErrorRef.current?.focus();
        }
      };

      fetchUserDetails();
    }
  }, [loginStatusState.userID]);

  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("..");
  };

  const isAnyInputFieldEmpty =
    userProfileEditFormState.name === "" ||
    userProfileEditFormState.emailAddress === ""
      ? true
      : false;
  const isAnyInputFieldInvalid =
    !nameRegEx.test(userProfileEditFormState.name) ||
    !emailAddressRegEx.test(userProfileEditFormState.emailAddress);
  const isAnyInputFieldValueDifferent =
    userProfileEditFormState.name !== currentUserName.current ||
    userProfileEditFormState.emailAddress !== currentUserEmailAddress.current;

  useEffect(() => {
    isSaveButtonDisabled.current =
      !isAnyInputFieldValueDifferent ||
      isAnyInputFieldInvalid ||
      isAnyInputFieldEmpty;
  }, [userProfileEditFormState]);

  const handleSave = async () => {
    const nameValidation = () => {
      if (userProfileEditFormState.name === "") {
        dispatchErrorMessage({
          type: "name",
          payload: "Name cannot be empty.",
        });
        dispatchNameInputStatus({ type: "valid", payload: false });
      } else if (!nameRegEx.test(userProfileEditFormState.name)) {
        dispatchErrorMessage({ type: "name", payload: "Invalid first name." });
        dispatchNameInputStatus({ type: "valid", payload: false });
      }
    };
    const emailAddressValidation = () => {
      if (userProfileEditFormState.emailAddress === "") {
        dispatchErrorMessage({
          type: "emailAddress",
          payload: "Email address cannot be empty.",
        });
        dispatchEmailAddressInputStatus({ type: "valid", payload: false });
      } else if (
        !emailAddressRegEx.test(userProfileEditFormState.emailAddress)
      ) {
        dispatchErrorMessage({
          type: "emailAddress",
          payload: "Invalid email address.",
        });
        dispatchEmailAddressInputStatus({ type: "valid", payload: false });
      }
    };
    const passwordValidation = () => {
      if (!passwordRegEx.test(userProfileEditFormState.password)) {
        dispatchErrorMessage({ type: "password", payload: "Invalid password" });
        dispatchPasswordInputStatus({ type: "valid", payload: false });
      }
    };
    const confirmPasswordValidation = () => {
      if (
        !(
          passwordRegEx.test(userProfileEditFormState.confirmPassword) &&
          userProfileEditFormState.confirmPassword ===
            userProfileEditFormState.password
        )
      ) {
        dispatchErrorMessage({
          type: "confirmPassword",
          payload: "Confirm password not matching with password",
        });
        dispatchConfirmPasswordInputStatus({ type: "valid", payload: false });
      }
    };
    nameValidation();
    emailAddressValidation();
    const isPasswordInputValid = userProfileEditFormState.password
      ? passwordInputStatus.valid && passwordValidation()
      : true;
    const isConfirmPasswordInputValid = userProfileEditFormState.confirmPassword
      ? confirmPasswordInputStatus.valid && confirmPasswordValidation()
      : true;
    if (
      !nameInputStatus.valid ||
      !emailAddressInputStatus.valid ||
      !isPasswordInputValid ||
      !isConfirmPasswordInputValid
    ) {
      dispatchErrorMessage({ type: "updateProfile", payload: "Invalid data" });
      return;
    }
    if (
      nameInputStatus.valid &&
      emailAddressInputStatus.valid &&
      isPasswordInputValid &&
      isConfirmPasswordInputValid
    ) {
      try {
        setLoadingIconState(true);
        const userProfileEditFormData = JSON.stringify(
          userProfileEditFormState
        );
        const userProfileUpdate = await updateUser(userProfileEditFormData);
        if (userProfileUpdate) {
          if (
            userProfileUpdate.emailAddress !== currentUserEmailAddress.current
          ) {
            toast.success(
              "Your profile has been successfully updated. Please log in with the new email address."
            );
            logOut();
          }
          setUserProfileEditFormState({
            id: userProfileUpdate.id,
            name: userProfileUpdate.name,
            emailAddress: userProfileUpdate.emailAddress,
            password: "",
            confirmPassword: "",
          });
          currentUserName.current = userProfileUpdate.name;
          currentUserEmailAddress.current = userProfileUpdate.emailAddress;
          dispatchErrorMessage({
            type: "updateProfile",
            payload: "",
          });
          toast.success("Your profile has been successfully updated.");
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error) {
            console.error(error);
            const errorMessage = error.response?.data.message
              ? error.response?.data.message
              : error.message;
            dispatchErrorMessage({
              type: "updateProfile",
              payload: errorMessage,
            });
          }
        }
        userProfileEditErrorRef.current?.focus();
      } finally {
        setLoadingIconState(false);
      }
    }
  };

  const [displayDeleteDialogBox, setDisplayDeleteDialogBox] = useState(false);

  const handleDelete = () => {
    const deleteUserAccount = async () => {
      try {
        setLoadingIconState(true);
        const userNotesDelete = await deleteAllNotes(loginStatusState.userID);
        if (userNotesDelete === "All notes successfully deleted") {
          const userDelete = await deleteUser(loginStatusState.userID);
          if (userDelete === "User successfully deleted") {
            dispatchErrorMessage({
              type: "updateProfile",
              payload: "",
            });
            toast.success("Your account has been deleted successfully.");
            logOut();
          }
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error(error);
          const errorMessage = error.response?.data.message
            ? error.response?.data.message
            : error.message;
          dispatchErrorMessage({
            type: "updateProfile",
            payload: errorMessage,
          });
        }
        userProfileEditErrorRef.current?.focus();
      } finally {
        setLoadingIconState(false);
      }
    };

    deleteUserAccount();
  };

  return (
    <div className="p-4 w-full h-full flex flex-row font-lato">
      <LeftSideBar pageType="Reset Password" />
      <div className="w-full h-full md:ml-[30%] lg:ml-[18%] flex flex-col text-[1.25rem] md:text-[2rem] lg:text-[2.75rem]">
        <h3 className="mx-auto mt-[20%] md:mt-[10%] mb-[1%] w-full h-[9%] text-[#646464] text-center text-[1em] font-lato font-[500]">
          Update profile
        </h3>
        {errorMessage.userProfileEditError && (
          <p
            ref={userProfileEditErrorRef}
            className="mx-auto my-[2%] pl-[0.25%] pr-[0.15%] py-[0.15%] w-full rounded-[0.35em] bg-[#fcb2a2] border-[2px] border-[#ff0000] text-[#000000] leading-[1.2] text-[0.55em]"
            aria-live="assertive"
          >
            {errorMessage.userProfileEditError}
          </p>
        )}
        <form
          className="mt-[1%] mb-[1%] mx-0 md:mx-auto p-5 w-full lg:w-[80%] rounded-3xl bg-gray-100 text-[1.75rem] font-inter"
          method="POST"
        >
          <div className="relative">
            <input
              id="update-profile-form__name"
              className={`mt-[2%] mb-[1%] focus:outline-[none] focus:active:opacity-100 block px-2.5 pb-2.5 pt-4 w-full text-[0.5em] text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer ${
                userProfileEditFormState.name !== "" &&
                userProfileEditFormState.name !== currentUserName.current
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
              value={userProfileEditFormState.name}
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
              aria-describedby="update-profile-form__name-requirements"
            />
            <label
              lang="en"
              className="absolute text-[0.5em] text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-1 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              htmlFor="update-profile-form__name"
            >
              Update your name
            </label>
          </div>
          {userProfileEditFormState.name &&
            nameInputStatus.focused &&
            !nameInputStatus.valid && (
              <p
                id="update-profile-form__name-requirements"
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
              id="update-profile-form__email-address"
              className={`mt-[2%] mb-[1%] focus:outline-[none] focus:active:opacity-100 block px-2.5 pb-2.5 pt-4 w-full text-[0.5em] text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer ${
                userProfileEditFormState.emailAddress !== "" &&
                userProfileEditFormState.emailAddress !==
                  currentUserEmailAddress.current
                  ? emailAddressInputStatus.valid
                    ? "!border-[2px] !border-[#0bd40b]"
                    : "!border-[2px] !border-[#ff0000]"
                  : ""
              }`}
              lang="en"
              name="emailAddress"
              type="email"
              maxLength={150}
              value={userProfileEditFormState.emailAddress}
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
              aria-describedby="update-profile-form__email-address-requirements"
            />
            <label
              lang="en"
              className="absolute text-[0.5em] text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-1 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              htmlFor="update-profile-form__email-address"
            >
              Update your email address
            </label>
          </div>
          {userProfileEditFormState.emailAddress &&
            emailAddressInputStatus.focused &&
            !emailAddressInputStatus.valid && (
              <p
                id="update-profile-form__email-address-requirements"
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
              id="update-profile-form__password"
              className={`mt-[2%] mb-[1%] focus:outline-[none] focus:active:opacity-100 block px-2.5 pb-2.5 pt-4 w-full text-[0.5em] text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer ${
                userProfileEditFormState.password !== ""
                  ? passwordInputStatus.valid
                    ? "!border-[2px] !border-[#0bd40b]"
                    : "!border-[2px] !border-[#ff0000]"
                  : ""
              }`}
              lang="en"
              name="password"
              type={passwordVisibilityStatus.passwordVisibilityType}
              maxLength={50}
              value={userProfileEditFormState.password}
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
              aria-describedby="update-profile-form__password-requirements"
            />
            <label
              lang="en"
              className="absolute text-[0.5em] text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-1 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              htmlFor="update-profile-form__password"
            >
              Update your password
            </label>
            <span className="absolute inset-y-0 end-0 flex items-center z-1 px-3 cursor-pointer text-[0.6em]">
              <i
                className={`bi ${passwordVisibilityStatus.passwordVisibilityIcon}`}
                onClick={() => togglePasswordVisibilityStatus("password")}
              ></i>
            </span>
          </div>
          {userProfileEditFormState.password &&
            passwordInputStatus.focused &&
            !passwordInputStatus.valid && (
              <p
                id="update-profile-form__password-requirements"
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
              id="update-profile-form__confirm-password"
              className={`mt-[2%] mb-[1%] focus:outline-[none] focus:active:opacity-100 block px-2.5 pb-2.5 pt-4 w-full text-[0.5em] text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer ${
                userProfileEditFormState.confirmPassword !== ""
                  ? confirmPasswordInputStatus.valid
                    ? "!border-[2px] !border-[#0bd40b]"
                    : "!border-[2px] !border-[#ff0000]"
                  : ""
              }`}
              lang="en"
              name="confirmPassword"
              type={passwordVisibilityStatus.confirmPasswordVisibilityType}
              maxLength={50}
              value={userProfileEditFormState.confirmPassword}
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
              aria-describedby="update-profile-form__confirm-password-requirements"
            />
            <label
              lang="en"
              className="absolute text-[0.5em] text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-1 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              htmlFor="update-profile-form__confirm-password"
            >
              Confirm new password
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
          {userProfileEditFormState.confirmPassword &&
            confirmPasswordInputStatus.focused &&
            !confirmPasswordInputStatus.valid && (
              <p
                id="update-profile-form__confirm-password-requirements"
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
          <div className="mt-[4%] flex flex-row justify-between space-x-2">
            <button
              type="button"
              onClick={() => setDisplayDeleteDialogBox(true)}
              className="px-5 py-2.5 me-2 mb-2 text-white bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-200 font-medium rounded-full text-[0.5em]"
            >
              Delete
            </button>
            <div className="flex flex-row justify-between">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 me-2 mb-2 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-[0.5em]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`mb-2 px-5 py-2.5 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-[0.5em] text-center ${
                  isSaveButtonDisabled.current
                    ? "!bg-[#c8c8c8] !text-[#dcdcdc] !border-[none]"
                    : ""
                }`}
                lang="en"
                name="save"
                type="button"
                disabled={isSaveButtonDisabled.current ? true : false}
              >
                <i></i>Save
              </button>
            </div>
          </div>
        </form>
      </div>
      {displayDeleteDialogBox && (
        <div className="z-4 fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif]">
          <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 cursor-pointer shrink-0 fill-gray-400 hover:fill-red-500 float-right"
              viewBox="0 0 320.591 320.591"
              onClick={() => setDisplayDeleteDialogBox(false)}
            >
              <path
                d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                data-original="#000000"
              ></path>
              <path
                d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                data-original="#000000"
              ></path>
            </svg>

            <div className="my-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-14 fill-red-500 inline"
                viewBox="0 0 286.054 286.054"
              >
                <path
                  fill="#e2574c"
                  d="M143.027 0C64.04 0 0 64.04 0 143.027c0 78.996 64.04 143.027 143.027 143.027 78.996 0 143.027-64.022 143.027-143.027C286.054 64.04 222.022 0 143.027 0zm0 259.236c-64.183 0-116.209-52.026-116.209-116.209S78.844 26.818 143.027 26.818s116.209 52.026 116.209 116.209-52.026 116.209-116.209 116.209zm.009-196.51c-10.244 0-17.995 5.346-17.995 13.981v79.201c0 8.644 7.75 13.972 17.995 13.972 9.994 0 17.995-5.551 17.995-13.972V76.707c-.001-8.43-8.001-13.981-17.995-13.981zm0 124.997c-9.842 0-17.852 8.01-17.852 17.86 0 9.833 8.01 17.843 17.852 17.843s17.843-8.01 17.843-17.843c-.001-9.851-8.001-17.86-17.843-17.86z"
                  data-original="#e2574c"
                />
              </svg>

              <h4 className="text-lg text-gray-800 font-semibold mt-6">
                Your account and all your notes will be deleted permanently!
              </h4>
              <p className="text-[0.5em] text-gray-500 mt-2">
                Are you sure you want to proceed?
              </p>
            </div>

            <div className="flex max-sm:flex-col gap-4">
              <button
                type="button"
                onClick={() => setDisplayDeleteDialogBox(false)}
                className="px-5 py-2.5 rounded-lg w-full tracking-wide text-gray-800 text-[0.5em] border-none outline-none bg-gray-200 hover:bg-gray-300"
              >
                I am not sure
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-lg w-full tracking-wide text-white text-[0.5em] border-none outline-none bg-red-500 hover:bg-red-600"
              >
                Yes, delete my account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileEditModal;
