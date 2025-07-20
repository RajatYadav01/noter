import axios, { AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  createContext,
  ReactNode,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

export const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

interface LoginStatusDetails {
  loggedIn: boolean;
  userID: string;
  userName: string;
}

export enum LoginStatusAction {
  SET_LOGGED_IN_STATUS = "SET_LOGGED_IN_STATUS",
  SET_USER_ID = "SET_USER_ID",
  SET_USER_NAME = "SET_USER_NAME",
}

interface SetLoggedInStatus {
  type: LoginStatusAction.SET_LOGGED_IN_STATUS;
  payload: boolean;
}

interface SetLoginUserID {
  type: LoginStatusAction.SET_USER_ID;
  payload: string;
}

interface SetLoginUserName {
  type: LoginStatusAction.SET_USER_NAME;
  payload: string;
}

type LoginStatusActions = SetLoggedInStatus | SetLoginUserID | SetLoginUserName;

const loginStatusInitialState: LoginStatusDetails = {
  loggedIn: false,
  userID: "",
  userName: "",
};

function loginStatusReducer(
  state: LoginStatusDetails,
  action: LoginStatusActions
) {
  switch (action.type) {
    case LoginStatusAction.SET_LOGGED_IN_STATUS:
      return { ...state, loggedIn: action.payload };
    case LoginStatusAction.SET_USER_ID:
      return { ...state, userID: action.payload };
    case LoginStatusAction.SET_USER_NAME:
      return { ...state, userName: action.payload };
    default:
      return state;
  }
}

export interface AuthContextType {
  loginStatusState: LoginStatusDetails;
  dispatchLoginStatusState: React.Dispatch<LoginStatusActions>;
  signUp: (signUpFormData: string) => Promise<string>;
  logIn: (logInFormData: string) => Promise<string>;
  tokenRefresh: () => Promise<void>;
  resetPassword: (resetPasswordFormData: string) => Promise<string>;
  logOut: () => Promise<string>;
  startLogOutTimer: (callback: () => Promise<void>) => void;
  clearLogOutTimer: () => void;
  isLogOutTimerActive: React.RefObject<boolean>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<string | null>(
    localStorage.getItem("isLoggedIn") || null
  );
  const [loginStatusState, dispatchLoginStatusState] = useReducer(
    loginStatusReducer,
    loginStatusInitialState
  );

  useEffect(() => {
    if (isUserLoggedIn !== null) {
      dispatchLoginStatusState({
        type: LoginStatusAction.SET_LOGGED_IN_STATUS,
        payload: true,
      });
    } else {
      setIsUserLoggedIn(localStorage.getItem("isLoggedIn"));
    }
  }, [isUserLoggedIn]);

  const logOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLogOutTimerActive = useRef<boolean>(false);
  const startLogOutTimer = async (callback: () => Promise<void>) => {
    if (!logOutTimerRef.current) {
      isLogOutTimerActive.current = true;
      logOutTimerRef.current = setTimeout(async () => {
        logOutTimerRef.current = null;
        await callback();
      }, 300000);
    }
  };
  const clearLogOutTimer = () => {
    if (logOutTimerRef.current) {
      clearTimeout(logOutTimerRef.current);
      logOutTimerRef.current = null;
      isLogOutTimerActive.current = false;
    }
  };

  const navigate = useNavigate();

  const signUp = async (signUpFormData: string): Promise<string> => {
    const serverResponse = await axios.post(
      `${BACKEND_API_URL}/user/new`,
      signUpFormData,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    if (serverResponse.data.message === "Sign up successful") {
      toast.success("Your account has been successfully created.");
      toast.success("Log in to your new account.");
      navigate("/login");
    }
    return serverResponse.data.message;
  };

  const logIn = async (logInFormData: string): Promise<string> => {
    const serverResponse = await axios.post(
      `${BACKEND_API_URL}/user/authenticate`,
      logInFormData,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    if (serverResponse.data.token) {
      localStorage.setItem("isLoggedIn", "true");
      dispatchLoginStatusState({
        type: LoginStatusAction.SET_LOGGED_IN_STATUS,
        payload: true,
      });
      dispatchLoginStatusState({
        type: LoginStatusAction.SET_USER_ID,
        payload: serverResponse.data.user.id,
      });
      dispatchLoginStatusState({
        type: LoginStatusAction.SET_USER_NAME,
        payload: serverResponse.data.user.name,
      });
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + serverResponse.data.token;
      navigate("/", { replace: true });
      toast.success("You have logged in successfully.");
    }
    return serverResponse.data.message;
  };

  const tokenRefresh = async (): Promise<void> => {
    try {
      const serverResponse: AxiosResponse = await axios.get(
        `${BACKEND_API_URL}/user/refresh`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (serverResponse.data.token) {
        localStorage.setItem("isLoggedIn", "true");
        dispatchLoginStatusState({
          type: LoginStatusAction.SET_LOGGED_IN_STATUS,
          payload: true,
        });
        dispatchLoginStatusState({
          type: LoginStatusAction.SET_USER_ID,
          payload: serverResponse.data.user.id,
        });
        dispatchLoginStatusState({
          type: LoginStatusAction.SET_USER_NAME,
          payload: serverResponse.data.user.name,
        });
        axios.defaults.headers.common["Authorization"] =
          "Bearer " + serverResponse.data.token;
        startLogOutTimer(tokenRefresh);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(error);
        if (isLogOutTimerActive.current || localStorage.getItem("isLoggedIn")) {
          clearLogOutTimer();
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("showFavouriteNotes");
          dispatchLoginStatusState({
            type: LoginStatusAction.SET_LOGGED_IN_STATUS,
            payload: false,
          });
          dispatchLoginStatusState({
            type: LoginStatusAction.SET_USER_ID,
            payload: "",
          });
          dispatchLoginStatusState({
            type: LoginStatusAction.SET_USER_NAME,
            payload: "",
          });
          toast.info("You have been logged out due to expired token");
          navigate("/login", { replace: true });
        }
      }
    }
  };

  const resetPassword = async (
    resetPasswordFormData: string
  ): Promise<string> => {
    const serverResponse = await axios.patch(
      `${BACKEND_API_URL}/user/reset-password`,
      resetPasswordFormData,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    if (serverResponse.data.message === "Password reset successful") {
      navigate("/login");
      toast.success(
        "Password reset successful. You can now log in with the new password."
      );
    }
    return serverResponse.data.message;
  };

  const logOut = async (): Promise<string> => {
    const serverResponse: AxiosResponse = await axios.post(
      `${BACKEND_API_URL}/user/logout`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    if (serverResponse.data.message === "Logged out successfully") {
      if (isLogOutTimerActive) {
        clearLogOutTimer();
      }
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("showFavouriteNotes");
      dispatchLoginStatusState({
        type: LoginStatusAction.SET_LOGGED_IN_STATUS,
        payload: false,
      });
      dispatchLoginStatusState({
        type: LoginStatusAction.SET_USER_ID,
        payload: "",
      });
      dispatchLoginStatusState({
        type: LoginStatusAction.SET_USER_NAME,
        payload: "",
      });
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    }
    return serverResponse.data.message;
  };

  return (
    <AuthContext.Provider
      value={{
        loginStatusState,
        dispatchLoginStatusState,
        signUp,
        logIn,
        tokenRefresh,
        resetPassword,
        logOut,
        startLogOutTimer,
        clearLogOutTimer,
        isLogOutTimerActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
