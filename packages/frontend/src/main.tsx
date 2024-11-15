import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
//import amplify and its config.
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports.ts';


//initalize amplify
//Amplify.configure(awsExports);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


