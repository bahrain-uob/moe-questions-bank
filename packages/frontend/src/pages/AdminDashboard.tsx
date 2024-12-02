import React, { useState } from "react";
import MOELogo from "../assets/moe_LOGO.png"; // Ministry of Education logo
import HomeIcon from "../assets/home icon (1).png"; // Home icon
import BackgroundImage from "../assets/BG.jpg"; // Background image
//import ExamApproval from "./ExamApproval";
import HistoryPage from "./HistoryPage";
import FeedbackForm from "./FeedbackForm";
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../lib/contextLib";

interface AdminDashboardProps {}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const navigate = useNavigate();
  const { userHasAuthenticated } = useAppContext();
  const [activePage, setActivePage] = useState("home");

  async function handleSignOut() {
    await signOut();
    userHasAuthenticated(false);
    navigate("/login");
  }

  const renderContent = () => {
    switch (activePage) {
      case "approveExams":
      //  return <ExamApproval />;
      case "examHistory":
        return <HistoryPage />;
      case "reportProblem":
        return <FeedbackForm />;
      default:
        return (
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
              onClick={() => setActivePage("approveExams")}
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
              <span style={{fontWeight: "bold",fontSize: "34px",marginBottom: "0.5rem", }}>Pending Exams</span>
              <p style={{ fontSize: "14px", fontWeight: "normal", textAlign: "center",margin: "0 auto", color:"black",maxWidth: "80%",}}>
                See all the generated exams waiting for your approval.
              </p>
              <span
                style={{
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  backgroundColor: "#d32f2f",
                  color: "white",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                
              </span>
            </div>
            <div
              onClick={() => setActivePage("examHistory")}
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
              <span style={{fontWeight: "bold",fontSize: "34px",marginBottom: "0.5rem", }}>Exams History</span>
              <p style={{ fontSize: "14px", fontWeight: "normal", textAlign: "center",margin: "0 auto", color:"black",maxWidth: "80%", }}>
                See all the generated exams.
              </p>
            </div>
            <div
              onClick={() => setActivePage("reportProblem")}
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
              <span style={{fontWeight: "bold",fontSize: "34px",marginBottom: "0.5rem", }}>Report Problem</span>
              <p style={{ fontSize: "14px", fontWeight: "normal", textAlign: "center",margin: "0 auto", color:"black",maxWidth: "80%", }}>
                Report a problem regarding the website to the admin.
              </p>
            </div>
          </div>
        );
    }
  };

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
          <img
            src={HomeIcon}
            alt="Home Icon"
            style={{ height: "50px", cursor: "pointer" }}
            onClick={() => setActivePage("home")}
          />
         <button
  onClick={() => setActivePage("approveExams")}
  style={{
    backgroundColor: "#d32f2f",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "16px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    border: "none",
    boxShadow: "none",
    outline: "none",
    transition: "transform 0.3s, box-shadow 0.3s",
  }}
  onMouseEnter={(e) => {
    const btn = e.currentTarget;
    btn.style.transform = "scale(1.05)"; // Slight scale-up
    btn.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)"; // Add shadow
  }}
  onMouseLeave={(e) => {
    const btn = e.currentTarget;
    btn.style.transform = "scale(1)"; // Reset scale
    btn.style.boxShadow = "none"; // Reset shadow
  }}
>
  Pending Exams
</button>
<button
  onClick={() => setActivePage("examHistory")}
  style={{
    backgroundColor: "#d32f2f",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "16px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    border: "none",
    boxShadow: "none",
    outline: "none",
    transition: "transform 0.3s, box-shadow 0.3s",
  }}
  onMouseEnter={(e) => {
    const btn = e.currentTarget;
    btn.style.transform = "scale(1.05)";
    btn.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
  }}
  onMouseLeave={(e) => {
    const btn = e.currentTarget;
    btn.style.transform = "scale(1)";
    btn.style.boxShadow = "none";
  }}
>
  Exams History
</button>
<button
  onClick={() => setActivePage("reportProblem")}
  style={{
    backgroundColor: "#d32f2f",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "16px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    border: "none",
    boxShadow: "none",
    outline: "none",
    transition: "transform 0.3s, box-shadow 0.3s",
  }}
  onMouseEnter={(e) => {
    const btn = e.currentTarget;
    btn.style.transform = "scale(1.05)";
    btn.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
  }}
  onMouseLeave={(e) => {
    const btn = e.currentTarget;
    btn.style.transform = "scale(1)";
    btn.style.boxShadow = "none";
  }}
>
  Report Problem
</button>
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
    boxShadow: "none",
    outline: "none",
    transition: "transform 0.3s, box-shadow 0.3s",
  }}
  onMouseEnter={(e) => {
    const btn = e.currentTarget;
    btn.style.transform = "scale(1.05)";
    btn.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
  }}
  onMouseLeave={(e) => {
    const btn = e.currentTarget;
    btn.style.transform = "scale(1)";
    btn.style.boxShadow = "none";
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
          border: "none", // Ensures no border
          boxShadow: "none", // Removes the black shadow
          outline: "none", // Removes focus outline
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
