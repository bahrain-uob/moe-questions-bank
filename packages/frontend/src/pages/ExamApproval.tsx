import { useState, useEffect } from "react";
import invokeApig from "../lib/callAPI.ts";
import { useNavigate } from "react-router-dom";

function ExamApproval() {
  const [gettingExams, setGettingExams] = useState(true);
  const [gettingExamsError, setGetExamsError] = useState("");
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      //@ts-ignore
      const response = await invokeApig({
        path: `/getPendingExams`, // Adjust path as needed
        method: "GET",
      });

      if (!response || Object.keys(response).length === 0) {
        console.log(response);
        setGetExamsError("No exams found!");
        return;
      }

      // Store the retrieved exams in the state
      setExams(response);

      console.log("Initial Data Loaded:", response);
    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    } finally {
      setGettingExams(false); // Mark loading as complete
    }
  };

  useEffect(() => {
    // Add a timeout before fetching data
    const timer = setTimeout(() => {
      fetchInitialData();
    }, 2000);

    // Cleanup the timeout if the component unmounts
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {gettingExams && <div>Loading exams...</div>}

      {!gettingExams && !gettingExamsError && exams.length > 0 && (
        <div
          style={{
            marginTop: "2rem",
            width: "100%",
            padding: "1rem",
            backgroundColor: "#fafafa",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3 style={{ marginBottom: "1.5rem", color: "#333" }}>
            Pending Exams:
          </h3>
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
                    color: "rgba(255, 140, 0, 0.9)", // Orange for pending
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

      {!gettingExams && gettingExamsError && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            color: "red",
          }}
        >
          {gettingExamsError}
        </div>
      )}
    </div>
  );
}

export default ExamApproval;
