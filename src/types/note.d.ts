interface Note {
  _id?: string;
  userID: string;
  type: "text" | "audio" | "";
  heading: string;
  content: string;
  audioRecording: Blob | null;
  audioDuration: number | null;
  images: File[] | null;
  imageCount: number | null;
  isFavourite: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface EditNote extends Omit<Note, "audioRecording" | "images"> {
  audioRecording: string | null;
  images: string[] | null;
}