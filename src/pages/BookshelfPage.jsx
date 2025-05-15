import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./BookshelfPage.css";

export default function BookshelfPage() {
  const [activeTab, setActiveTab] = useState("myBooks");
  const [books, setBooks] = useState([]);
  const [acquiredBooks, setAcquiredBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Use useCallback to memoize the fetchBooks function
  const fetchBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch books added by the user
      const myBooksResponse = await fetch(`https://blinddatebackend.azurewebsites.net/books/my-books`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!myBooksResponse.ok) {
        throw new Error("Failed to fetch your books");
      }

      const myBooksData = await myBooksResponse.json();
      setBooks(myBooksData);

      // Fetch books in user's collection (mystery books they've acquired)
      const collectionResponse = await fetch(`https://blinddatebackend.azurewebsites.net/books/my-collection`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!collectionResponse.ok) {
        throw new Error("Failed to fetch your collection");
      }

      const collectionData = await collectionResponse.json();
      setAcquiredBooks(collectionData);
    } catch (error) {
      console.error("Error fetching books:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]); // include navigate in the dependency array

  useEffect(() => {
    // Check for success message from navigation
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the location state to prevent message showing on refresh
      window.history.replaceState({}, document.title);
    }
    
    // Fetch all book data
    fetchBooks();
  }, [location.state, fetchBooks]); // Added fetchBooks to dependency array to fix the warning

  const handleDeleteBook = async (bookId) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        const token = localStorage.getItem("token");
        
        const response = await fetch(`https://blinddatebackend.azurewebsites.net/books/${bookId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to delete book");
        }

        // Update the books list after successful deletion
        setBooks(books.filter(book => book.id !== bookId));
        setSuccessMessage("Book deleted successfully");
      } catch (error) {
        console.error("Error deleting book:", error);
        setError("Failed to delete book. Please try again.");
      }
    }
  };

  const handleAddNewBook = () => {
    navigate("/add-book");
  };

  if (isLoading) {
    return <div className="loading">Loading your books...</div>;
  }

  return (
    <div className="bookshelf-container">
      <Navbar />
      
      <div className="bookshelf-content">
        <h1 className="bookshelf-title">My Bookshelf</h1>
        
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
        
        <div className="bookshelf-tabs">
          <button 
            className={`tab-button ${activeTab === 'myBooks' ? 'active' : ''}`}
            onClick={() => setActiveTab('myBooks')}
          >
            My Added Books
          </button>
          <button 
            className={`tab-button ${activeTab === 'collection' ? 'active' : ''}`}
            onClick={() => setActiveTab('collection')}
          >
            My Collection
          </button>
        </div>
        
        {activeTab === 'myBooks' && (
          <div className="my-books-section">
            <div className="section-header">
              <h2>Books I've Added</h2>
              <button className="add-book-btn" onClick={handleAddNewBook}>
                + Add New Book
              </button>
            </div>
            
            {books.length === 0 ? (
              <div className="empty-state">
                <p>You haven't added any books yet.</p>
                <button className="add-first-book-btn" onClick={handleAddNewBook}>
                  Add Your First Book
                </button>
              </div>
            ) : (
              <div className="books-grid">
                {books.map(book => (
                  <div className="book-item" key={book.id}>
                    <div className="book-item-content">
                      <h3>{book.theme}</h3>
                      <div className="book-details-row">
                        <span className="book-detail-label">Title:</span>
                        <span className="book-detail-value">{book.title}</span>
                      </div>
                      <div className="book-details-row">
                        <span className="book-detail-label">Author:</span>
                        <span className="book-detail-value">{book.author}</span>
                      </div>
                      <div className="book-details-row">
                        <span className="book-detail-label">Genre:</span>
                        <span className="book-detail-value">{book.genre}</span>
                      </div>
                      <div className="book-availability">
                        Status: <span className={book.is_available ? 'available' : 'unavailable'}>
                          {book.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                    <div className="book-item-actions">
                      <button className="view-btn" onClick={() => navigate(`/books/${book.id}`)}>
                        View
                      </button>
                      <button className="delete-btn" onClick={() => handleDeleteBook(book.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'collection' && (
          <div className="acquired-books-section">
            <h2>My Book Collection</h2>
            
            {acquiredBooks.length === 0 ? (
              <div className="empty-state">
                <p>You haven't added any books to your collection yet.</p>
                <button className="discover-books-btn" onClick={() => navigate("/mystery")}>
                  Discover Mystery Books
                </button>
              </div>
            ) : (
              <div className="books-grid">
                {acquiredBooks.map(book => (
                  <div className="book-item acquired-book" key={book.id}>
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}