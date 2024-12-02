import React, { useState } from "react";
import invokeApig from "../lib/callAPI.ts";

const FeedbackForm: React.FC = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      message: message,
    };

    try {
      const response = await invokeApig({
        path: "/feedback",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

      if (response.status === 200) {
        alert("Feedback submitted successfully!");
        setMessage(""); // Clear the textarea after successful submission
      } else {
        alert("Failed to send your feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error", error);
      alert("Failed to send your feedback. Please try again.");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        padding: "2rem",
        borderRadius: "16px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        maxWidth: "800px",
        margin: "2rem auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontWeight: "bold",
          color: "#333",
          marginBottom: "2rem",
          fontSize: "28px",
        }}
      >
        Report Problem
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#4b4b4b",
              display: "block",
              marginBottom: "0.5rem",
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
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
              resize: "none",
            }}
          ></textarea>
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            backgroundColor: "#4b4b4b",
            color: "#fff",
            padding: "1rem",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
