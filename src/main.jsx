import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "leaflet/dist/leaflet.css";

const RootLayout = ({ children }) => (
  <div style={styles.root}>
    {children}
  </div>
);

const styles = {
  root: {
    width: "100%",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
    overflowX: "hidden",
    backgroundColor: "#f8fafc"
  }
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <RootLayout>
        <App />
      </RootLayout>
    </BrowserRouter>
  </React.StrictMode>
);
