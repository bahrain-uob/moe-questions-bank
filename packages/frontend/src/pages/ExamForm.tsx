import React, { useState } from "react";
import invokeApig from "../lib/callAPI.ts";

const ExamForm: React.FC = () => {
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("");
  const [totalMark, setMark] = useState("");
  const [questionTypes, setQuestionTypes] = useState<string[]>([]);
  const [responseResult, setResponseResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      class: grade,
      subject: subject,
      duration: duration,
      total_mark: totalMark,
      question_types: questionTypes,
    };

    try {
      const response = await invokeApig({
        path: "/generate",
        method: "POST",
        body: payload,
      });
      alert("Successfully generated exam.");
      setResponseResult(response.question);
    } catch (error) {
      console.error("Error generating exam:", error);
      alert("Failed to generate exam. Please try again.");
      setResponseResult("Error generating exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f9f9f9",
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
        }}
      >
        Generate Exam
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              fontWeight: "bold",
              color: "#4b4b4b",
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            Grade:
          </label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          >
            <option value="">Select Grade</option>
            <option value="Grade 10">Secondary Grade 1</option>
            <option value="Grade 11">Secondary Grade 2</option>
            <option value="Grade 12">Secondary Grade 3</option>
          </select>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              fontWeight: "bold",
              color: "#4b4b4b",
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            Subject:
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          >
            <option value="">Select Subject</option>
            <option value="ENG 101">ENG 101</option>
            <option value="ENG 102">ENG 102</option>
            <option value="ENG 201">ENG 201</option>
            <option value="ENG 301">ENG 301</option>
            <option value="ENG 218">ENG 218</option>
          </select>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              fontWeight: "bold",
              color: "#4b4b4b",
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            Duration (in hours):
          </label>
          <input
            type="number"
            value={duration}
            min={1}
            max={3}
            required
            onChange={(e) => setDuration(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
        </div>

        <fieldset
          style={{
            marginBottom: "1.5rem",
            border: "1px solid #ccc",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          <legend
            style={{
              fontWeight: "bold",
              color: "#4b4b4b",
              padding: "0 0.5rem",
            }}
          >
            Question Types:
          </legend>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {["MCQ", "Essay", "TrueFalse", "Fill-In-The-Blank", "ShortAnswer"].map(
              (type) => (
                <label key={type} style={{ color: "#333", fontSize: "14px" }}>
                  <input
                    type="checkbox"
                    value={type}
                    onChange={(e) =>
                      setQuestionTypes((prev) =>
                        e.target.checked
                          ? [...prev, e.target.value]
                          : prev.filter((item) => item !== e.target.value)
                      )
                    }
                  />{" "}
                  {type}
                </label>
              )
            )}
          </div>
        </fieldset>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              fontWeight: "bold",
              color: "#4b4b4b",
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            Total Mark:
          </label>
          <input
            type="number"
            value={totalMark}
            min={10}
            max={100}
            required
            onChange={(e) => setMark(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: loading ? "#ccc" : "#4b4b4b",
            color: "#fff",
            padding: "1rem",
            borderRadius: "8px",
            border: "none",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Generating..." : "Generate Exam"}
        </button>
      </form>

      <div style={{ marginTop: "2rem" }}>
        <label
          style={{
            fontWeight: "bold",
            color: "#4b4b4b",
            display: "block",
            marginBottom: "0.5rem",
          }}
        >
          Generated Exam:
        </label>
        <textarea
          readOnly
          value={responseResult}
          style={{
            width: "100%",
            height: "200px",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
            resize: "none",
          }}
        />
      </div>
    </div>
  );
};

export default ExamForm;
