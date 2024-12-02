import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom"; // Navigation between pages.
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";//admin dashboard
import Login from "./pages/LoginPage";
import { AppContext, AppContextType } from "./lib/contextLib";
import "@aws-amplify/ui-react/styles.css";
import ProtectedRoute from "./pages/ProtectedRoute";

const App: React.FC = () => {
  // Authentication state
  const [isAuthenticated, setAuthenticated] = useState(false);

  const appContextValue: AppContextType = {
    isAuthenticated,
    userHasAuthenticated: setAuthenticated,
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Redirect '/' to /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
            

            {/* User Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

           {/* Admin Dashboard */}
           <Route
            path="/admin-dashboard"  // Ensure this path matches the AdminDashboard component
            element={
              <ProtectedRoute>
                <AdminDashboard />  {/* Correct component for Admin Dashboard */}
              </ProtectedRoute>
            }
          />


          {/* Protected Routes 
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />*/}
          {/* <Route
            path="/exam-form"
            element={
              <ProtectedRoute>
                <ExamForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback-form"
            element={
              <ProtectedRoute>
                <FeedbackForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          /> */}
        </Routes>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
