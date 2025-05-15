import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardPage.css";
import Navbar from "../components/Navbar";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
      const response = await fetch(`https://blinddatebackend.azurewebsites.net/users/me/`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        setUser(userData);
        
        // Store first initial for profile icon
        if (userData.full_name) {
          localStorage.setItem("userInitial", userData.full_name.charAt(0));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleNavigate = (path) => {
    navigate(path);
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-content">
        <div className="welcome-message">
          <h2>Welcome, {user.full_name}!</h2>
          <p>Your blind date with a book adventure begins here.</p>
        </div>

        <div className="dashboard-cards">
          <div className="card">
            <h3>Discover Books</h3>
            <p>Find your next blind date with a book based on themes you love.</p>
            <button 
              className="card-btn" 
              onClick={() => handleNavigate("/discovery")}
            >
              Explore
            </button>
          </div>
          
          <div className="card">
            <h3>Add a Book</h3>
            <p>Share a book you love with others in the blind date format.</p>
            <button 
              className="card-btn"
              onClick={() => handleNavigate("/add-book")}
            >
              Add Book
            </button>
          </div>
          
          <div className="card">
            <h3>My Bookshelf</h3>
            <p>View books you've added and your reading history.</p>
            <button 
              className="card-btn"
              onClick={() => handleNavigate("/bookshelf")}
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}