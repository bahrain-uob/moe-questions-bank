import React, { useState } from "react";
import invokeApig from "../lib/callAPI.ts";

//storing user input
const ExamForm: React.FC = () => {
  //store the input
  const [grade, setGrade] = useState("Grade 10"); //Default to "Grade 10"
  const [subject, setSubject] = useState("ENG102"); // Default to "ENG102"
  const [duration, setDuration] = useState("");
  const [totalMark, setMark] = useState("");
  const [questionTypes, setQuestionTypes] = useState<string[]>([]);
  const [questionCounts, setQuestionCounts] = useState({
    MCQ: 0,
    Essay: 0,
    TrueFalse: 0,
    FillInTheBlank: 0,
    ShortAnswer: 0,
  });
  
  const [responseResult, setResponseResult] = useState<string>(""); // State to store the API response
  const [loading, setLoading] = useState(false);
  const [likePreviousExams, setLikePreviousExams] = useState(true);


  //async = can use await (dor time consuming tasks)
  //the fun. takes argument (e) ,React.FormEvent means a form-event(submit the form)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); //prevents the page from refreshing when submit the form cuse When you submit a form in React, the browser automatically reloads the page unless you stop it

    setLoading(true); // Start loading animation

    //sending those data to lambda to take it to Bedrock...
    const payload = {
      class: grade,
      subject: subject,
      duration: duration,
      total_mark: totalMark,
      question_types: questionCounts,
      like_previous_exams:likePreviousExams
    };

    console.log("Submitting exam data to the model:", payload);


    try {
      const response = await invokeApig({
        path: "/generate",
        method: "POST",
        body: payload,
      });

      console.log("API Response:", response);
      alert("Successfully generated exam.");
      setResponseResult(response.question);
    } catch (error) {
      console.error("Error generating exam:", error);
      alert("Failed to generate exam. Please try again.");
      setResponseResult("Error generating exam. Please try again."); // Show error in the textarea
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
        <label
          style={{
            fontSize: "16px",
            color: "#4b4b4b",
            marginBottom: "1rem",
            display: "block",
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
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          >
            <option value="Grade 10">Grade 10</option>
          </select>
        </label>

        <label
          style={{
            fontSize: "16px",
            color: "#4b4b4b",
            marginBottom: "1rem",
            display: "block",
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
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          >
            <option value="ENG102">ENG102</option>
          </select>
        </label>

        <label
      style={{
        fontSize: "16px",
        color: "#4b4b4b",
        marginTop: "1rem",
        marginBottom: "1rem",
        display: "block",
        fontWeight: "bold",
      }}
    >
      <input
        type="checkbox"
        checked={likePreviousExams}
        onChange={(e) => setLikePreviousExams(e.target.checked)}
        style={{
          marginRight: "0.5rem",
        }}
      />
      Like Previous Exams
    </label>


    {likePreviousExams ? (
  <>
    <label
      style={{
        fontSize: "16px",
        color: "#4b4b4b",
        marginBottom: "1rem",
        display: "block",
        fontWeight: "bold",
      }}
    >
      Duration:
      <input
        type="number"
        value={2} // Fixed value
        readOnly
        style={{
          display: "block",
          width: "100%",
          marginTop: "0.5rem",
          padding: "0.75rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
          fontSize: "14px",
        }}
      />
    </label>
    <label
      style={{
        fontSize: "16px",
        color: "#4b4b4b",
        marginBottom: "1rem",
        marginTop: "0.5rem",
        display: "block",
        fontWeight: "bold",
      }}
    >
      Total Mark:
      <input
        type="number"
        value={50} // Fixed value
        readOnly
        style={{
          display: "block",
          width: "100%",
          marginTop: "0.5rem",
          padding: "0.75rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
          fontSize: "14px",
        }}
      />
    </label>
  </>
) : (
  <>
   <label
          style={{
            fontSize: "16px",
            color: "#4b4b4b",
            marginBottom: "1rem",
            display: "block",
            fontWeight: "bold",
          }}
        >
          
          Duration:
          <input
            type="number"
            min={1}
            max={3}
            value={duration}
            required
            onChange={(e) => setDuration(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.5rem",
              padding: "0.75rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          ></input>
        </label>

    {/*    <fieldset
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <legend
            style={{
              fontSize: "16px",
              color: "#4b4b4b",
              fontWeight: "bold",
              padding: "0 0.5rem",
            }}
          >
            Question Types
          </legend>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <label style={{ fontSize: "14px", color: "#333" }}>
              <input
                type="checkbox"
                value="MCQ"
                onChange={(e) =>
                  setQuestionTypes(
                    (prev) =>
                      e.target.checked
                        ? [...prev, e.target.value]
                        : prev.filter((type) => type !== e.target.value) //??
                  )
                }
              />{" "}
              MCQ
            </label>
            <label style={{ fontSize: "14px", color: "#333" }}>
              <input
                type="checkbox"
                value="Essay"
                onChange={(e) =>
                  setQuestionTypes((prev) =>
                    e.target.checked
                      ? [...prev, e.target.value]
                      : prev.filter((type) => type !== e.target.value)
                  )
                }
              />{" "}
              Essay
            </label>
            <label style={{ fontSize: "14px", color: "#333" }}>
              <input
                type="checkbox"
                value="TrueFalse"
                onChange={(e) =>
                  setQuestionTypes((prev) =>
                    e.target.checked
                      ? [...prev, e.target.value]
                      : prev.filter((type) => type !== e.target.value)
                  )
                }
              />{" "}
              True/False
            </label>
            <label style={{ fontSize: "14px", color: "#333" }}>
              <input
                type="checkbox"
                value="Fill-In-The-Blank"
                onChange={(e) =>
                  setQuestionTypes((prev) =>
                    e.target.checked
                      ? [...prev, e.target.value]
                      : prev.filter((type) => type !== e.target.value)
                  )
                }
              />{" "}
              Fill-In-The-Blank
            </label>
            <label style={{ fontSize: "14px", color: "#333" }}>
              <input
                type="checkbox"
                value="ShortAnswer"
                onChange={(e) =>
                  setQuestionTypes((prev) =>
                    e.target.checked
                      ? [...prev, e.target.value]
                      : prev.filter((type) => type !== e.target.value)
                  )
                }
              />{" "}
              Short Answer
            </label>
          </div>
        </fieldset>
        <label
          style={{
            fontSize: "16px",
            color: "#4b4b4b",
            marginBottom: "1rem",
            marginTop: "0.5rem",
            display: "block",
            fontWeight: "bold",
          }}
        >
          Total Mark:
          <input
            type="number"
            min={10}
            max={100}
            required
            value={totalMark}
            onChange={(e) => setMark(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.5rem",
              padding: "0.75rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          ></input>
        </label>
   */}
   <fieldset
  style={{
    marginTop: "1.5rem",
    padding: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
  }}
>
  <legend
    style={{
      fontSize: "16px",
      color: "#4b4b4b",
      fontWeight: "bold",
      padding: "0 0.5rem",
    }}
  >
    Question Types
  </legend>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    }}
  >
    <label style={{ fontSize: "14px", color: "#333" }}>
      MCQ:
      <input
        type="number"
        min={0}
        value={questionCounts.MCQ || 0}
        onChange={(e) =>
          setQuestionCounts((prev) => ({
            ...prev,
            MCQ: Number(e.target.value),
          }))
        }
        style={{
          display: "block",
          width: "100%",
          marginTop: "0.5rem",
          padding: "0.5rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
    </label>
    <label style={{ fontSize: "14px", color: "#333" }}>
      Essay:
      <input
        type="number"
        min={0}
        value={questionCounts.Essay || 0}
        onChange={(e) =>
          setQuestionCounts((prev) => ({
            ...prev,
            Essay: Number(e.target.value),
          }))
        }
        style={{
          display: "block",
          width: "100%",
          marginTop: "0.5rem",
          padding: "0.5rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
    </label>
    <label style={{ fontSize: "14px", color: "#333" }}>
      True/False:
      <input
        type="number"
        min={0}
        value={questionCounts.TrueFalse || 0}
        onChange={(e) =>
          setQuestionCounts((prev) => ({
            ...prev,
            TrueFalse: Number(e.target.value),
          }))
        }
        style={{
          display: "block",
          width: "100%",
          marginTop: "0.5rem",
          padding: "0.5rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
    </label>
    <label style={{ fontSize: "14px", color: "#333" }}>
      Fill-In-The-Blank:
      <input
        type="number"
        min={0}
        value={questionCounts.FillInTheBlank || 0}
        onChange={(e) =>
          setQuestionCounts((prev) => ({
            ...prev,
            FillInTheBlank: Number(e.target.value),
          }))
        }
        style={{
          display: "block",
          width: "100%",
          marginTop: "0.5rem",
          padding: "0.5rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
    </label>
    <label style={{ fontSize: "14px", color: "#333" }}>
      Short Answer:
      <input
        type="number"
        min={0}
        value={questionCounts.ShortAnswer || 0}
        onChange={(e) =>
          setQuestionCounts((prev) => ({
            ...prev,
            ShortAnswer: Number(e.target.value),
          }))
        }
        style={{
          display: "block",
          width: "100%",
          marginTop: "0.5rem",
          padding: "0.5rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
    </label>
  </div>
</fieldset>

<label
          style={{
            fontSize: "16px",
            color: "#4b4b4b",
            marginBottom: "1rem",
            marginTop: "0.5rem",
            display: "block",
            fontWeight: "bold",
          }}
        >
          Total Mark:
          <input
            type="number"
            min={10}
            max={100}
            required
            value={totalMark}
            onChange={(e) => setMark(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.5rem",
              padding: "0.75rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          ></input>
        </label>

  </>
)
}

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
            "Generate Exam"
          )}
        </button>
      </form>

      {/* Non-editable Textarea for Response */}
      <div
        style={{
          marginTop: "2rem",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <label
          style={{
            fontSize: "16px",
            color: "#4b4b4b",
            fontWeight: "bold",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Generated Exam:
        </label>
        <textarea
          value={responseResult}
          readOnly
          style={{
            width: "100%",
            height: "800px",
            padding: "1rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "14px",
            resize: "none",
          }}
        />
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

export default ExamForm;
