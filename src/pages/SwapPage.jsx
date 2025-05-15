import React from "react";
import Navbar from "../components/Navbar";

export default function SwapPage() {
  return (
    <div className="swap-container">
      <Navbar />
      
      <div className="swap-content" style={{ 
        maxWidth: "1000px", 
        margin: "0 auto", 
        padding: "40px 20px",
        textAlign: "center",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFF8E7",
        fontFamily: "Georgia, serif",
      }}>
        <h1 style={{ color: "#5D4037", marginBottom: "20px" }}>Book Swap Feature</h1>
        <p style={{ color: "#7D5A50", fontSize: "1.1rem", marginBottom: "30px" }}>
          This feature is coming soon! Soon you'll be able to swap books with other members.
        </p>
      </div>
    </div>
  );
}