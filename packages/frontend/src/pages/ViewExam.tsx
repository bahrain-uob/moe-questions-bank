import React, { useState, useEffect } from "react";
import invokeApig from "../lib/callAPI.ts";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../lib/contextLib.ts";

const ViewExam: React.FC = () => {
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("");
  const [totalMark, setMark] = useState("");
  const [semester, setSemester] = useState("");
  const [createdBy, setCreator] = useState("");
  const [creationDate, setDate] = useState("");
  const [contributers, setContributers] = useState("");
  const [examState, setExamState] = useState("");
  const [approverMsg, setApproverMsg] = useState("");
  const [responseResult, setResponseResult] = useState<string>("");
  const [loadingPage, setLoadingPage] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingChangeState, setLoadingChangeState] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { userRole } = useAppContext();
  const navigate = useNavigate();

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      //@ts-ignore
      const response = await invokeApig({
        path: `/examForm/${id}`, // Adjust path as needed
        method: "GET",
      });

      if (!response || Object.keys(response).length === 0) {
        console.log(response);
        setErrorMsg("Error getting exam data!");
        return;
      }

      console.log("Initial Data Loaded:", response);

      if (response.examState === "building") {
        navigate("/dashboard/examForm/" + id);
      }

      setGrade(response.examClass);
      setSubject(response.examSubject);
      setSemester(response.examSemester);
      setCreator(response.createdBy);
      setDate(response.creationDate);
      setContributers(String(response.contributers));
      setResponseResult(response.examContent);
      setDuration(response.examDuration);
      setMark(response.examMark);
      setExamState(response.examState);
      setApproverMsg(response.approverMsg);
    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    } finally {
      setLoadingPage(false); // Mark loading as complete
    }
  };

  useEffect(() => {
    // Add a timeout before fetching data
    const timer = setTimeout(() => {
      fetchInitialData();
    }, 2000); // 3000ms = 3 seconds delay

    // Cleanup the timeout if the component unmounts
    return () => clearTimeout(timer);
  }, [id]);

  const changeExamStateToBuild = async () => {
    setLoadingChangeState(true);
    const payload = {
      examID: id,
    };

    try {
      const response = await invokeApig({
        path: "/changeExamToBuild",
        method: "POST",
        body: payload,
      });

      console.log(response);
      navigate("/dashboard/examForm/" + id);
    } catch (error) {
      console.error("Error sending exam:", error);
    } finally {
      setLoadingChangeState(false);
    }
  };

  const approveExam = async () => {
    setLoadingChangeState(true);

    if (!approverMsg) {
      alert("Please add feedback!");
      setLoadingChangeState(false);
      return;
    }
    const payload = {
      examID: id,
      approverMsg: approverMsg,
    };

    try {
      const response = await invokeApig({
        path: "/approveExam",
        method: "POST",
        body: payload,
      });

      console.log(response);
      navigate("/dashboard/viewExam/" + id);
      window.location.reload();
    } catch (error) {
      console.error("Error sending exam:", error);
    } finally {
      setLoadingChangeState(false);
    }
  };

  const disapproveExam = async () => {
    setLoadingChangeState(true);
    if (!approverMsg) {
      alert("Please add feedback!");
      setLoadingChangeState(false);
      return;
    }
    const payload = {
      examID: id,
      approverMsg: approverMsg,
    };

    try {
      const response = await invokeApig({
        path: "/disapproveExam",
        method: "POST",
        body: payload,
      });

      console.log(response);
      navigate("/dashboard/viewExam/" + id);
      window.location.reload();
    } catch (error) {
      console.error("Error sending exam:", error);
    } finally {
      setLoadingChangeState(false);
    }
  };

  // Show loading state
  if (loadingPage) {
    return <div>Loading...</div>;
  }

  if (errorMsg) {
    return <div>{errorMsg}</div>;
  }

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#f9f9f9",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflowY: "auto",
        height: "100vh",
      }}
    >
      <h2
        style={{
          fontFamily: "Georgia, serif",
          color: "#333",
          marginBottom: "1rem",
          fontSize: "28px",
          marginTop: "0",
        }}
      >
        View Exam
      </h2>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between", // Align buttons to opposite sides
          gap: "1rem", // Adds space between buttons
          width: "100%",
          maxWidth: "900px",
          padding: "1rem 0",
        }}
      >
        {examState === "pending" && (
          <div
            style={{
              backgroundColor: "rgba(255, 140, 0, 0.8)", // Orange with transparency
              color: "#4f4f4f", // White text for contrast
              padding: "0.5rem 1rem", // Small padding for compact size
              borderRadius: "8px", // Rounded corners
              border: "1px solid rgba(255, 140, 0, 0.8)", // Slightly darker border
              display: "inline-block", // Prevent full width
              fontSize: "14px", // Smaller text
              fontWeight: "bold", // Bold text for emphasis
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
              textAlign: "center", // Center text
            }}
          >
            {examState.toUpperCase()}
          </div>
        )}

        {examState === "approved" && (
          <div
            style={{
              backgroundColor: "rgba(34, 139, 34, 0.5)", // Dark green with transparency
              color: "#4f4f4f", // Grey text color
              padding: "0.25rem 0.75rem", // Reduced padding to make it more compact
              borderRadius: "8px", // Rounded corners
              border: "1px solid rgba(34, 139, 34, 0.5)", // Slightly darker border
              display: "block", // Block-level to align properly
              fontSize: "12px", // Smaller font size to reduce height
              fontWeight: "bold", // Bold text for emphasis
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
              textAlign: "left", // Align text to the left
              marginBottom: "0.5rem",
            }}
          >
            ✅ {examState.toUpperCase()}
            <div
              style={{
                textAlign: "left",
              }}
            >
              <p>{approverMsg}</p>
            </div>
          </div>
        )}

        {examState === "disapproved" && (
          <div
            style={{
              backgroundColor: "rgba(220, 20, 60, 0.5)", // Dark red with transparency
              color: "#4f4f4f", // Grey text color
              padding: "0.25rem 0.75rem", // Reduced padding to make it more compact
              borderRadius: "8px", // Rounded corners
              border: "1px solid rgba(220, 20, 60, 0.7)", // Slightly darker border
              display: "block", // Block-level to align properly
              fontSize: "12px", // Smaller font size to reduce height
              fontWeight: "bold", // Bold text for emphasis
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
              textAlign: "left", // Align text to the left
              marginBottom: "0.5rem", // Reduced space below
            }}
          >
            ❌ {examState.toUpperCase()}
            <div
              style={{
                textAlign: "left",
                marginTop: "0.5rem", // Reduced top margin for compactness
              }}
            >
              <p>{approverMsg}</p>
            </div>
            {userRole === "User" && (
              <div
                style={{
                  marginTop: "0.5rem", // Reduced margin for button space
                }}
              >
                <button
                  onClick={changeExamStateToBuild}
                  style={{
                    padding: "0.25rem 0.75rem", // Smaller padding for a smaller button
                    backgroundColor: "#2196F3", // Blue color for 'Send For Approval'
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px", // Smaller font size
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition:
                      "background-color 0.3s ease, transform 0.3s ease",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
                    width: "auto", // Auto width to fit text
                  }}
                  onMouseOver={(e) =>
                    //@ts-ignore
                    (e.target.style.backgroundColor = "#1976D2")
                  }
                  onMouseOut={(e) =>
                    //@ts-ignore
                    (e.target.style.backgroundColor = "#2196F3")
                  }
                  onMouseDown={(e) =>
                    //@ts-ignore
                    (e.target.style.transform = "scale(0.98)")
                  }
                  //@ts-ignore
                  onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
                >
                  {loadingChangeState ? (
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
                      Changing exam State...
                    </span>
                  ) : (
                    "Modify Exam"
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          width: "900px",
          fontSize: "14px",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
          padding: "1rem",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          color: "#333",
        }}
      >
        <div style={{ flex: 1, textAlign: "left", paddingRight: "1rem" }}>
          <strong>Creation Date:</strong> {creationDate}
        </div>
        <div style={{ flex: 1, textAlign: "center", paddingRight: "1rem" }}>
          <strong>Created By:</strong> {createdBy}
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "right",
            overflowX: "auto", // Enables horizontal scrolling
            whiteSpace: "nowrap", // Prevents text wrapping
            paddingRight: "1rem",
          }}
        >
          <strong>Contributors: </strong>
          <div
            style={{
              display: "inline-block",
              maxWidth: "100%",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis", // Adds ellipsis when content overflows
            }}
          >
            {contributers}
          </div>
        </div>
      </div>

      {/* Top Horizontal Form */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "900px",
          marginBottom: "1rem",
          padding: "1rem",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          margin: "0 auto",
        }}
      >
        {/* Displaying the data horizontally with labels */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Grade */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <label
              style={{
                fontWeight: "bold",
                fontSize: "14px",
                marginBottom: "0.3rem",
              }}
            >
              Grade:
            </label>
            <div
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "14px",
                backgroundColor: "#f3f3f3",
                textAlign: "center",
              }}
            >
              {grade}
            </div>
          </div>

          {/* Subject */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <label
              style={{
                fontWeight: "bold",
                fontSize: "14px",
                marginBottom: "0.3rem",
              }}
            >
              Subject:
            </label>
            <div
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "14px",
                backgroundColor: "#f3f3f3",
                textAlign: "center",
              }}
            >
              {subject}
            </div>
          </div>

          {/* Semester */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <label
              style={{
                fontWeight: "bold",
                fontSize: "14px",
                marginBottom: "0.3rem",
              }}
            >
              Semester:
            </label>
            <div
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "14px",
                backgroundColor: "#f3f3f3",
                textAlign: "center",
              }}
            >
              {semester}
            </div>
          </div>

          {/* Duration */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <label
              style={{
                fontWeight: "bold",
                fontSize: "14px",
                marginBottom: "0.3rem",
              }}
            >
              Duration (hours):
            </label>
            <div
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "14px",
                backgroundColor: "#f3f3f3",
                textAlign: "center",
              }}
            >
              {duration}
            </div>
          </div>

          {/* Total Marks */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <label
              style={{
                fontWeight: "bold",
                fontSize: "14px",
                marginBottom: "0.3rem",
              }}
            >
              Total Marks:
            </label>
            <div
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "14px",
                backgroundColor: "#f3f3f3",
                textAlign: "center",
              }}
            >
              {totalMark}
            </div>
          </div>
        </div>
      </div>

      {/* Text Area for Generated Exam */}
      <div
        style={{
          marginTop: "1rem",
          width: "100%",
          maxWidth: "900px",
        }}
      >
        <textarea
          value={responseResult}
          readOnly
          style={{
            width: "100%",
            height: "400px",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
            resize: "none",
            backgroundColor: "#fff",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between", // Align buttons to opposite sides
            gap: "1rem", // Adds space between buttons
            width: "100%",
            maxWidth: "900px",
            padding: "1rem 0",
          }}
        >
          {userRole === "Admin" && examState === "pending" && (
            <div
              style={{
                marginTop: "2rem",
                padding: "1rem",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                width: "900px",
                margin: "0 auto",
              }}
            >
              <h3
                style={{
                  marginBottom: "1rem",
                  fontSize: "1.2rem",
                  color: "#333",
                  textAlign: "center",
                }}
              >
                Provide Feedback and Update Exam Status
              </h3>
              <textarea
                placeholder="Enter your feedback here..."
                onChange={(e) => setApproverMsg(e.target.value)}
                maxLength={150}
                required
                style={{
                  width: "100%",
                  minHeight: "80px",
                  padding: "0.8rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "14px",
                  resize: "none",
                  marginBottom: "1rem",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <button
                  onClick={approveExam}
                  style={{
                    padding: "0.6rem 1rem",
                    backgroundColor: "#28a745",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition:
                      "background-color 0.3s ease, transform 0.3s ease",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                  onMouseOver={(e) =>
                    //@ts-ignore
                    (e.target.style.backgroundColor = "#218838")
                  }
                  onMouseOut={(e) =>
                    //@ts-ignore
                    (e.target.style.backgroundColor = "#28a745")
                  }
                  onMouseDown={(e) =>
                    //@ts-ignore
                    (e.target.style.transform = "scale(0.98)")
                  }
                  //@ts-ignore
                  onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
                >
                  {loadingChangeState ? (
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
                    "Approve Exam"
                  )}
                </button>
                <button
                  onClick={disapproveExam}
                  style={{
                    padding: "0.6rem 1rem",
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition:
                      "background-color 0.3s ease, transform 0.3s ease",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                  onMouseOver={(e) =>
                    //@ts-ignore
                    (e.target.style.backgroundColor = "#c82333")
                  }
                  onMouseOut={(e) =>
                    //@ts-ignore
                    (e.target.style.backgroundColor = "#dc3545")
                  }
                  onMouseDown={(e) =>
                    //@ts-ignore
                    (e.target.style.transform = "scale(0.98)")
                  }
                  //@ts-ignore
                  onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
                >
                  {loadingChangeState ? (
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
                    "Disapprove Exam"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
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

export default ViewExam;
