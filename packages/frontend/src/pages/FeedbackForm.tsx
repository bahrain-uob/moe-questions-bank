import React, { useState } from "react";
import invokeApig from "../lib/callAPI.ts";

const FeedbackForm: React.FC = () => {
  //storing the input
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); //prevents the page from refreshing

    setLoading(true); // Start loading animation

    //sending those data to lambda to take it to sagemaker...
    const payload = {
      message: message,
    };

    try {
      //send the form data to a server="lambda" and wait for lambda to respond
      const response = await invokeApig({
        path: "/feedback",
        method: "POST",
        headers: {
          //tells the server the format of the data
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
      setLoading(false); // Stop loading animation
    }
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
              Loading...
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
