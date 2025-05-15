import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./BookshelfPage.css";

export default function BookshelfPage() {
  const [activeTab, setActiveTab] = useState("myBooks");
  const [books, setBooks] = useState([]);
  const [reservedBooks, setReservedBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for success message from navigation
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the location state to prevent message showing on refresh
      window.history.replaceState({}, document.title);
    }
    
    // Define fetchBooks inside useEffect to avoid the dependency warning
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch all books contributed by the user
        const myBooksResponse = await fetch(`/books/my-books`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!myBooksResponse.ok) {
          throw new Error("Failed to fetch your books");
        }

        const myBooksData = await myBooksResponse.json();
        setBooks(myBooksData);

        // Fetch all books reserved by the user
        const reservedBooksResponse = await fetch(`/books/reserved`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!reservedBooksResponse.ok) {
          throw new Error("Failed to fetch reserved books");
        }

        const reservedBooksData = await reservedBooksResponse.json();
        setReservedBooks(reservedBooksData);
      } catch (error) {
        console.error("Error fetching books:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBooks();
  }, [location.state, navigate]); // Include navigate as a dependency

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

  const handleEditBook = (bookId) => {
    navigate(`/edit-book/${bookId}`);
  };

  const handleAddNewBook = () => {
    navigate("/add-book");
  };

  // Mock data for development and testing
  const mockMyBooks = [
    {
      id: 1,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      theme: "Southern Nostalgia",
      genre: "Fiction",
      description: "A story about growing up in the South and confronting prejudice.",
      clues: "Features a lawyer father and curious children in a small town.",
      is_available: true
    },
    {
      id: 2,
      title: "1984",
      author: "George Orwell",
      theme: "Big Brother is Watching",
      genre: "Science Fiction",
      description: "A dystopian vision of total surveillance and thought control.",
      clues: "Features a protagonist who works rewriting history.",
      is_available: true
    }
  ];

  const mockReservedBooks = [
    {
      id: 3,
      theme: "Break My Heart, Please",
      genre: "Romance",
      description: "A love story that will wreck you in the best way.",
      clues: "Features star-crossed lovers and unexpected twists.",
      reserved_date: "2025-04-10"
    },
    {
      id: 4,
      theme: "Secrets in the Attic",
      genre: "Mystery/Thriller",
      description: "A story full of hidden truths, dusty letters, and late-night discoveries.",
      clues: "Old family manor, hidden passages, and long-buried secrets.",
      reserved_date: "2025-04-05"
    }
  ];

  // Use real data if available, otherwise use mock data
  const displayedBooks = books.length > 0 ? books : mockMyBooks;
  const displayedReservedBooks = reservedBooks.length > 0 ? reservedBooks : mockReservedBooks;

  if (isLoading) {
    return <div className="loading">Loading...</div>;
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
            className={`tab-button ${activeTab === 'reserved' ? 'active' : ''}`}
            onClick={() => setActiveTab('reserved')}
          >
            Reserved Books
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
            
            {displayedBooks.length === 0 ? (
              <div className="empty-state">
                <p>You haven't added any books yet.</p>
                <button className="add-first-book-btn" onClick={handleAddNewBook}>
                  Add Your First Book
                </button>
              </div>
            ) : (
              <div className="books-grid">
                {displayedBooks.map(book => (
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
                      <button className="edit-btn" onClick={() => handleEditBook(book.id)}>
                        Edit
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
        
        {activeTab === 'reserved' && (
          <div className="reserved-books-section">
            <h2>Books I've Reserved</h2>
            
            {displayedReservedBooks.length === 0 ? (
              <div className="empty-state">
                <p>You haven't reserved any mystery books yet.</p>
                <button className="discover-books-btn" onClick={() => navigate("/discovery")}>
                  Discover Books
                </button>
              </div>
            ) : (
              <div className="books-grid">
                {displayedReservedBooks.map(book => (
                  <div className="book-item reserved-book" key={book.id}>
                    <div className="book-item-content">
                      <h3>{book.theme}</h3>
                      <div className="book-details-row">
                        <span className="book-detail-label">Genre:</span>
                        <span className="book-detail-value">{book.genre}</span>
                      </div>
                      <div className="book-details-row">
                        <span className="book-detail-label">Description:</span>
                        <span className="book-detail-value description">{book.description}</span>
                      </div>
                      <div className="book-details-row">
                        <span className="book-detail-label">Reserved on:</span>
                        <span className="book-detail-value">{book.reserved_date}</span>
                      </div>
                    </div>
                    <div className="book-item-actions">
                      <button className="view-btn" onClick={() => navigate(`/books/${book.id}`)}>
                        View Details
                      </button>
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