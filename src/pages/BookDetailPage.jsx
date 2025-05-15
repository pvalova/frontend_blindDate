import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./BookDetailPage.css";

export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch book details
    const fetchBookDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`https://blinddatebackend.azurewebsites.net/books/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch book details");
        }

        const bookData = await response.json();
        setBook(bookData);
      } catch (error) {
        console.error("Error fetching book:", error);
        setError("Could not load book details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetails();
  }, [id, navigate]);

  const handleReserveBook = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`https://blinddatebackend.azurewebsites.net/books/${id}/reserve`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to reserve book");
      }

      // Show success message or redirect
      navigate("/bookshelf", { state: { message: "Book successfully reserved!" } });
    } catch (error) {
      console.error("Error reserving book:", error);
      setError("Could not reserve book. Please try again later.");
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  // Render with mock data if book not loaded yet
  const bookData = book || {
    id: id,
    title: "Mystery Book",
    description: "A fascinating mystery waiting to be discovered.",
    theme: "Rainy Afternoon Escape",
    genre: "Mystery/Thriller",
    clues: "Set in a remote location, features an unexpected twist, and explores themes of identity.",
    is_available: true
  };

  return (
    <div className="book-detail-container">
      <Navbar />
      
      <div className="book-detail-content">
        <div className="book-card-large">
          <div className="book-theme-info">
            <h1>{bookData.theme}</h1>
            <div className="book-genre">Genre: {bookData.genre}</div>
            
            <div className="book-theme-icon-large">
              <img src="/logoheart.png" alt={bookData.theme} className="theme-logo-large" />
            </div>
          </div>
          
          <div className="book-details">
            <div className="book-description">
              <h2>Description</h2>
              <p>{bookData.description}</p>
            </div>
            
            <div className="book-clues">
              <h2>Clues</h2>
              <p>{bookData.clues}</p>
            </div>
            
            <div className="book-actions">
              {bookData.is_available ? (
                <button 
                  className="reserve-book-btn"
                  onClick={handleReserveBook}
                >
                  Reserve This Mystery Book
                </button>
              ) : (
                <div className="book-unavailable">
                  This book is currently unavailable
                </div>
              )}
              
              <button 
                className="back-btn"
                onClick={() => navigate("/discovery")}
              >
                Back to Discovery
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}