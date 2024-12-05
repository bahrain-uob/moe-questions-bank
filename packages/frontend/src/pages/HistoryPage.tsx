import React, { useState } from "react";
import invokeApig from "../lib/callAPI.ts";
import { useNavigate } from "react-router-dom";

const HistoryPage: React.FC = () => {
  const [gettingExams, setGettingExams] = useState(false);
  const [gettingExamsError, setGetExamsError] = useState("");
  const [exams, setExams] = useState([]);
  const [filterValue, setFilterValue] = useState("pending");
  const navigate = useNavigate();

  async function getExams() {
    setExams([]);
    setGettingExams(true);
    console.log(filterValue);
    try {
      //@ts-ignore
      const response = await invokeApig({
        path: `/getExamHistory`, // Adjust path as needed
        method: "GET",
        queryParams: {
          state: filterValue,
        },
      });

      if (!response || Object.keys(response).length === 0) {
        console.log(response);
        setGetExamsError("No exams found!");
        return;
      }

      setGetExamsError("");

      // Store the retrieved exams in the state
      setExams(response);

      console.log("Initial Data Loaded:", response);
    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    } finally {
      setGettingExams(false); // Mark loading as complete
    }
  }

  // Function to determine the color based on the examState
  function getColorForState(state:any) {
    const stateColors = {
      pending: "rgba(255, 140, 0, 0.9)", // Orange
      approved: "rgba(34, 139, 34, 0.9)", // Green
      disapproved: "rgba(255, 0, 0, 0.9)", // Red
      default: "rgba(105, 105, 105, 0.9)", // Gray for unknown states
    };

    //@ts-ignore
    return stateColors[state.toLowerCase()] || stateColors.default;
  }

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#f5f5f5",
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
          textAlign: "center",
        }}
      >
        Generated Exam History
      </h2>

      {/* Filter Section */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem",
          backgroundColor: "#fff",
          padding: "1rem",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "800px",
        }}
      >
        <div>
          <label
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#555",
            }}
          >
            State:
          </label>
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            style={{
              display: "block",
              width: "200px",
              padding: "0.6rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              marginTop: "0.5rem",
              fontSize: "14px",
            }}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="disapproved">Disapproved</option>
          </select>
        </div>
        <button
          onClick={getExams}
          style={{
            backgroundColor: "#4b4b4b",
            color: "white",
            padding: "0.4rem 1rem",
            borderRadius: "4px",
            fontSize: "16px",
            border: "none",
            cursor: "pointer",
            marginTop: "1.5rem",
          }}
        >
          {gettingExams ? (
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
              Fetching..
            </span>
          ) : (
            "Apply Filter"
          )}
        </button>
      </div>

      {/* Exam History Section */}
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          backgroundColor: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h3
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#333",
            marginBottom: "1rem",
          }}
        >
          Exam Results:
        </h3>

        {gettingExams && <div>Loading exams...</div>}

        {!gettingExams && gettingExamsError && <div>{gettingExamsError}</div>}

        {!gettingExams && !gettingExamsError && exams.length > 0 && (
          <div>
            {exams.map((exam) => (
              <div
                //@ts-ignore
                key={exam.examID}
                //@ts-ignore
                onClick={() => navigate(`/dashboard/viewExam/${exam.examID}`)} // Redirect to the exam form page
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f9f9f9")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fff")
                }
              >
                {/* Creator */}
                <div style={{ flex: 1, marginRight: "1rem" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#777",
                    }}
                  >
                    Creator
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "#333",
                      fontWeight: "bold",
                    }}
                  >
                    {/*@ts-ignore*/}
                    {exam.createdBy}
                  </p>
                </div>

                {/* Date */}
                <div style={{ flex: 1, marginRight: "1rem" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#777",
                    }}
                  >
                    Date
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "#333",
                      fontWeight: "bold",
                    }}
                  >
                    {/*@ts-ignore*/}
                    {exam.creationDate}
                  </p>
                </div>

                {/* Subject */}
                <div style={{ flex: 1, marginRight: "1rem" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#777",
                    }}
                  >
                    Subject
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "#333",
                      fontWeight: "bold",
                    }}
                  >
                    {/*@ts-ignore*/}
                    {exam.examSubject}
                  </p>
                </div>

                {/* Class */}
                <div style={{ flex: 1, marginRight: "1rem" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#777",
                    }}
                  >
                    Class
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "#333",
                      fontWeight: "bold",
                    }}
                  >
                    {/*@ts-ignore*/}
                    {exam.examClass}
                  </p>
                </div>

                {/* Semester */}
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#777",
                    }}
                  >
                    Semester
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "#333",
                      fontWeight: "bold",
                    }}
                  >
                    {/*@ts-ignore*/}
                    {exam.examSemester}
                  </p>
                </div>

                {/* State */}
                <div
                  style={{
                    flex: 1,
                    textAlign: "right",
                  }}
                >
                  <p
                    style={{
                      marginTop: "14px",
                      textAlign: "center",
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: "bold",
                      //@ts-ignore
                      color: getColorForState(exam.examState), // Dynamic color based on exam state
                    }}
                  >
                    {/*@ts-ignore*/}
                    {exam.examState.toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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

export default HistoryPage;
