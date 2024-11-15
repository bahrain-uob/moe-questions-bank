import React from "react";
// Import Amplify's Authenticator component
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css"; // Include Amplify's default styling

const LoginPage: React.FC = () => {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <h1>Welcome, {user?.username}</h1> //logged-in username 
          <button onClick={signOut}>Sign out</button> 
        </div>
      )}
    </Authenticator>
  );
};

export default LoginPage;
