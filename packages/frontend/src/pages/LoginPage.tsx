import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
import "../styles/Login.css";
import { signIn } from "aws-amplify/auth";
import { useAppContext } from "../lib/contextLib";
import getCurrentUser from "../lib/getToken";
import { signOut } from "aws-amplify/auth";
import { getUserAttributes } from "../lib/getUserAttributes";

export default function Login() {
  const [username, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [role, setRole] = useState("user"); // State to track the selected role (user or admin)
  const navigate = useNavigate();
  const { userHasAuthenticated } = useAppContext();

  function validateForm() {
    return username.length > 0 && password.length > 0;
  }

  // Automatically sign out the user if they are already authenticated
  useEffect(() => {
    const handleSignOutIfAuthenticated = async () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        try {
          await signOut();
          userHasAuthenticated(false);
          console.log("User signed out");
        } catch (error) {
          console.error("Error during sign-out:", error);
        }
      }
    };

    handleSignOutIfAuthenticated();
  }, [userHasAuthenticated]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await signIn({ username, password });
      userHasAuthenticated(true);

      // Fetch user attributes
      const attributes: any = await getUserAttributes();
      console.log("User attributes: ", attributes);

      const nickname = attributes["nickname"]; // Fetch the nickname attribute
      console.log(`User nickname: ${nickname}`);

      if (nickname === "Admin") {
        navigate("/admin-dashboard"); // Redirect Admin to Admin Dashboard
      } else if (nickname === "User") {
        navigate("/dashboard"); // Redirect User to User Dashboard
      } else {
        throw new Error("User does not belong to a valid role.");
      }

      // Check role and navigate accordingly
      // if (role === "admin") {
      //   console.log("Redirecting to admin dashboard...");
      //   navigate("/admin-dashboard"); // Redirect to Admin Dashboard
      // } else {
      //   console.log("Redirecting to user dashboard...");
      //   navigate("/dashboard"); // Redirect to User Dashboard
      // }
    } catch (error) {
      // Prints the full error
      console.error(error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(String(error));
      }
    }
  }

  return (
    <div className="Login">
      <h1>Login</h1>
      <Form onSubmit={handleSubmit}>
        <Stack gap={3}>
          <Form.Group controlId="email">
            <Form.Label>Email: </Form.Label>
            <Form.Control
              autoFocus
              size="lg"
              type="email"
              value={username}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="password">
            <Form.Label>Password: </Form.Label>
            <Form.Control
              size="lg"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          {/* Role Selection */}
          {/* <Form.Group controlId="role">
            <Form.Label>Select your role:</Form.Label>
            <Form.Check
              type="radio"
              label="Admin"
              name="role"
              value="admin"
              checked={role === "admin"}
              onChange={(e) => setRole(e.target.value)}
            />
            <Form.Check
              type="radio"
              label="User"
              name="role"
              value="user"}
              checked={role === "user"}
              onChange={(e) => setRole(e.target.value)}
            />
          </Form.Group> */}

          <Button size="lg" type="submit" disabled={!validateForm()}>
            Login
          </Button>
        </Stack>
      </Form>
    </div>
  );
}
