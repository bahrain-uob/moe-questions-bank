
import React, { useState, useEffect } from "react";
import invokeApig from "../lib/callAPI.ts";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../lib/contextLib.ts";
import { generateExamPDF } from "./generatePDF"; // Make sure to import the function
import { useAlert } from "./AlertComponent";
import { generateModelPDF } from "./generateModelAnswerPDF.tsx";
//import { getCurrentUserEmail } from "../lib/getToken.ts";



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
  [key: string]: any; 
  audioUrls?: string[];
}

const ViewExam: React.FC = () => {
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("");
  const [totalMark, setMark] = useState(""); // Dynamically updated Total Marks
  const [semester, setSemester] = useState("");
  const [createdBy, setCreator] = useState("");
  const [creationDate, setDate] = useState("");
  const [contributers, setContributers] = useState("");
  const [examState, setExamState] = useState("");
  const [approverMsg, setApproverMsg] = useState("");
  const [_responseResult, _setResponseResult] = useState<string>("");
  const [loadingPage, setLoadingPage] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingChangeState, setLoadingChangeState] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [LoadingDisapprove, setLoadingDisapprove] = useState(false);
  const [examContent, setExamContent] = useState<ExamContent | null>(null);
  //const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [_editMode, _setEditMode] = useState(false); // Toggle edit mode
  const [_editedContent, _setEditedContent] = useState<Record<string, any>>({});
  const [isEditing, _setIsEditing] = useState(false);
  const [_loading, _setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, string>>({}); // Store feedback
  const { id } = useParams<{ id: string }>();
  const { userRole } = useAppContext();
  const navigate = useNavigate();
  const { showAlert } = useAlert(); // to show alerts
  var content: string;

  // !Examples to be used in the component (To be deleted later)
  // const handleSuccess = () => {
  //   showAlert({
  //     type: "success", // Alert type: "success", "failure", or "confirm"
  //     message: "This is a success message!",
  //   });
  // };

  // const handleFailure = () => {
  //   showAlert({
  //     type: "failure", // Alert type: "failure"
  //     message: "Oops, something went wrong!",
  //   });
  // };

  // const handleConfirm = () => {
  //   showAlert({
  //     type: "confirm", // Alert type: "confirm"
  //     message: "Are you sure?",
  //     action: () => {
  //       alert("Action confirmed!");
  //     },
  //   });
  // };
  // In your frontend code



  // Fetch initial data
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

      if (response.examState === "building") {
        navigate("/dashboard/examForm/" + id);
      }

      content = response.examContent;

      console.log(content)

      
    // Parse examContent if it's a string
      if (typeof content === "string") {
      console.log("is string")
      try {
        const parsedContent = JSON.parse(content);
        setExamContent(parsedContent);


        
       // Assign the fetched audio URLs to respective subsections

       console.log("Audio URLs:", response.audioUrls);
       
       const audioUrls = response.audioUrls || [];
       if (parsedContent?.sections?.[0]?.subsections) {
         const subsections = parsedContent.sections[0].subsections;
   
         if (subsections[0]) {
           subsections[0].content.audio = audioUrls[0]; // Passage audio for Listening One
         }
         if (subsections[1]) {
           subsections[1].content.audio = audioUrls[1]; // Dialogue audio for Listening Two
         }
       }
      } catch (parseError) {
        console.error("Failed to parse exam content as JSON:", content);
        setErrorMsg("Invalid exam data format.");
        return;
      }
      } else if (typeof content === "object") {
        console.log("is object")
      setExamContent(content); // Set directly if already an object
    } else {
      console.error("Unexpected examContent format:", typeof content);
      setErrorMsg("Exam data format is invalid!");
      return;
    }

    

      setGrade(response.examClass || "");
    setSubject(response.examSubject || "");
    setSemester(response.examSemester || "");
    setCreator(response.createdBy || "");
    setDate(response.creationDate || "");
    setContributers(String(response.contributers || ""));
    setDuration(response.examDuration || "");
    setMark(response.examMark || "");
    setExamState(response.examState || "");


    

    } catch (err: any) {
      console.error("Error fetching initial data:", err);
      setErrorMsg("Failed to load exam data. Please try again later.");
    } finally {
      setLoadingPage(false); // Mark loading as complete
    }
  };

  useEffect(() => {
    if (examContent) {
      const newTotalMarks = examContent.total_marks || examContent.parts?.reduce((sum: number, part: any) => sum + part.total_marks, 0) || 0;
      setMark(newTotalMarks); // Update the Total Marks at the top
    }
  }, [examContent]);


  const fetchExamContent = async () => {
    try {
      //@ts-ignore
      const response = await invokeApig({
        path: `/examForm/${id}`,
        method: "GET",
      });
      //here
      
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

       // Assign the fetched audio URLs to respective subsections

       console.log("Audio URLs:", response.audioUrls);

    const audioUrls = response.audioUrls || [];
    if (parsedContent?.sections?.[0]?.subsections) {
      const subsections = parsedContent.sections[0].subsections;

      if (subsections[0]) {
        subsections[0].content.audio = audioUrls[0]; // Passage audio for Listening One
      }
      if (subsections[1]) {
        subsections[1].content.audio = audioUrls[1]; // Dialogue audio for Listening Two
      }
    }


  
      setExamContent(parsedContent);
      console.log("Parsed Exam Content Successfully Set in State:", parsedContent);
    } catch (error) {
      console.error("Error fetching exam content:", error);
      setErrorMsg("Failed to load exam content. Please try again later.");
    }
  };


  const handleGenerateAudio = async (examID: string) => {
    _setLoading(true);
    
  
    try {
      const payload = {
        examID: examID,
        bucketName: "qbtesttest" //import.meta.env.VITE_AUDIO_BUCKET_NAME,  // Ensure this is correctly set
      };
  
      console.log("Sending Payload:", payload); // Log the payload to check if both values are present
  
      const functionURL = import.meta.env.VITE_GENERATE_AUDIO_URL;
      console.log("Function URL:", functionURL);
  
      const response = await fetch(functionURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      let data = await response.json();
      console.log("API Response:", data);

      if (data.audioUrls) {
        // window.location.reload(); 
        //await fetchExamContent(); // Fetch updated exam content with new audio URLs
      }

  //   if (data="Audio generated successfully") {
  //     //setAudioGenerated(true); // Mark audio as generated
  //   _setLoading(false);
  //   alert("Audio is Available!");
  //  // Refresh the page after the success message
  // window.location.reload();  }


    } catch (error) {
      console.error("Error generating audio:", error);
      setErrorMsg("An error occurred while generating audio.");
      _setLoading(false);
    }
  };
  
 
  useEffect(() => {
    if (id) {
      console.log("Exam ID:", id);
  
      // Check if audio is already available
      if (!examContent?.audioUrls || examContent.audioUrls.length === 0) {
        console.log("Audio not available, generating audio...");
        handleGenerateAudio(id);
      } else {
        console.log("Audio already available:", examContent.audioUrls);
      }
    } else {
      console.error("Exam ID is missing or undefined!");
    }
  }, [id, examContent]);
  

  // useEffect(() => {
  //   if (id ) {
  //     console.log("Exam ID:", id);
  //     handleGenerateAudio(id);
  //   } else {
  //     console.error("Exam ID is missing or undefined!");
  //   }
  // }, [id]);
  
  

  useEffect(() => {
    const loadExamContent = async () => {
      try {
        await fetchExamContent(); // Fetch and parse content



          
      // // After the exam content is loaded, trigger the Lambda to generate audio
      // if (examContent) {
      //   const payload = {
      //     examID: id,  // Pass the examID to the Lambda for processing
      //   };
      //   // Trigger the Lambda function via API Gateway to convert content to audio
      //   const response = await invokeApig({
      //     path: "/convertToAudio",  // The API endpoint in your API Gateway
      //     method: "POST",           // The HTTP method for the request
      //     body: JSON.stringify(payload), // Pass the examID as payload
      //   });
      //   console.log("Audio conversion response:", response);

      //   if (response.statusCode === 200) {
      //     // Successfully triggered the audio conversion
      //     console.log("Audio generated successfully");
      //   } else {
      //     console.error("Failed to trigger audio generation:", response.body);
      //   }
      // }



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
  
    // Cleanup function to handle component unmount
    return () => {
      clearTimeout(timer);
      isCancelled = true;
    };
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
    setLoadingApprove(true);

    if (!approverMsg) {
      alert("Please add feedback!");
      setLoadingChangeState(false);
      setLoadingApprove(false);
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
      setLoadingApprove(false);
    }
  };

  const disapproveExam = async () => {
    setLoadingChangeState(true);
    setLoadingDisapprove(true);
    if (!approverMsg) {
      alert("Please add feedback!");
      setLoadingChangeState(false);
      setLoadingDisapprove(false);
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
      setLoadingDisapprove(false);
    }
  };




  // const renderExamParts = (part: any, partKey: string) => {
  //   //const partFeedback = feedback[partKey] || ""; // Feedback for this part
  
  //   return (
  //     <div key={partKey} style={{ marginBottom: "30px" }}>
  //       <h2>
  //         Part {part.part}: {part.title}
  //       </h2>
  //       <p>Total Marks: {part.total_marks}</p>
  
  //       {part.subsections?.map((subsection: any, subKey: number) => (
  //         <div key={`${partKey}-${subKey}`} style={{ marginBottom: "15px" }}>
  //           <h3>
  //             Subsection {subsection.subsection}: {subsection.title}
  //           </h3>
  //           <p>Marks: {subsection.marks}</p>
  
  //           {/* Render content */}
  //           {subsection.content && (
  //             <div>
  //               {subsection.content.passage && (
  //                 <p>
  //                   <strong>Passage:</strong> {subsection.content.passage}
  //                 </p>
  //               )}
  //               {subsection.content.dialogue && (
  //                 <p>
  //                   <strong>Dialogue:</strong> {subsection.content.dialogue}
  //                 </p>
  //               )}
  //               {subsection.content.questions && (
  //                 <ul>
  //                   {subsection.content.questions.map(
  //                     (question: any, qIndex: number) => (
  //                       <li key={qIndex}>
  //                         {question.type}: {question.question}
  //                       </li>
  //                     )
  //                   )}
  //                 </ul>
  //               )}
  //             </div>
  //           )}
  //         </div>
  //       ))}
  
  //     </div>
  //   );
  // };

  // Show loading state
  if (loadingPage) {
    return <div>Loading...</div>;
  }

  if (errorMsg) {
    return <div>{errorMsg}</div>;
  }

  // For handling download (when clicking button)
  const handleDownloadPDF = async () => {
    showAlert({
      type: "confirm",
      message: "Are you sure you want to download the Exam as PDF?",
      action: () => {
        console.log(examContent);
        generateExamPDF(examContent);
        generateModelPDF(examContent);
      },
    });
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
        
        {/* <button
  onClick={(e) => {
    e.preventDefault();
    console.log("Exam ID:", id);
    if (id) {
      handleGenerateAudio(id);
    } else {
      console.error("Exam ID is missing or undefined!");
    }
  }}
  disabled={loadingChangeState}
  style={{
    padding: "0.6rem 1rem",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease, transform 0.3s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  }}
>
  Generate Audio
</button> */}



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
      <p style={{ fontStyle: "italic", marginBottom: "1rem" }}>
        {subsection.content.dialogue}
      </p>
    )}

          {/* {subsection.content?.dialogue && (
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
          )} */}

           {/* Audio Player */}
    {subsection.content?.audio && (
      <div style={{ marginTop: "1rem" }}>
        <audio controls style={{ width: "100%" }}>
          <source
            src={subsection.content.audio}
            type="audio/mpeg"
          />
          Your browser does not support the audio element.
        </audio>
      </div>
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
                  disabled={loadingChangeState}
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
                  {loadingApprove ? (
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
                  disabled={loadingChangeState}
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
                  {LoadingDisapprove ? (
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

          {/* download PDF start here */}
          <div>
            {/* Conditionally render the "Download PDF" button if the exam is approved */}
            {examState === "approved" && (
              <button
                onClick={handleDownloadPDF} // This triggers the PDF download function
                style={{
                  padding: "0.6rem 1rem",
                  backgroundColor: "#007bff", // Blue color for the download button
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease, transform 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                }}
                onMouseOver={(
                  e //@ts-ignore (color change on hover)
                ) => (e.target.style.backgroundColor = "#0056b3")}
                onMouseOut={(
                  e //@ts-ignore (reset to original color on mouse out)
                ) => (e.target.style.backgroundColor = "#007bff")}
                onMouseDown={(
                  e //@ts-ignore (scale button on mouse down)
                ) => (e.target.style.transform = "scale(0.98)")}
                //@ts-ignore
                onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
              >
                Download as PDF
              </button>
            )}
          </div>
          {/* END OF DOWNLOAD PDF */}
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