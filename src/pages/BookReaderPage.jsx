import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ePub from "epubjs";
import "./BookReaderPage.css";
import Navbar from "../components/Navbar";

export default function BookReaderPage() {
  const { filename } = useParams();
  const bookRef = useRef(null);
  const viewerRef = useRef(null);
  const renditionRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [bookTitle, setBookTitle] = useState("Loading...");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const nextPage = () => {
    renditionRef.current?.next();
  };

  const prevPage = () => {
    renditionRef.current?.prev();
  };

  useEffect(() => {
    const loadBook = async () => {
      try {
        // Fixed URL to use the backend endpoint
        const token = localStorage.getItem("token");
        const res = await fetch(`https://blinddatebackend.azurewebsites.net/books/read/${filename}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          throw new Error("Failed to load book");
        }
        
        const data = await res.json();

        if (bookRef.current) {
          bookRef.current.destroy();
          viewerRef.current.innerHTML = ""; // Clear old content
        }

        const book = ePub(data.url);
        bookRef.current = book;

        const rendition = book.renderTo(viewerRef.current, {
          width: "100%",
          height: "85vh",
          allowScriptedContent: true,
        });

        renditionRef.current = rendition;

        await book.ready;
        const metadata = await book.loaded.metadata;
        setBookTitle(metadata?.title || "Untitled Book");

        await book.locations.generate(1000);
        setTotalPages(book.locations.length());

        const savedCfi = localStorage.getItem(`book-position-${filename}`);
        await rendition.display(savedCfi || undefined);

        rendition.on("relocated", (location) => {
          const cfi = location?.start?.cfi;
          if (!cfi) return;

          const percent = Math.floor(book.locations.percentageFromCfi(cfi) * 100);
          const page = book.locations.locationFromCfi(cfi) + 1;
          setProgress(percent);
          setCurrentPage(page);
          localStorage.setItem(`book-position-${filename}`, cfi);
        });
      } catch (err) {
        console.error("Error loading book:", err);
      }
    };

    loadBook();

    // Clean up on unmount
    return () => {
      renditionRef.current?.destroy();
      bookRef.current?.destroy();
    };
  }, [filename]);

  return (
    <div className="reader-container">
      <Navbar />
      <div className="reader-header">
        <h1>📚 {bookTitle}</h1>
      </div>

      <div ref={viewerRef} className="reader-viewer" />

      <div className="reader-controls">
        <button onClick={prevPage}>← Prev</button>
        <button onClick={nextPage}>Next →</button>
      </div>

      <div className="reader-footer">
        <span>{progress}% read | Page {currentPage} of {totalPages}</span>
      </div>
    </div>
  );
}