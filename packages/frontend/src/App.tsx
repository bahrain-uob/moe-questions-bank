import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";//navigation between different pages of the website.
import Dashboard from "./pages/Dashboard";
import ExamForm from "./pages/ExamForm";
import FeedbackForm from "./pages/FeedbackForm";
import HistoryPage from "./pages/HistoryPage";
//import LoginPage from "./pages/LoginPage";
import { Authenticator } from "@aws-amplify/ui-react";//It ensures only logged-in users can access the website , it wraps the entire app in AWS Amplify’s login system
import "@aws-amplify/ui-react/styles.css";
//import awsExports from "./aws-exports";
//import { Amplify } from "aws-amplify";


const App: React.FC = () => {
  return (
    <Authenticator>  
      {({ user, signOut }) => (
        <Router>
          <Routes>
            <Route
              path="/" //Homepage
              element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} //If they’re logged in, they’re sent to the dashboard.If they’re not logged in, they’re sent to the login page.
            />
            <Route path="/dashboard" element={<Dashboard signOut={signOut} />} /> 
            <Route path="/exam-form" element={<ExamForm />} />
            <Route path="/feedback-form" element={<FeedbackForm />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </Router>
      )}
    </Authenticator>
  );
};

export default App;
//function App() {
 // const [count, setCount] = useState("")

  //function onClick() {
    //console.log(import.meta.env.VITE_API_URL);
    //fetch(import.meta.env.VITE_API_URL, {
    //  method: "POST",
   // })
     // .then((response) => response.text())
     // .then(setCount);
  //}

  //return (
    //<>
      //<div>
       // <a href="https://vitejs.dev" target="_blank">
         // <img src={viteLogo} className="logo" alt="Vite logo" />
        //</a>
        //<a href="https://react.dev" target="_blank">
          //<img src={reactLogo} className="logo react" alt="React logo" />
        //</a>
      //</div>
      //<h1>Vite + React</h1>
      //<div className="card">
       // <button onClick={onClick}>
         // count is {count ? count : "unknown"}
        //</button>
        //<p>
         // Edit <code>src/App.tsx</code> and save to test HMR
        //</p>
      //</div>
      //<p className="read-the-docs">
       // Click on the Vite and React logos to learn more
      //</p>
    //</>
  //)
//}

//export default App
