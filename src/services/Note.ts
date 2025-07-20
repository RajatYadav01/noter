import axios from "axios";
import { BACKEND_API_URL } from "../context/authContext";

export const newNote = async (noteFormData: FormData): Promise<string> => {
  const serverResponse = await axios.post(
    `${BACKEND_API_URL}/note/new`,
    noteFormData,
    {
      withCredentials: true,
    }
  );
  return serverResponse.data.message;
};

export const getNote = async (noteID: string): Promise<EditNote> => {
  const serverResponse = await axios.get(`${BACKEND_API_URL}/note/get`, {
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      id: noteID,
    },
    withCredentials: true,
  });
  return serverResponse.data.note;
};

export const getAllNotes = async (userID: string): Promise<Note[]> => {
  const serverResponse = await axios.get(`${BACKEND_API_URL}/note/get-all`, {
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      id: userID,
    },
    withCredentials: true,
  });
  return serverResponse.data.notes;
};

export const getAudioRecording = async (noteID: string): Promise<Blob> => {
  const serverResponse = await axios.get(
    `${BACKEND_API_URL}/note/get-audio-recording`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        id: noteID,
      },
      responseType: "blob",
      withCredentials: true,
    }
  );
  return serverResponse.data;
};

export const updateNote = async (noteUpdateData: string): Promise<EditNote> => {
  const serverResponse = await axios.patch(
    `${BACKEND_API_URL}/note/update`,
    noteUpdateData,
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );
  return serverResponse.data.note;
};

export const uploadImage = async (noteImage: FormData): Promise<EditNote> => {
  const serverResponse = await axios.patch(
    `${BACKEND_API_URL}/note/upload-image`,
    noteImage,
    {
      withCredentials: true,
    }
  );
  return serverResponse.data.note;
};

export const deleteImage = async (
  id: string,
  noteImage: string
): Promise<EditNote> => {
  const serverResponse = await axios.delete(
    `${BACKEND_API_URL}/note/delete-image`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        id: id,
        image: noteImage,
      },
      withCredentials: true,
    }
  );
  return serverResponse.data.note;
};

export const deleteNote = async (noteID: string): Promise<string> => {
  const serverResponse = await axios.delete(`${BACKEND_API_URL}/note/delete`, {
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      id: noteID,
    },
    withCredentials: true,
  });
  return serverResponse.data.message;
};

export const deleteAllNotes = async (userID: string): Promise<string> => {
  const serverResponse = await axios.delete(
    `${BACKEND_API_URL}/note/delete-all`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        userID: userID,
      },
      withCredentials: true,
    }
  );
  return serverResponse.data.message;
};
