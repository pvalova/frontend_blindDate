import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WelcomePage.css";

export default function WelcomePage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
        const response = await fetch("https://blinddatebackend.azurewebsites.net/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong");
      }
      
      // Registration successful, redirect to login
      navigate("/login", { state: { message: "Account created successfully! Please log in." } });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Google OAuth implementation would go here
    alert("Google signup not implemented yet");
  };

  return (
    <div className="welcome-container bg-books">
      <div className="content">
        <img src="/logoheart.png" alt="logo" className="logo" />
        <h1 className="title">Blind date with <span className="accent">a book</span></h1>
        <h2 className="subtitle">Create an account</h2>

        {error && <p className="error-message">{error}</p>}

        <button className="google-btn" onClick={handleGoogleSignup}>Sign up with Google</button>
        <p className="or">OR</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="full_name"
            placeholder="Full Name" 
            value={formData.full_name}
            onChange={handleChange}
            required
          />
          <input 
            type="email" 
            name="email"
            placeholder="Email" 
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input 
            type="password" 
            name="password"
            placeholder="Password" 
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button className="submit-btn" type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </button>
        </form>

        <p className="login-prompt">Already have an account? <a href="/login">Log in</a></p>
      </div>
    </div>
  );
}