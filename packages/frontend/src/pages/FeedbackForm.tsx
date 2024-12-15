import React, { useState, useRef } from "react";
import invokeApig from "../lib/callAPI.ts";

const FeedbackForm: React.FC = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      message: message,
    };

    try {
      const response = await invokeApig({
        path: "/feedback",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
      });
      console.log("Response Object:", response);
      alert("Feedback submitted successfully!");
      setMessage("");
    } catch (error) {
      console.error("Error", error);
      alert("Failed to send your Feedback.");
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    setMessage("");
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    mediaRecorderRef.current = mediaRecorder;
    setAudioChunks([]);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setAudioChunks((prev) => [...prev, event.data]);
      }
    };

    mediaRecorder.start();
  };

  const stopRecording = async () => {
    setRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = async () => {
        // Combine chunks into a single blob
        const blob = new Blob(audioChunks, { type: "audio/webm" });

        // Show loading while transcribing
        setLoading(true);
        try {
          const base64Audio = await blobToBase64(blob);
          // Call the transcribe API
          const response = await invokeApig({
            path: "/transcribeAudio",
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream",
            },
            body: base64Audio, // Our lambda expects base64 audio
          });

          if (response && response.transcript) {
            setMessage(response.transcript);
          } else {
            alert("Failed to transcribe audio.");
          }
        } catch (error) {
          console.error("Transcription Error:", error);
          alert("Error transcribing audio.");
        } finally {
          setLoading(false);
        }
      };
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === "string") {
          // Strip the base64 prefix if any
          const base64Data = result.split(",")[1] || result;
          resolve(base64Data);
        } else {
          reject(new Error("Failed to convert blob to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#f9f9f9",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2
        style={{
          fontFamily: "Georgia, serif",
          color: "#333",
          marginBottom: "2rem",
          fontSize: "28px",
        }}
      >
        Report Problem
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "600px",
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            marginBottom: "1.5rem",
          }}
        >
          <label
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#4b4b4b",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Message:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your feedback here..."
            style={{
              width: "100%",
              height: "120px",
              padding: "0.75rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              resize: "none",
            }}
          ></textarea>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {!recording && (
            <button
              type="button"
              onClick={startRecording}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#4b4b4b",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              🎤 Start Recording
            </button>
          )}
          {recording && (
            <button
              type="button"
              onClick={stopRecording}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#d9534f",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ⏹ Stop Recording
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            display: "block",
            width: "100%",
            backgroundColor: loading ? "#ccc" : "#4b4b4b",
            padding: "1rem",
            marginTop: "2rem",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {loading ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  width: "1rem",
                  height: "1rem",
                  border: "2px solid #fff",
                  borderRadius: "50%",
                  borderTop: "2px solid transparent",
                  animation: "spin 1s linear infinite",
                }}
              />
              Processing...
            </span>
          ) : (
            "Submit Feedback"
          )}
        </button>
      </form>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default FeedbackForm;
