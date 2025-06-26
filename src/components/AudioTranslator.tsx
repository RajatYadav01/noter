import { toast } from "react-toastify";
import { useState, useRef, useEffect } from "react";
import useAuthContext from "../hooks/useAuthContext";

interface AudioTranslatorProps {
  setTranslatedAudio: React.Dispatch<
    React.SetStateAction<{
      audio: Blob | null;
      audioName: string;
      audioDuration: number;
      audioTranscript: string;
    }>
  >;
  showNoteTakingModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const AudioTranslator = ({
  setTranslatedAudio,
  showNoteTakingModal,
}: AudioTranslatorProps) => {
  const { loginStatusState } = useAuthContext();

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const mediaStream = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecordingDotVisible, setIsRecordingDotVisible] =
    useState<boolean>(true);
  const recordingDotIntervalIDRef = useRef<ReturnType<
    typeof setInterval
  > | null>(null);
  const [seconds, setSeconds] = useState<number>(0);
  const recordingTimerIntervalIDRef = useRef<ReturnType<
    typeof setInterval
  > | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [recordingTranscript, setRecordingTranscript] = useState<string>("");
  const isSpeechRecognitionStoppedByUser = useRef<boolean>(false);

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const remainingSeconds = (secs % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  };

  useEffect(() => {
    if (
      !isRecording &&
      !isTranscribing &&
      recordingDuration &&
      recordedAudioBlob &&
      recordingTranscript
    ) {
      setTranslatedAudio({
        audio: recordedAudioBlob,
        audioName: "recording.webm",
        audioDuration: recordingDuration,
        audioTranscript: recordingTranscript,
      });
      showNoteTakingModal(true);
    }
  }, [
    isRecording,
    isTranscribing,
    recordedAudioBlob,
    recordingDuration,
    recordingTranscript,
    setTranslatedAudio,
    showNoteTakingModal,
  ]);

  const handleRecordingAndTranscribing = () => {
    if (!loginStatusState.loggedIn)
      toast.error("You should be logged in to perform this action.");
    else {
      if (!mediaRecorderRef.current && !recognitionRef.current) {
        setRecordedAudioBlob(null);
        setRecordingDuration(0);
        setRecordingTranscript("");
        startTranscribing();
        startRecording();
      } else {
        stopTranscribing();
        stopRecording();
      }
    }
  };

  const startDotBlinking = () => {
    if (recordingDotIntervalIDRef.current) return;
    recordingDotIntervalIDRef.current = setInterval(() => {
      setIsRecordingDotVisible((prevVisible) => !prevVisible);
    }, 1000);
  };

  const stopDotBlinking = () => {
    if (recordingDotIntervalIDRef.current) {
      clearInterval(recordingDotIntervalIDRef.current);
      recordingDotIntervalIDRef.current = null;
    }
    setIsRecordingDotVisible(true);
  };

  const startTimer = () => {
    if (recordingTimerIntervalIDRef.current) return;
    recordingTimerIntervalIDRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (recordingTimerIntervalIDRef.current) {
      clearInterval(recordingTimerIntervalIDRef.current);
      recordingTimerIntervalIDRef.current = null;
      setSeconds(0);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = () => {
        const recordedBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setRecordedAudioBlob(recordedBlob);
        const audioURL = URL.createObjectURL(recordedBlob);
        const audio = new Audio(audioURL);
        audio.onloadedmetadata = () => {
          if (audio.duration === Infinity) {
            audio.currentTime = Number.MAX_SAFE_INTEGER;

            audio.ontimeupdate = () => {
              audio.ontimeupdate = null;
              audio.currentTime = 0;
              setRecordingDuration(audio.duration);
            };
          } else {
            setRecordingDuration(audio.duration);
          }
        };
        audioChunksRef.current = [];
        mediaRecorderRef.current = null;
        mediaStream.current = null;
        stopDotBlinking();
        stopTimer();
      };
      mediaRecorderRef.current.start();
      startDotBlinking();
      setIsRecording(true);
      startTimer();
    } catch (error) {
      toast.error(`Can't access microphone due to ${error}`);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  const startTranscribing = async () => {
    if (
      !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      toast.error("Web Speech API is not supported.");
      return;
    }
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => {
        toast.info("Speech recognition started");
        isSpeechRecognitionStoppedByUser.current = false;
      };
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let generatedTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          generatedTranscript += event.results[i][0].transcript;
        }
        setRecordingTranscript(generatedTranscript);
      };
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Error with speech recognition: ", event);
        toast.error(`Error with speech recognition: ${event}`);
      };
      recognition.onend = () => {
        if (isSpeechRecognitionStoppedByUser.current)
          toast.info("Speech recognition stopped");
        else
          toast.info(
            "Speech recognition stopped due to no further speech detected"
          );
        recognitionRef.current = null;
        setIsTranscribing(false);
        stopRecording();
      };
      recognition.start();
      setIsTranscribing(true);
    } catch (error) {
      toast.error(
        `Can't convert speech to text using Web Speech API due to ${error}`
      );
      setIsTranscribing(false);
    }
  };

  const stopTranscribing = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      isSpeechRecognitionStoppedByUser.current = true;
      setIsTranscribing(false);
    }
  };

  return (
    <div
      className={`mt-auto mb-auto ${
        isRecording ? "max-md:w-[15rem]" : "w-[12rem]"
      }`}
    >
      <button
        onClick={handleRecordingAndTranscribing}
        className="inline-flex items-center w-full pt-2 pr-4 pb-2 pl-4 rounded-3xl bg-blue-700 text-1rem text-white hover:bg-blue-800"
      >
        <i
          className={`${
            isRecordingDotVisible ? "visible" : "invisible"
          } pl-2 pr-2 text-[0.5em] bi bi-circle-fill`}
        ></i>
        {isRecording && (
          <span className="pl-1.5 pr-1.5 text-[1em]">
            {formatTime(seconds)}
          </span>
        )}
        <span className="pl-1.5 pr-1.5 text-[1em]">
          {isRecording ? "Stop recording" : "Start recording"}
        </span>
      </button>
    </div>
  );
};

export default AudioTranslator;
