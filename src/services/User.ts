import axios from "axios";
import { BACKEND_API_URL } from "../context/authContext";

export const getUser = async (userID: string): Promise<User> => {
  const serverResponse = await axios.get(`${BACKEND_API_URL}/user/get`, {
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      id: userID,
    },
    withCredentials: true,
  });
  return serverResponse.data.user;
};

export const updateUser = async (
  userProfileUpdateFormData: string
): Promise<User> => {
  const serverResponse = await axios.patch(
    `${BACKEND_API_URL}/user/update`,
    userProfileUpdateFormData,
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );
  return serverResponse.data.user;
};

export const deleteUser = async (userID: string): Promise<string> => {
  const serverResponse = await axios.delete(`${BACKEND_API_URL}/user/delete`, {
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      id: userID,
    },
    withCredentials: true,
  });
  return serverResponse.data.message;
};
