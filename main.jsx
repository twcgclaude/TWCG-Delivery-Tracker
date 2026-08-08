import React from "react";
import ReactDOM from "react-dom/client";
import "./storagePolyfill.js"; // MUST be imported before App — sets up window.storage
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
