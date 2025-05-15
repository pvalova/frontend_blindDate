import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ePub from "epubjs";
import "./BookReaderPage.css";
import Navbar from "../components/Navbar";

export default function BookReaderPage() {
  const { filename } = useParams();
  const bookRef = useRef(null);
  const viewerRef = useRef(null);
  const renditionRef = useRef(null);
  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);
  const [bookTitle, setBookTitle] = useState("Loading...");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const nextPage = () => {
    renditionRef.current?.next();
  };

  const prevPage = () => {
    renditionRef.current?.prev();
  };

  const loadBookWithRetry = useCallback(async (retryAttempt = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      // Use the proxy endpoint
      const res = await fetch(`https://blinddatebackend.azurewebsites.net/books/read-proxy/${encodeURIComponent(filename)}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to load book: ${res.status} ${res.statusText}`);
      }
      
      // Get the book as a blob
      const blob = await res.blob();
      const bookUrl = URL.createObjectURL(blob);
      
      console.log("Created local blob URL for book");

      // Clear previous book instance if exists
      if (bookRef.current) {
        bookRef.current.destroy();
        if (viewerRef.current) {
          viewerRef.current.innerHTML = "";
        }
      }

      // Initialize new book
      const book = ePub(bookUrl);
      bookRef.current = book;
      // Store URL for cleanup
      bookRef.current.bookUrl = bookUrl;

      // Handle potential book loading errors
      book.on('openFailed', (error) => {
        console.error("Book open failed:", error);
        setError(`Failed to open book: ${error.message || "Unknown error"}`);
        setLoading(false);
      });

      // Render the book
      const rendition = book.renderTo(viewerRef.current, {
        width: "100%",
        height: "85vh",
        allowScriptedContent: true,
      });

      renditionRef.current = rendition;

      // Wait for book to be ready
      await book.ready;
      const metadata = await book.loaded.metadata;
      setBookTitle(metadata?.title || filename || "Untitled Book");

      // Generate locations for pagination
      await book.locations.generate(1000);
      setTotalPages(book.locations.length());

      // Restore previous reading position
      const savedCfi = localStorage.getItem(`book-position-${filename}`);
      await rendition.display(savedCfi || undefined);

      // Track reading progress
      rendition.on("relocated", (location) => {
        const cfi = location?.start?.cfi;
        if (!cfi) return;

        const percent = book.locations.percentageFromCfi(cfi);
        setProgress(Math.floor(percent * 100) || 0);
        setCurrentPage(book.locations.locationFromCfi(cfi) + 1 || 1);
        localStorage.setItem(`book-position-${filename}`, cfi);
      });

      setLoading(false);
    } catch (err) {
      console.error("Error loading book:", err);
      
      // Retry logic
      if (retryAttempt < 3) {
        console.log(`Retrying... attempt ${retryAttempt + 1}`);
        setError(`Loading failed. Retrying... (${retryAttempt + 1}/3)`);
        setRetryCount(retryAttempt + 1);
        
        const delay = Math.pow(2, retryAttempt) * 1000;
        setTimeout(() => {
          loadBookWithRetry(retryAttempt + 1);
        }, delay);
      } else {
        setError(`Failed to load book after multiple attempts. Please try again later.`);
        setLoading(false);
      }
    }
  }, [filename, navigate]);

  useEffect(() => {
    loadBookWithRetry();
    
    // Clean up on unmount
    return () => {
      if (renditionRef.current) {
        renditionRef.current.destroy();
      }
      
      if (bookRef.current) {
        // Clean up blob URL if it exists
        if (bookRef.current.bookUrl) {
          URL.revokeObjectURL(bookRef.current.bookUrl);
        }
        bookRef.current.destroy();
      }
    };
  }, [loadBookWithRetry]);

  // Handle manual retry
  const handleRetry = () => {
    setRetryCount(0);
    loadBookWithRetry(0);
  };

  return (
    <div className="reader-container">
      <Navbar />
      <div className="reader-header">
        <h1>📚 {bookTitle}</h1>
      </div>

      {loading && (
        <div className="reader-loading">
          <p>Loading your book{retryCount > 0 ? ` (attempt ${retryCount + 1}/4)` : ''}...</p>
        </div>
      )}

      {error && (
        <div className="reader-error">
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-btn">Try Again</button>
          <button onClick={() => navigate(-1)} className="back-btn">Go Back</button>
        </div>
      )}

      <div ref={viewerRef} className="reader-viewer" />

      {!loading && !error && (
        <>
          <div className="reader-controls">
            <button onClick={prevPage} className="nav-btn">← Previous Page</button>
            <button onClick={nextPage} className="nav-btn">Next Page →</button>
          </div>

          <div className="reader-footer">
            <span>{progress}% read | Page {currentPage} of {totalPages || '?'}</span>
          </div>
        </>
      )}
    </div>
  );
}