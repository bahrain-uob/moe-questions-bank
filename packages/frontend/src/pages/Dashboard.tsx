import React, { useState } from "react";
import MOELogo from "../assets/moe_LOGO.png"; // Ministry of Education logo
import HomeIcon from "../assets/home icon (1).png"; // Home icon
import BackgroundImage from "../assets/BG.jpg"; // Background image
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../lib/contextLib";
import { NavLink, Outlet } from "react-router-dom";

interface UserDashboardProps {}

const Dashboard: React.FC<UserDashboardProps> = () => {
  const navigate = useNavigate();
  const { userHasAuthenticated } = useAppContext();
  const { userRole } = useAppContext();
  const [activePage, setActivePage] = useState<string>(window.location.pathname);

  setTimeout(() => {
    setActivePage(window.location.pathname)
  },500)

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
          {userRole === "User" && (
            <NavLink
              to="/dashboard/examForm"
              onClick={() => setActivePage("generateExams")}
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
              Generate Exam
            </NavLink>
          )}

          {userRole === "Admin" && (
            <NavLink
              to="/dashboard/approveExam"
              onClick={() => setActivePage("approveExams")}
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
              Pending Exams
            </NavLink>
          )}

          <NavLink
            to="/dashboard/history"
            onClick={() => setActivePage("history")}
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
            See Exams
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
            {userRole === "User" && (
              <NavLink
                to="/dashboard/examForm"
                onClick={() => setActivePage("generateExam")}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    width: "300px",
                    height: "300px",
                    backgroundColor: "white",
                    color: "#d32f2f",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "16px",
                    fontSize: "20px",
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
                  }}
                  onMouseLeave={(e) => {
                    const card = e.currentTarget;
                    card.style.transform = "scale(1)";
                    card.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "34px",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Generate Exam
                  </span>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "normal",
                      textAlign: "center",
                      color: "black",
                      maxWidth: "80%",
                    }}
                  >
                    Create new exams using uploaded material.
                  </p>
                </div>
              </NavLink>
            )}

            {userRole === "Admin" && (
              <NavLink
                to="/dashboard/approveExam"
                onClick={() => setActivePage("approveExams")}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    width: "300px",
                    height: "300px",
                    backgroundColor: "white",
                    color: "#d32f2f",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "16px",
                    fontSize: "20px",
                    fontWeight: "bold",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    const card = e.currentTarget;
                    card.style.transform = "scale(1.05)";
                    card.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    const card = e.currentTarget;
                    card.style.transform = "scale(1)";
                    card.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "34px",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Pending Exams
                  </span>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "normal",
                      textAlign: "center",
                      margin: "0 auto",
                      color: "black",
                      maxWidth: "80%",
                    }}
                  >
                    See all the generated exams waiting for your approval.
                  </p>
                  <span
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      right: "10px",
                      backgroundColor: "#d32f2f",
                      color: "white",
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >{ }</span>
                </div>
              </NavLink>
            )}

            <NavLink
              to="/dashboard/history"
              onClick={() => setActivePage("seeExams")}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  width: "300px",
                  height: "300px",
                  backgroundColor: "white",
                  color: "#d32f2f",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "16px",
                  fontSize: "20px",
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
                }}
                onMouseLeave={(e) => {
                  const card = e.currentTarget;
                  card.style.transform = "scale(1)";
                  card.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
                }}
              >
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "34px",
                    marginBottom: "0.5rem",
                  }}
                >
                  See Exams
                </span>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "normal",
                    textAlign: "center",
                    color: "black",
                    maxWidth: "80%",
                  }}
                >
                  View all previously generated exams.
                </p>
              </div>
            </NavLink>
            <NavLink
              to="/dashboard/feedback-form"
              onClick={() => setActivePage("feedback")}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  width: "300px",
                  height: "300px",
                  backgroundColor: "white",
                  color: "#d32f2f",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "16px",
                  fontSize: "20px",
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
                }}
                onMouseLeave={(e) => {
                  const card = e.currentTarget;
                  card.style.transform = "scale(1)";
                  card.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
                }}
              >
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "34px",
                    marginBottom: "0.5rem",
                  }}
                >
                  Report Problem
                </span>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "normal",
                    textAlign: "center",
                    color: "black",
                    maxWidth: "80%",
                  }}
                >
                  Report issues to the admin.
                </p>
              </div>
            </NavLink>
          </div>
        )}
        {activePage !== "/dashboard" && <Outlet />}
      </div>
    </div>
  );
};

export default Dashboard;
