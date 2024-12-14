import React, { useState, useEffect } from "react";
import invokeApig from "../lib/callAPI.ts";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getCurrentUserEmail } from "../lib/getToken.ts";


interface Part {
  part: string; // Part number or identifier
  title: string; // Title of the part
  total_marks: number; // Total marks for this part
  subsections: Subsection[]; // Array of subsections
}

interface Subsection {
  subsection: string; // Subsection identifier
  title: string; // Subsection title
  marks: number; // Marks for the subsection
  content: {
    passage?: string; // Optional passage
    questions?: Question[]; // Optional questions array
  };
}

interface Question {
  question: string; // Question text
  options?: string[]; // Optional multiple-choice options
}

interface ExamContent {
  parts: Part[]; // Add this to reflect the structure of the data
  [key: string]: any; // Allow flexibility for other properties
}


//storing user input
const ExamForm: React.FC = () => {
  //store the input
  const [_grade, setGrade] = useState("");
  const [_subject, setSubject] = useState("");
  const [_duration, setDuration] = useState("");
  const [_totalMark, setMark] = useState("");
  const [_semester, setSemester] = useState("");
  const [createdBy, setCreator] = useState("");
  const [creationDate, setDate] = useState("");
  const [contributers, setContributers] = useState("");
  const [examState, setExamState] = useState("");
  const [_responseResult,_setResponseResult] = useState<string>(""); // State to store the API response
  //const [examContent, setExamContent] = useState<any>(null); // Store exam content as JSON
  const [examContent, setExamContent] = useState<ExamContent | null>(null);
  const [_editMode,_setEditMode] = useState(false); // Toggle edit mode
  const [_editedContent,_setEditedContent] = useState<Record<string, any>>({});
  
 


  // State for feedback and UI
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const [_loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [_isLoading, _setIsLoading] = useState(false);
  const [loadingApproval, setLoadingApproval] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [feedback, setFeedback] = useState<{ [section: string]: string }>({});
  const [isEditing, setIsEditing] = useState(false);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  


  // Fetch Initial Data
const fetchInitialData = async () => {
  try {
    //@ts-ignore
    const response = await invokeApig({
      path: `/examForm/${id}`, // Adjust path as needed
      method: "GET",
    });

    if (!response || Object.keys(response).length === 0) {
      console.error("Response is empty or undefined:", response);
      setErrorMsg("Error fetching exam data. Please try again.");
      return;
    }

    console.log("Initial Data Loaded:", response);

    const content = response.examContent;

    // Parse examContent if it's a string
    if (typeof content === "string") {
      try {
        const parsedContent = JSON.parse(content);
        setExamContent(parsedContent);
      } catch (parseError) {
        console.error("Failed to parse exam content as JSON:", content);
        setErrorMsg("Invalid exam data format.");
        return;
      }
    } else if (typeof content === "object") {
      setExamContent(content); // Set directly if already an object
    } else {
      console.error("Unexpected examContent format:", typeof content);
      setErrorMsg("Exam data format is invalid!");
      return;
    }

    // Set metadata fields
    setGrade(response.examClass || "");
    setSubject(response.examSubject || "");
    setSemester(response.examSemester || "");
    setCreator(response.createdBy || "");
    setDate(response.creationDate || "");
    setContributers(String(response.contributers || ""));
    setDuration(response.examDuration || "");
    setMark(response.examMark || "");
    setExamState(response.examState || "");

    // Redirect if exam is not in "building" state
    if (response.examState !== "building") {
      navigate(`/dashboard/viewExam/${id}`);
    }
  } catch (err: any) {
    console.error("Error fetching initial data:", err);
    setErrorMsg("Failed to load exam data. Please try again later.");
  } finally {
    setLoadingPage(false); // Mark loading as complete
  }
};


const fetchExamContent = async () => {
  try {
    //@ts-ignore
    const response = await invokeApig({
      path: `/examForm/${id}`,
      method: "GET",
    });

    console.log("Raw Exam Content from Backend:", response.examContent);

    if (!response.examContent) {
      setErrorMsg("Exam content is missing from the response.");
      return;
    }

    let parsedContent;
    try {
      // Extract the JSON portion from the descriptive text
      const jsonStartIndex = response.examContent.indexOf("{");
      const jsonEndIndex = response.examContent.lastIndexOf("}");
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        const jsonString = response.examContent.substring(jsonStartIndex, jsonEndIndex + 1).trim();
        console.log("Extracted JSON String:", jsonString);
        parsedContent = JSON.parse(jsonString); // Parse the JSON object
      } else {
        throw new Error("No valid JSON found in examContent string.");
      }
    } catch (error) {
      console.error("Failed to parse exam content as JSON:", response.examContent);
      setErrorMsg("Invalid exam content format!");
      return;
    }

    setExamContent(parsedContent);
    console.log("Parsed Exam Content Successfully Set in State:", parsedContent);
  } catch (error) {
    console.error("Error fetching exam content:", error);
    setErrorMsg("Failed to load exam content. Please try again later.");
  }
};


  useEffect(() => {
    const loadExamContent = async () => {
      try {
        await fetchExamContent(); // Fetch and parse content
      } catch (err) {
        console.error("Error loading exam content:", err);
        setErrorMsg("Failed to load exam content. Please try again later.");
      }
    };
    loadExamContent();
  }, [id]);
  
 
  useEffect(() => {
    let isCancelled = false;
  
    const timer = setTimeout(async () => {
      try {
        if (!isCancelled) {
          await fetchInitialData();
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        if (!isCancelled) {
          setErrorMsg("Failed to fetch initial data. Please try again later.");
        }
      }
    }, 2000); // 2-second delay
  
    
    return () => {
      clearTimeout(timer);
      isCancelled = true;
    };
  }, [id]);



  const sendForApproval = async () => {
    setLoadingApproval(true);
    const payload = {
      examID: id,
    };

    try {
      const response = await invokeApig({
        path: "/sendForApproval",
        method: "POST",
        body: payload,
      });

      console.log(response);
      navigate("/dashboard/viewExam/" + id);
    } catch (error) {
      console.error("Error sending exam:", error);
    } finally {
      setLoadingApproval(false);
    }
  };

  const handleFeedbackSubmission = async (sectionIndex: number) => {
    setLoadingStates((prev) => ({
      ...prev,
      [`section-${sectionIndex}`]: true, // Set loading state for the clicked section
    }));
  
    // Prepare the feedback payload, including only non-empty feedback
    const feedbackPayload = Object.entries(feedback)
      .filter(([_, feedbackText]) => feedbackText.trim()) // Only include sections with feedback
      .map(([section, feedbackText]) => ({
        section,
        feedback: feedbackText.trim(),
      }));
  
    if (feedbackPayload.length === 0) {
      alert("No feedback to submit. Please provide feedback in at least one section.");
      setLoadingStates((prev) => ({
        ...prev,
        [`section-${sectionIndex}`]: false, // Reset loading state for the specific section
      }));      
      return;
    }
  
    const requestBody = {
      examID: id!, // Exam ID
      feedback: feedbackPayload, // Include all provided feedback
      contributors: await getCurrentUserEmail(), // Current user as contributor
    };
  
    console.log("Submitting Feedback Request:", requestBody);
  
    try {
     setLoading(true);// Start loading animation
      // const response = await invokeApig({
      //   path: "/createNewExam", // Update API endpoint
      //   method: "POST",
      //   body: requestBody,
      // });

      const functionURL = import.meta.env.VITE_CREATE_EXAM_FUNCTION_URL;
      console.log("Function URL:", functionURL);

      const response = await fetch(functionURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
  
      console.log("API Response:", response);

      const data = await response.json();
  
      // Check if the backend returns the updated content
      if (data.updatedExamContent) {
        setExamContent(data.updatedExamContent); // Update the entire exam content
      }
  
      if (data.totalMarks) {
        setMark(data.totalMarks); // Update the total marks
      }
  
      // Provide feedback to the user
      if (data.updatedExamContent || data.totalMarks) {
        alert("Changes submitted successfully, and exam content updated!");
         // Refresh the page after the success message
        window.location.reload();
      } else {
        alert("Changes submitted successfully, but no updates were received.");
      }
  
      // Clear the feedback fields after submission
      setFeedback({});

      setLoadingStates((prev) => ({
        ...prev,
        [`section-${sectionIndex}`]: false, // Reset loading state
      }));
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setErrorMsg("Failed to submit feedback. Please try again later.");
    } finally {
      setLoading(false); // Stop loading animation
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
        Generate Exam
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
        {examState === "building" && (
          <button
            onClick={sendForApproval}
            style={{
              padding: "0.5rem 1rem", // Smaller padding for a smaller button
              backgroundColor: "#2196F3", // Blue color for 'Send For Approval'
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px", // Smaller font size
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background-color 0.3s ease, transform 0.3s ease",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              width: "auto", // Auto width to fit text
            }}
          >
            {loadingApproval ? "Sending..." : "Send For Approval"}
          </button>
        )}
  
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            backgroundColor: isEditing ? "#FF5722" : "#007BFF",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {isEditing ? "Cancel Edit" : "Edit"}
        </button>
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

{/* Render Exam Parts */}
{ examContent?.parts?.map((part: any, partIndex: number) => (
  <div key={`part-${partIndex}`} style={{ marginTop: "1rem" }}>
    <h3 style={{ fontWeight: "bold" }}>
      Part {part.part}: {part.title}
    </h3>
    <p>
      <strong>Total Marks:</strong> {part.total_marks}
    </p>

    {/* Render Subsections */}
    { part.subsections?.map((subsection: any, subIndex: number) => (
      <div key={`subsection-${partIndex}-${subIndex}`} style={{ marginTop: "1rem" }}>
        <h4>
          Subsection {subsection.subsection}: {subsection.title}
        </h4>
        <p>Marks: {subsection.marks}</p>

        {/* Render Questions */}
        {subsection.content?.questions?.length ? (
          subsection.content.questions.map((question: any, qIndex: number) => (
            <div key={`question-${partIndex}-${subIndex}-${qIndex}`} style={{ marginTop: "0.5rem" }}>
              <p>
                <strong>{qIndex + 1}.</strong> {question.question}
              </p>
              {question.options?.map((option: string, oIndex: number) => (
                <p key={`option-${partIndex}-${subIndex}-${qIndex}-${oIndex}`}>
                  {String.fromCharCode(65 + oIndex)}. {option}
                </p>
              ))}
            </div>
          ))
        ) : (
          <p>No questions available.</p>
        )}

        {/* Feedback Input Box for Subsection */}
        {isEditing && (
          <textarea
            placeholder={`Provide feedback for ${subsection.title}`}
            value={feedback[`${part.part}-${subIndex}`] || ""}
            onChange={(e) =>
              setFeedback((prev) => ({
                ...prev,
                [`${part.part}-${subIndex}`]: e.target.value,
              }))
            }
            style={{
              width: "100%",
              minHeight: "60px",
              marginTop: "10px",
              marginBottom: "10px",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        )}

      </div>
    ))}

    {/* Feedback Input Box for Entire Part */}
    {isEditing && (
      <textarea
        placeholder={`Provide feedback for Part ${part.part}`}
        value={feedback[`part-${partIndex}`] || ""}
        onChange={(e) =>
          setFeedback((prev) => ({
            ...prev,
            [`part-${partIndex}`]: e.target.value,
          }))
        }
        style={{
          width: "100%",
          minHeight: "60px",
          marginTop: "10px",
          marginBottom: "10px",
          padding: "10px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
    )}


  </div>
))}



{/* Render Exam Sections */}

<div
  style={{
    width: "900px",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  }}
>
  {/* Title and Overview */}
  <p>
    <strong>{examContent?.title}</strong> 
  </p>
  <p>
    <strong>Total Marks:</strong> {examContent?.total_marks}
  </p>
  <p>
    <strong>Time:</strong> {examContent?.time}
  </p>
  
   {/* Render Sections */}
  {examContent?.sections?.map((section: any, sectionIndex: number) =>  (
    <div
      key={`section-${sectionIndex}`}
      style={{
        marginTop: "1rem",
        padding: "1rem",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Section Title */}
      <h3 style={{ fontWeight: "bold", marginBottom: "1rem" }}>
        Part {section.part}: {section.title} (Total Marks: {section.total_marks})
      </h3>

      {/* Feedback Text Area for Section */}
      {isEditing && (
        <textarea
          placeholder={`Provide feedback for Part ${section.part}: ${section.title}`}
          value={feedback[`section-${sectionIndex}`] || ""}
          onChange={(e) =>
            setFeedback((prev) => ({
              ...prev,
              [`section-${sectionIndex}`]: e.target.value,
            }))
          }
          style={{
            width: "100%",
            minHeight: "60px",
            marginTop: "10px",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            backgroundColor: "#ffffff",
          }}
        />
      )}

      
{/* Feedback Submission Button  */}
{isEditing && (
  <button
    onClick={() => handleFeedbackSubmission(sectionIndex)} // Pass sectionIndex
    style={{
      marginTop: "10px",
      backgroundColor: loadingStates[`section-${sectionIndex}`] ? "#6c757d" : "#28a745",
      color: "#fff",
      border: "none",
      padding: "5px 10px",
      borderRadius: "4px",
      fontSize: "12px",
      cursor: loadingStates[`section-${sectionIndex}`] ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.4rem",
      width: "120px",
      height: "30px",
    }}
    disabled={loadingStates[`section-${sectionIndex}`]} // Disable button when loading
  >
    {loadingStates[`section-${sectionIndex}`] ? (
      <>
        <span
          style={{
            width: "0.8rem",
            height: "0.8rem",
            border: "2px solid #fff",
            borderRadius: "50%",
            borderTop: "2px solid transparent",
            animation: "spin 1s linear infinite",
          }}
        ></span>
        <span style={{ fontSize: "10px" }}>Submitting...</span>
      </>
    ) : (
      <span style={{ fontSize: "10px" }}>Submit Changes</span>
    )}
  </button>
)}


      

       {/* Render Subsections */}

      {/* Subsections (Optional) */}
      {section.subsections?.map((subsection: any, subIndex: number) => (
        <div
          key={`subsection-${sectionIndex}-${subIndex}`}
          style={{
            marginTop: "1rem",
            padding: "1rem",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h4 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
          {subsection.subsection}: {subsection.title} ({subsection.marks} Marks)
          </h4>

          {/* Content */}
           {/* Content: Passage or Dialogue "listening"*/}
          {subsection.content?.passage && (
            <p style={{ fontStyle: "italic", marginBottom: "1rem" }}>
              {subsection.content.passage}
            </p>
          )}
          {subsection.content?.dialogue && (
            <pre
              style={{
                fontStyle: "italic",
                marginBottom: "1rem",
                whiteSpace: "pre-wrap",
                backgroundColor: "#f8f8f8",
                padding: "10px",
                borderRadius: "4px",
              }}
            >
              {subsection.content.dialogue}
            </pre>
          )}

       {/* Questions */}
       {subsection.content?.questions && Array.isArray(subsection.content.questions) && (
            <div style={{ marginBottom: "20px" }}>
              <h4>Questions:</h4>
              <ul>
                {subsection.content.questions.map((question: any, questionIndex: number) => (
                  <li key={`question-${sectionIndex}-${subIndex}-${questionIndex}`}>
                    <p>
                      <strong>Q{questionIndex + 1}:</strong> {question.question || question.sentence}
                    </p>
                    {/* Options for Multiple-Choice Questions */}
                    {question.options && (
                      <ul style={{ listStyleType: "disc", marginLeft: "20px" }}>
                        {question.options.map((option: string, optionIndex: number) => (
                          <li key={`option-${questionIndex}-${optionIndex}`}>
                            {String.fromCharCode(65 + optionIndex)}. {option}
                          </li>
                        ))}
                      </ul>
                    )}
                    {/* Answer */}
                    {question.answer && <p><strong>Answer:</strong> {question.answer}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* True/False Questions */}
{subsection.content?.questions?.["true-false"] && (
  <div style={{ marginBottom: "20px" }}>
    <h4>True/False Questions:</h4>
    {subsection.content.questions["true-false"].map((question: any, questionIndex: number) => (
      <p key={`true-false-${questionIndex}`} style={{ marginTop: "10px", marginBottom: "10px" }}>
        {question.statement}________ (<span style={{ fontWeight: "bold" }}>answer: {question.answer}</span>)
      </p>
    ))}
  </div>
)}



          {/* Vocabulary Matching */}
{subsection.content?.questions?.["vocabulary-matching"] && (
  <div style={{ marginBottom: "20px" }}>
    <h4>Vocabulary Matching:</h4>
    <p style={{ fontWeight: "bold", marginBottom: "10px" }}>Words:</p>
    <ul style={{ marginLeft: "20px" }}>
      {subsection.content.questions["vocabulary-matching"].map(
        (question: any, questionIndex: number) => (
          <li key={`word-${questionIndex}`} style={{ listStyleType: "circle" }}>
            {question.word}
          </li>
        )
      )}
    </ul>
    {subsection.content.questions["vocabulary-matching"].map(
      (question: any, questionIndex: number) => (
        <p key={`definition-${questionIndex}`} style={{ marginTop: "10px" }}>
          {question.definition}: <span style={{ fontWeight: "bold" }}>________</span>
          <br />
          <strong>Answer:</strong> {question.word}
        </p>
      )
    )}
  </div>
)}

           {/* Exercises (Specific to "Use of English") */}
           {subsection.content?.exercises && (
            <div style={{ marginBottom: "20px" }}>
              <h4>Exercises:</h4>
              <ul>
                {subsection.content.exercises.map((exercise: any, exerciseIndex: number) => (
                  <li key={`exercise-${sectionIndex}-${subIndex}-${exerciseIndex}`} style={{ marginBottom: "10px" }}>
                    <p>
                      <strong>Type:</strong> {exercise.type}
                    </p>
                    <p>
                      <strong>{exercise.question}</strong> 
                    </p>
                    <p>
                      <strong>Answer:</strong> {exercise.answer}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

         




          {/* Feedback Text Area for Subsection */}
          {isEditing && (
            <textarea
              placeholder={`Provide feedback for Subsection ${subsection.subsection}: ${subsection.title}`}
              value={feedback[`section-${sectionIndex}-subsection-${subIndex}`] || ""}
              onChange={(e) =>
                setFeedback((prev) => ({
                  ...prev,
                  [`section-${sectionIndex}-subsection-${subIndex}`]: e.target.value,
                }))
              }
              style={{
                width: "100%",
                minHeight: "60px",
                marginTop: "10px",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "#ffffff",
              }}
            />
          )}

             
{/* Feedback Submission Button  */}
{isEditing && (
  <button
    onClick={() => handleFeedbackSubmission(sectionIndex)} // Pass sectionIndex
    style={{
      marginTop: "10px",
      backgroundColor: loadingStates[`section-${sectionIndex}`] ? "#6c757d" : "#28a745",
      color: "#fff",
      border: "none",
      padding: "5px 10px",
      borderRadius: "4px",
      fontSize: "12px",
      cursor: loadingStates[`section-${sectionIndex}`] ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.4rem",
      width: "120px",
      height: "30px",
    }}
    disabled={loadingStates[`section-${sectionIndex}`]} // Disable button when loading
  >
    {loadingStates[`section-${sectionIndex}`] ? (
      <>
        <span
          style={{
            width: "0.8rem",
            height: "0.8rem",
            border: "2px solid #fff",
            borderRadius: "50%",
            borderTop: "2px solid transparent",
            animation: "spin 1s linear infinite",
          }}
        ></span>
        <span style={{ fontSize: "10px" }}>Submitting...</span>
      </>
    ) : (
      <span style={{ fontSize: "10px" }}>Submit Changes</span>
    )}
  </button>
)}


      
        </div>
      ))}


    </div>
  ))}
         {/* Writing Section */}
{ examContent?.sections?.some((section: any) => section.part === "3") ? (
    examContent.sections.map((section: any, sectionIndex: number) => {
      if (section.part === "3") {
        return (
          <div key={`writing-${sectionIndex}`} style={{ marginTop: "20px" }}>
            <h2>Part {section.part}: Writing (Total Marks: {section.total_marks})</h2>
            {section.content?.questions?.map((question: any, questionIndex: number) => (
              <div key={`writing-question-${questionIndex}`} style={{ marginLeft: "20px" }}>
                <p>
                  <strong>{question.type}:</strong> {question.prompt}
                </p>
                <p>
                  <strong>Word Limit:</strong> {question.word_limit}
                </p>
              </div>
            ))}
          </div>
        );
      }
      return null;
    })
  ) : (
    <p></p>
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

export default ExamForm;