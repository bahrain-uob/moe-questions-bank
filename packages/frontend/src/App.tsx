import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom"; // Navigation between pages.
import Dashboard from "./pages/Dashboard";
import Login from "./pages/LoginPage";
import ExamForm from "./pages/ExamForm";
import FeedbackForm from "./pages/FeedbackForm";
import HistoryPage from "./pages/HistoryPage";
import { AppContext, AppContextType } from "./lib/contextLib";
import "@aws-amplify/ui-react/styles.css";
import AuthRoute from "./pages/AuthRoute";
import { InitialForm } from "./pages/InitialForm";
import { getCurrentUser } from "./lib/getToken"
import AlreadyAuthRoute from "./pages/AlreadyAuthRoute";
import GeneratorRoute from "./pages/generatorRoutes";
import ApproverRoute from "./pages/ApproverRoute";
import ExamApproval from "./pages/ExamApproval";
import NotFound from "./pages/NotFound";
import ViewExam from "./pages/ViewExam";

const App: React.FC = () => {
  // Authentication state
   const [isAuthenticated, setAuthenticated] = useState<boolean>(
     localStorage.getItem("isAuthenticated") === "true"
   );
   const [userRole, setUserRole] = useState<string>(
     localStorage.getItem("userRole") || ""
   );

  // Restore authentication state on app load
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const storedIsAuthenticated = localStorage.getItem("isAuthenticated");
      const storedUserRole = localStorage.getItem("userRole");

      setAuthenticated(storedIsAuthenticated === "true");
      setUserRole(storedUserRole || "");
    }
  }, []);

  // Persist authentication state when it changes
  useEffect(() => {
    localStorage.setItem("isAuthenticated", String(isAuthenticated));
    localStorage.setItem("userRole", userRole);
  }, [isAuthenticated, userRole]);

  const appContextValue: AppContextType = {
    isAuthenticated,
    userHasAuthenticated: setAuthenticated,
    userRole,
    updateUserRole: setUserRole,
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <AlreadyAuthRoute>
                <Login />
              </AlreadyAuthRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <AuthRoute>
                <Dashboard />
              </AuthRoute>
            }
          >
            {/* Nested Routes for Dashboard */}
            <Route index element={<div></div>} /> {/* Default Content */}
            <Route
              path="examForm"
              element={
                <GeneratorRoute>
                  <InitialForm />
                </GeneratorRoute>
              }
            />
            <Route path="examForm/:id" element={<ExamForm />} />
            <Route path="viewExam/:id" element={<ViewExam />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="feedback-form" element={<FeedbackForm />} />
            <Route
              path="approveExam"
              element={
                <ApproverRoute>
                  <ExamApproval />
                </ApproverRoute>
              }
            />
          </Route>

          {/* Redirect '/' to '/dashboard' */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
