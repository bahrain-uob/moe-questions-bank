import React, { useState, useEffect } from "react";
import MOELogo from "../assets/moe_LOGO.png"; // Ministry of Education logo
import HomeIcon from "../assets/home icon (1).png"; // Home icon
import BackgroundImage from "../assets/BG.jpg"; // Background image
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../lib/contextLib";
import { NavLink, Outlet } from "react-router-dom";
import invokeApig from "../lib/callAPI.ts";

interface UserDashboardProps {}

const Dashboard: React.FC<UserDashboardProps> = () => {
  
  const navigate = useNavigate();
  const { userHasAuthenticated } = useAppContext();
  const { userRole } = useAppContext();
  const [activePage, setActivePage] = useState<string>(
    window.location.pathname
  );
  const [approved, setApproved] = useState(0);
  const [disapproved, setDisapproved] = useState(0);
  const [building, setBuilding] = useState(0);
  const [pending, setPending] = useState(0);
  const [gettingExams, setGettingExams] = useState(true);
  const [gettingExamsError, setGetExamsError] = useState("");
  const [exams, setExams] = useState([]);
  const [filterValue, setFilterValue] = useState(
    userRole === "User" ? "building" : "pending"
  );



  // Fetch initial data
    const fetchInitialData = async () => {
      try {
        //@ts-ignore
        const response = await invokeApig({
          path: `/getExamHistory`, 
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
  
        // Store the retrieved exams in the state
        setExams(response);
  
        console.log("Initial Data Loaded:", response);
      } catch (err: any) {
        console.error("Error fetching initial data:", err);
      } finally {
        setGettingExams(false); // Mark loading as complete
      }
    };

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
  
    useEffect(() => {
      // Add a timeout before fetching data
      const timer = setTimeout(() => {
        fetchInitialData();
      }, 2000);
  
      // Cleanup the timeout if the component unmounts
      return () => clearTimeout(timer);
    }, []);

  setTimeout(() => {
    setActivePage(window.location.pathname);
  }, 500);

  
  useEffect(() => {
    
    async function fetchExamCount() {
      try {
        // @ts-ignore
        const response = await invokeApig({
          path: `/getExamCount`,
          method: "GET",
          queryParams: {
            state: filterValue,
          },
        });

        setApproved(response ? response.approved : 0);
        setDisapproved(response ? response.disapproved : 0);
        setBuilding(response ? response.building : 0);
        setPending(response ? response.pending : 0);

      } catch (err) {

        setApproved(0);
        setDisapproved(0);
        setBuilding(0);
        setPending(0);

        console.error("Error fetching exam count:", err); 
      }
    }
   
      fetchExamCount();
  }, [filterValue]); // Dependency array ensures fetchExamCount is only called when `filterValue` changes

  async function handleSignOut() {
    await signOut();
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    userHasAuthenticated(false);
    navigate("/login");
  }

  return (
    <div
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        height: "100vh",
        width: "100vw",
        overflowY: "auto",
        margin: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          backgroundColor: "white",
        }}
      >
        <img
          src={MOELogo}
          alt="MOE Logo"
          style={{ height: "80px", marginRight: "1rem" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <NavLink to="/dashboard">
            <img
              src={HomeIcon}
              alt="Home Icon"
              style={{ height: "50px", cursor: "pointer" }}
              onClick={() => setActivePage("/dashboard")}
            />
          </NavLink>

          <NavLink
            to="/dashboard/feedback-form"
            onClick={() => setActivePage("feedback")}
            style={() => ({
              backgroundColor: "#d32f2f",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "16px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              textDecoration: "none",
              transition: "transform 0.3s, box-shadow 0.3s",
              border: "none",
            })}
          >
            Report Problem
          </NavLink>
          <button
            onClick={handleSignOut}
            style={{
              backgroundColor: "#d32f2f",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "16px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              border: "none",
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
          >
            Sign-out
          </button>
        </div>
      </div>

      <div
        style={{
          padding: "2rem",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: "16px",
          margin: "1rem auto",
          maxWidth: "1200px",
          width: "100%",
          boxShadow: "none",
          outline: "none",
          minHeight: "400px",
        }}
      >
        {activePage === "/dashboard" && (
          <div
            style={{
              display: "flex",
              gap: "2rem",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              padding: "2rem",
              maxWidth: "100%",
            }}
          >
            <div
                style={{
                  width: "200px",
                  height: "200px",
                  backgroundColor: "white",
                  color: "rgba(255, 140, 0, 0.9)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "16px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  textAlign: "center",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "20px",
                    marginBottom: "0.5rem",
                  }}
                >
                  Pending Exams
                </span>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "20px",
                    marginBottom: "0.5rem",
                  }}
                >
                  {pending}
                </span>
              </div><div
                style={{
                  width: "200px",
                  height: "200px",
                  backgroundColor: "white",
                  color: "rgba(34, 139, 34, 0.9)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "16px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  textAlign: "center",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  position: "relative",
                }}
              >
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "20px",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Approved Exams
                  </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "20px",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {approved}
                  </span>
                </div><div
                  style={{
                    width: "200px",
                    height: "200px",
                    backgroundColor: "white",
                    color: "rgba(255, 0, 0, 0.9)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "16px",
                    fontSize: "20px",
                    fontWeight: "bold",
                    textAlign: "center",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "20px",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Disapproved Exams
                  </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "20px",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {disapproved}
                  </span>
                </div>
              <div
                style={{
                  width: "200px",
                  height: "200px",
                  backgroundColor: "white",
                  color: "rgba(105, 105, 105, 0.9)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "16px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  textAlign: "center",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  position: "relative",
                }}
              >
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "20px",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Building Exams
                  </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "20px",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {building}
                  </span>
                </div>

                {userRole === "User" && (
              <><NavLink
                to="/dashboard/examForm"
                onClick={() => setActivePage("generateExam")}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    width: "250px",
                    height: "250px",
                    backgroundColor: "white",
                    color: "#d32f2f",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "16px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    const card = e.currentTarget;
                    card.style.transform = "scale(1.05)";
                    card.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.3)";
                  } }
                  onMouseLeave={(e) => {
                    const card = e.currentTarget;
                    card.style.transform = "scale(1)";
                    card.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
                  } }
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "28px",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Generate Exam
                  </span>
                </div>
              </NavLink><NavLink
                to="/dashboard/upload"
                onClick={() => setActivePage("uploadMaterial")}
                style={{ textDecoration: "none" }}
              >
                  <div
                    style={{
                      width: "250px",
                      height: "250px",
                      backgroundColor: "white",
                      color: "#d32f2f",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "16px",
                      fontSize: "18px",
                      fontWeight: "bold",
                      textAlign: "center",
                      cursor: "pointer",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      transition: "transform 0.3s, box-shadow 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      const card = e.currentTarget;
                      card.style.transform = "scale(1.05)";
                      card.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.3)";
                    } }
                    onMouseLeave={(e) => {
                      const card = e.currentTarget;
                      card.style.transform = "scale(1)";
                      card.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
                    } }
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "28px",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Upload Material
                    </span>
                  </div>
                </NavLink><NavLink
                  to="/dashboard/audiopPage"
                  onClick={() => setActivePage("audio")}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      width: "250px",
                      height: "250px",
                      backgroundColor: "white",
                      color: "#d32f2f",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "16px",
                      fontSize: "18px",
                      fontWeight: "bold",
                      textAlign: "center",
                      cursor: "pointer",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      transition: "transform 0.3s, box-shadow 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      const card = e.currentTarget;
                      card.style.transform = "scale(1.05)";
                      card.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.3)";
                    } }
                    onMouseLeave={(e) => {
                      const card = e.currentTarget;
                      card.style.transform = "scale(1)";
                      card.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
                    } }
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "28px",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Generate Audio
                    </span>
                  </div>
                </NavLink></>

            )}


                <div>

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
                    {userRole === "User" && <option value="building">Building</option>}
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
          </div>
        )}
        {activePage !== "/dashboard" && <Outlet />}
      </div>
    </div>
  );
};

export default Dashboard;
