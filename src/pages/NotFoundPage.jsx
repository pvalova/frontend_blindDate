import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check auth status AFTER component mounts, not during rendering
    const isAuthenticated = localStorage.getItem('token') !== null;
    
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  }, [navigate]);
  
  // Return a simple loading state while redirecting
  return <div>Redirecting...</div>;
}