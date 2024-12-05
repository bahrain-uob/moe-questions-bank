import React from "react";
import { Navigate } from "react-router-dom";
import { useAppContext } from "../lib/contextLib";

//Component to protect the routes (Allow only authenticated users)
const AlreadyAuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppContext();

  // Wait for `isAuthenticated` and `userRole` to initialize
  if (isAuthenticated === undefined) {
    return null; // or a loading spinner if needed
  }

  if (isAuthenticated) {
    // Redirect to dashboard if already authenticated
    return <Navigate to="/dashboard" replace />;
  }

  // Render the children if authenticated
  return <>{children}</>;
};

export default AlreadyAuthRoute;
