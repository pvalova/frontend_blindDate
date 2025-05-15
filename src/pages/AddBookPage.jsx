import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./AddBookPage.css";

export default function AddBookPage() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    theme: "",
    genre: "",
    clues: "",
    is_available: true
  });
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Predefined genre options
  const genreOptions = [
    "Fiction",
    "Mystery/Thriller",
    "Romance",
    "Science Fiction",
    "Fantasy",
    "Horror",
    "Historical Fiction",
    "Biography/Memoir",
    "Self-Help",
    "Young Adult",
    "Children's",
    "Poetry",
    "Other"
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      const response = await fetch("https://blinddatebackend.azurewebsites.net/books/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add book");
      }
      
      // Redirect to bookshelf with success message
      navigate("/bookshelf", { state: { message: "Book added successfully!" } });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-book-container">
      <Navbar />
      
      <div className="add-book-content">
        <h1 className="add-book-title">Add a Blind Date Book</h1>
        <p className="add-book-subtitle">
          Share a book you love with others in the blind date format. 
          The title and author will be hidden, but readers will discover it based on the theme and clues.
        </p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="add-book-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Book Details <span className="hidden-note">(Hidden from readers)</span></h2>
            
            <div className="form-group">
              <label htmlFor="title">Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter the full book title"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="author">Author*</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                placeholder="Enter the author's name"
              />
            </div>
          </div>
          
          <div className="form-section">
            <h2>Blind Date Information <span className="visible-note">(Shown to readers)</span></h2>
            
            <div className="form-group">
              <label htmlFor="theme">Theme/Title*</label>
              <input
                type="text"
                id="theme"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                required
                placeholder="Create an intriguing theme title (e.g., 'Rainy Afternoon Escape')"
              />
              <div className="field-help">This will be the main title readers see in the discovery page</div>
            </div>
            
            <div className="form-group">
              <label htmlFor="genre">Genre*</label>
              <select
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                required
              >
                <option value="">Select a genre</option>
                {genreOptions.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description*</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Provide an enticing description of the book without revealing the title or author"
                rows="4"
              ></textarea>
              <div className="field-help">Share what makes this book special without giving away its identity</div>
            </div>
            
            <div className="form-group">
              <label htmlFor="clues">Clues*</label>
              <textarea
                id="clues"
                name="clues"
                value={formData.clues}
                onChange={handleChange}
                required
                placeholder="Drop subtle hints about the book"
                rows="3"
              ></textarea>
              <div className="field-help">Offer cryptic hints that might help readers guess the book (e.g., setting, time period, themes)</div>
            </div>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="is_available"
                name="is_available"
                checked={formData.is_available}
                onChange={handleChange}
              />
              <label htmlFor="is_available">Make this book available immediately</label>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-book-btn" disabled={isLoading}>
              {isLoading ? "Adding Book..." : "Add Book"}
            </button>
            <button type="button" className="cancel-btn" onClick={() => navigate("/dashboard")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}