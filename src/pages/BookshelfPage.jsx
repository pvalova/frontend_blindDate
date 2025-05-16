import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./BookshelfPage.css";

export default function BookshelfPage() {
  const [acquiredBooks, setAcquiredBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch book collection
  const fetchCollection = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch books in user's collection
      const response = await fetch(`https://blinddatebackend.azurewebsites.net/books/my-collection`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch your collection");
      }

      const data = await response.json();
      setAcquiredBooks(data);
    } catch (error) {
      console.error("Error fetching collection:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Check for success message from navigation
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the location state to prevent message showing on refresh
      window.history.replaceState({}, document.title);
    }
    
    // Fetch collection
    fetchCollection();
  }, [location.state, fetchCollection]);

  const handleReadBook = (bookId) => {
    navigate(`/read/${bookId}`);
  };

  if (isLoading) {
    return <div className="loading">Loading your book collection...</div>;
  }

  return (
    <div className="bookshelf-container">
      <Navbar />
      
      <div className="bookshelf-content">
        <h1 className="bookshelf-title">My Book Collection</h1>
        
        {successMessage && (
          <div className="success-message">
            {successMessage}
            <button className="close-message" onClick={() => setSuccessMessage("")}>×</button>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
            <button className="close-message" onClick={() => setError("")}>×</button>
          </div>
        )}
        
        {acquiredBooks.length === 0 ? (
          <div className="empty-state">
            <p>You haven't added any books to your collection yet.</p>
            <button className="discover-books-btn" onClick={() => navigate("/mystery")}>
              Discover Mystery Books
            </button>
          </div>
        ) : (
          <div className="books-grid">
            {acquiredBooks.map(book => {
              // Determine if book is swapped to the user (negative ID) or from the user (in an active swap)
              const isSwappedToUser = book.id < 0;
              
              return (
                <div 
                  className={`book-item ${isSwappedToUser ? 'swapped-book' : 'acquired-book'}`} 
                  key={book.id}
                >
                  <div className="book-item-content">
                    <h3>{book.title}</h3>
                    <div className="book-details-row">
                      <span className="book-detail-label">Author:</span>
                      <span className="book-detail-value">{book.author}</span>
                    </div>
                    <div className="book-details-row">
                      <span className="book-detail-label">Genre:</span>
                      <span className="book-detail-value">{book.genre}</span>
                    </div>
                    <div className="book-details-row">
                      <span className="book-detail-label">Theme:</span>
                      <span className="book-detail-value">{book.theme}</span>
                    </div>
                    <div className="book-details-row">
                      <span className="book-detail-label">Added:</span>
                      <span className="book-detail-value">
                        {new Date(book.acquired_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Show swap indicator if it's a swapped book */}
                    {isSwappedToUser && (
                      <div className="book-swap-status">
                        <span className="swap-badge">Swapped Book</span>
                        <span className="swap-expires">Available through swap</span>
                      </div>
                    )}
                    
                    {/* Show indicator if the user's book is in an active swap */}
                    {book.in_active_swap && (
                      <div className="book-swap-status book-unavailable">
                        <span className="swap-badge swap-unavailable">In Active Swap</span>
                        <span className="swap-expires">Currently unavailable to you</span>
                      </div>
                    )}
                  </div>
                  <div className="book-item-actions">
                    <button 
                      className="read-btn" 
                      onClick={() => handleReadBook(book.book_id)}
                      disabled={book.in_active_swap}
                    >
                      {book.in_active_swap ? 'Unavailable (In Swap)' : 'Read Book'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}