import React from "react";
//A ready-made login form
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

//creates the Login Page component{a block of the website}
const LoginPage: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "white",
      }}
    >
      <div
        style={{
          width: "400px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          padding: "2rem",
          backgroundColor: "white",
        }}
      >
        <Authenticator />
      </div>
    </div>
  );
};

export default LoginPage;
