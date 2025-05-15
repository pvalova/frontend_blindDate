import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "", // FastAPI OAuth2 expects "username" (even though it's an email)
    password: ""
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for success message from registration
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location]);

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
      // Convert form data to x-www-form-urlencoded (required by OAuth2)
      const formBody = new URLSearchParams();
      formBody.append("username", formData.username);
      formBody.append("password", formData.password);
      
      const response = await fetch(`/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Invalid credentials");
      }
      
      // Store token in localStorage
      localStorage.setItem("token", data.access_token);
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Google OAuth implementation would go here
    alert("Google login not implemented yet");
  };

  return (
    <div className="login-container bg-books">
      <div className="content">
        <img src="/logoheart.png" alt="logo" className="logo" />
        <h1 className="title">Blind date with <span className="accent">a book</span></h1>
        <h2 className="subtitle">Welcome back</h2>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <button className="google-btn" onClick={handleGoogleLogin}>Log in with Google</button>
        <p className="or">OR</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <input 
            type="email" 
            name="username"
            placeholder="Email" 
            value={formData.username}
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
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="signup-prompt">Don't have an account? <a href="/">Sign up</a></p>
      </div>
    </div>
  );
}