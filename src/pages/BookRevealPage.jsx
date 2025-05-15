import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./BookDetailPage.css";  // We can reuse some styles

export default function BookRevealPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("https://blinddatebackend.azurewebsites.net/books/mystery-books/${id}/reveal", {
          headers: {
              "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch book reveal details");
        }

        const bookData = await response.json();
        setBook(bookData);
      } catch (error) {
        console.error("Error fetching book reveal:", error);
        setError("Could not load book details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetails();
  }, [id, navigate]);

  const handleAddToCollection = async () => {
    try {
      // Here you would implement logic to add this book to the user's collection
      // For now we'll just navigate to the bookshelf
      navigate("/bookshelf", { state: { message: "Book added to your collection!" } });
    } catch (error) {
      console.error("Error adding book to collection:", error);
      setError("Could not add book to collection. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="book-detail-container">
      <Navbar />
      
      <div className="book-detail-content">
        <div className="book-card-large reveal-card">
          <div className="book-theme-info">
            <h1>{book.theme}</h1>
            <div className="book-genre">Genre: {book.genre}</div>
            
            <div className="book-theme-icon-large">
              <img src="/logoheart.png" alt={book.theme} className="theme-logo-large" />
            </div>
          </div>
          
          <div className="book-details">
            <div className="book-title-reveal">
              <h2>Title Revealed!</h2>
              <p className="revealed-title">{book.title}</p>
            </div>
            
            <div className="book-author-reveal">
              <h2>Author Revealed!</h2>
              <p className="revealed-author">{book.author}</p>
            </div>
            
            <div className="book-description">
              <h2>Description</h2>
              <p>{book.description}</p>
            </div>
            
            <div className="book-actions">
              <button 
                className="reserve-book-btn"
                onClick={handleAddToCollection}
              >
                Add to My Collection
              </button>
              
              <button 
                className="back-btn"
                onClick={() => navigate("/mystery")}
              >
                Back to Mystery Books
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}