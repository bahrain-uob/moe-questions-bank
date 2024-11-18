import React, { useState } from "react";


//storing user input
const ExamForm: React.FC = () => {

  //store the input
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionTypes, setQuestionTypes] = useState<string[]>([]);

  //async = can use await (dor time consuming tasks)
  //the fun. takes argument (e) ,React.FormEvent means a form-event(submit the form) 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();//prevents the page from refreshing when submit the form cuse When you submit a form in React, the browser automatically reloads the page unless you stop it
    
    //sending those data to lambda to take it to sagemaker...
    const payload = {
      grade,
      subject,
      difficulty,
      questionTypes,
    };

    console.log("Submitting exam data to SageMaker:", payload);
     
    try {
      
      const response = await fetch("<LambdaEndpoint>", { //send the form data to a server="lambda" and wait for lambda to respond
        method: "POST",
        headers: { //tells the server the format of the data
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      ////once the lambda process the data it will send it theexan questions back
      const data = await response.json();
      console.log("Exam questions received from SageMaker:", data);
      alert("Exam generated successfully!");
    } catch (error) {
      console.error("Error generating exam:", error);
      alert("Failed to generate exam. Please try again.");
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
            <option value="">Select Grade</option>
            <option value="Grade 1">Secondary Grade 1</option>
            <option value="Grade 2">Secondary Grade 2</option>
            <option value="Grade 3">Secondary Grade 3</option>
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
            <option value="">Select Subject</option>
            <option value="Math">ENG 101</option>
            <option value="Science">ENG 102</option>
            <option value="English">ENG 102</option>
            <option value="English">ENG 201</option>
            <option value="English">ENG 301</option>
            <option value="English">ENG 218</option>
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
          Difficulty:
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
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
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </label>

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
              <input
                type="checkbox"
                value="MCQ"
                onChange={(e) =>
                  setQuestionTypes((prev) =>
                    e.target.checked
                      ? [...prev, e.target.value]
                      : prev.filter((type) => type !== e.target.value)//??
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

        <button
        type="submit"
        style={{
          display: "block",
          width: "100%",
          backgroundColor: "#4b4b4b",
          color: "#fff",
          padding: "1rem",
          marginTop: "2rem", // Ensures spacing between the form and the button
          border: "none",
          borderRadius: "4px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          position: "relative", // Makes sure it stays in place
          }}
        >
          Generate Exam
        </button>
      </form>
    </div>
  );
};

export default ExamForm;
