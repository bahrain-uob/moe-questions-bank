import React, { useState } from "react";

const FeedbackForm: React.FC = () => {

  //storing the input
  const [feedbackType, setFeedbackType] = useState("normal");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ feedbackType, message });
    alert("Feedback submitted successfully!");
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
        Submit Feedback
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
            Feedback Type:
          </label>
          <select
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "0.75rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          >
            <option value="normal">Normal Feedback</option>
            <option value="problem">Report a Problem</option>
          </select>
        </div>

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
          style={{
            display: "block",
            width: "100%",
            backgroundColor: "#4b4b4b",
            color: "#fff",
            padding: "1rem",
            border: "none",
            borderRadius: "4px",
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
