import React, { useState } from "react";
import { getCurrentUserEmail } from "../lib/getToken.js";
import { getFormattedDateTime } from "../lib/getDateTime.js";
import { useNavigate } from "react-router-dom";
import invokeLambda from "../lib/invokeLambda.ts";

export function InitialForm() {
  const [grade, setGrade] = useState("Grade 10");
  const [subject, setSubject] = useState("ENG102");
  const [semester, setSemester] = useState("Second 2024/2025");
  const duration = "2";
  const totalMark = "50";
  const questionCounts = {
    MCQ: 0,
    Essay: 0,
    TrueFalse: 0,
    FillInTheBlank: 0,
    ShortAnswer: 0,
  };
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const newExam = true;
  const navigate = useNavigate();


  const handleInitialFormSubmition = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const currentUserEmail = await getCurrentUserEmail();
      console.log("Current User Email:", currentUserEmail);

      const createDate = getFormattedDateTime();

      if (!grade || !subject || !semester) {
        console.log(grade, subject, semester, duration, totalMark);
        setErrorMsg("Please fill the form!");
        setLoading(false);
        return;
      }
      // if (customize) {
      //   setDuration(duration);
      //   setMark(totalMark);
      // }
      setErrorMsg("");
      const payload = {
        class: grade,
        subject: subject,
        semester: semester,
        duration: duration,
        total_mark: totalMark,
        question_types: questionCounts,
        customize: false,
        created_by: currentUserEmail,
        creation_date: createDate,
        contributors: currentUserEmail,
      };

      console.log(payload);

      const functionURL = import.meta.env.VITE_CREATE_EXAM_FUNCTION_URL;
      console.log("Function URL:", functionURL);

      //@ts-ignore
      const response = await invokeLambda({
        method: "POST",
        body: payload,
        url: functionURL,
      });

      // const response = await fetch(functionURL, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(payload),
      // });

      if (!response.ok) {
        setErrorMsg("An error occurred. Please try again.");
        setLoading(false);
        return;
      }

      console.log("API Response:", response);
      console.log("Type of response content:", typeof response);

      console.log(response.body);

      const data = await response.json();

      console.log(data);

      const examID = data.examID;
      navigate("/dashboard/examForm/" + examID);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMsg("An error occurred. Please try again.");
      setLoading(false);
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
        overflowY: "auto", // Enables vertical scrolling if needed
        height: "100vh", // Ensures the form fits the viewport
      }}
    >
      <h2
        style={{
          fontFamily: "Georgia, serif",
          color: "#333",
          marginBottom: "1rem",
          fontSize: "28px",
        }}
      >
        Generate Exam
      </h2>

      <span>
        <p style={{ color: "red" }}>{errorMsg}</p>
      </span>
      {newExam && (
        <form
          onSubmit={handleInitialFormSubmition}
          style={{
            width: "100%",
            maxWidth: "800px",
            backgroundColor: "#fff",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
            fontFamily: "Arial, sans-serif",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem", // Consistent spacing between elements
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              flexWrap: "wrap", // Responsive behavior
              gap: "1.5rem",
            }}
          >
            <label
              style={{
                flex: "1",
                minWidth: "200px",
                fontSize: "16px",
                color: "#4b4b4b",
                fontWeight: "bold",
              }}
            >
              Grade:
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: "0.5rem",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                }}
              >
                <option value="Grade 10">Grade 10</option>
              </select>
            </label>
            <label
              style={{
                flex: "1",
                minWidth: "200px",
                fontSize: "16px",
                color: "#4b4b4b",
                fontWeight: "bold",
              }}
            >
              Semester:
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: "0.5rem",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                }}
              >
                <option value="Second 2024/2025">Second 2024/2025</option>
                <option value="First 2024/2025">First 2024/2025</option>
              </select>
            </label>

            <label
              style={{
                flex: "1",
                minWidth: "200px",
                fontSize: "16px",
                color: "#4b4b4b",
                fontWeight: "bold",
              }}
            >
              Subject:
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: "0.5rem",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                }}
              >
                <option value="ENG102">ENG102</option>
                <option value="ARAB101">ARAB101</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              alignSelf: "flex-end",
              backgroundColor: "#007BFF",
              color: "#fff",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "none",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              transition: "background-color 0.3s ease",
            }}
            //@ts-ignore
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
            //@ts-ignore
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#007BFF")}
          >
            {loading ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
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
                ></span>
                Loading...
              </span>
            ) : (
              "Create"
            )}
          </button>
        </form>
      )}

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
}

export default InitialForm;
