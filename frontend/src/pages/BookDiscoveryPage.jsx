import React, { useState, useRef, useEffect } from "react";
import "./BookDiscoveryPage.css";
import Navbar from "../components/Navbar";

// Card dimensions constants at the top level
const CARD_WIDTH = 300; // Width of each card in pixels
const CARD_GAP = 20; // Gap between cards in pixels

export default function BookDiscoveryPage() {
  const carouselRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mock book theme data - would come from API in production
  const bookThemes = [
    {
      id: 1,
      title: "Rainy Afternoon Escape",
      description: "A book that feels like warm tea during a thunderstorm.",
      backgroundColor: "#F5F5F0"
    },
    {
      id: 2,
      title: "Break My Heart, Please",
      description: "A love story that will wreck you in the best way.",
      backgroundColor: "#F5F5F0"
    },
    {
      id: 3,
      title: "Secrets in the Attic",
      description: "A story full of hidden truths, dusty letters, and late-night discoveries.",
      backgroundColor: "#F5F5F0"
    },
    {
      id: 4,
      title: "Adventure Awaits",
      description: "For when you need to escape to faraway lands and breathtaking journeys.",
      backgroundColor: "#F5F5F0"
    },
    {
      id: 5,
      title: "Laugh Until It Hurts",
      description: "Witty, hilarious, and guaranteed to brighten your day.",
      backgroundColor: "#F5F5F0"
    }
  ];

  // Create duplicate items for true infinite scrolling
  // We duplicate the array to ensure we never run out of items when scrolling
  const duplicatedThemes = [...bookThemes, ...bookThemes];
  
  // Initialize carousel position
  useEffect(() => {
    if (carouselRef.current) {
      // Start at the beginning
      carouselRef.current.scrollLeft = 0;
      setCurrentIndex(0);
    }
  }, []);

  // Scroll handler that ensures perfect transitions
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      let newIndex;
      
      if (direction === "left") {
        // Go backward, wrapping to end if at beginning
        newIndex = currentIndex <= 0 ? bookThemes.length - 1 : currentIndex - 1;
      } else {
        // Go forward, wrapping to beginning if at end
        newIndex = (currentIndex + 1) % bookThemes.length;
      }
      
      // Update the current index
      setCurrentIndex(newIndex);
      
      // Calculate precise scroll position
      const scrollPosition = newIndex * (CARD_WIDTH + CARD_GAP);
      
      // Smooth scroll to the target position
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      
      // Special handling for wrap-around case
      if ((direction === "right" && newIndex === 0) || 
          (direction === "left" && newIndex === bookThemes.length - 1)) {
        // We've hit a boundary, handle the wrap-around
        // This ensures immediate looping without needing multiple clicks
      }
    }
  };
  
  // Handlers for scrolling
  const scrollLeft = () => scrollCarousel("left");
  const scrollRight = () => scrollCarousel("right");

  // Handle click on a book
  const handleGetBook = (bookId) => {
    // In a real app, this would reserve or select the mystery book
    console.log(`Selected book theme: ${bookId}`);
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would filter books or fetch from API
    console.log(`Searching for: ${searchText}`);
  };

  // Monitor scroll position to handle infinite looping
  useEffect(() => {
    const handleScroll = () => {
      if (!carouselRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      
      // If we're at the end, jump to the beginning
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        // We're near the end, prepare to loop
        setTimeout(() => {
          // Reset to the duplicate beginning without animation
          carouselRef.current.scrollTo({
            left: 0,
            behavior: 'auto'
          });
          setCurrentIndex(0);
        }, 300); // Slight delay to allow current scroll to finish
      }
      
      // If we're at the beginning and going backward, jump to the end
      if (scrollLeft <= 10 && currentIndex === bookThemes.length - 1) {
        // We're at the beginning but should be at the end
        setTimeout(() => {
          // Jump to the end of the original set
          const endIndex = bookThemes.length - 1;
          const endPosition = endIndex * (CARD_WIDTH + CARD_GAP);
          carouselRef.current.scrollTo({
            left: endPosition,
            behavior: 'auto'
          });
        }, 300); // Slight delay to allow current scroll to finish
      }
    };
    
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (carousel) {
        carousel.removeEventListener('scroll', handleScroll);
      }
    };
  }, [currentIndex, bookThemes.length]);

  return (
    <div className="discovery-container">
      <Navbar />
      
      <main className="discovery-main">
        <h1 className="discovery-title">Pick a book that fits your current mood</h1>
        
        <div className="search-container">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Hinted search text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <span className="search-icon">🔍</span>
            </button>
          </form>
        </div>
        
        <div className="carousel-container">
          <button className="carousel-arrow left-arrow" onClick={scrollLeft}>
            &larr;
          </button>
          
          <div className="carousel" ref={carouselRef}>
            {duplicatedThemes.map((theme, index) => (
              <div 
                className="book-card" 
                key={`${theme.id}-${index}`} 
                style={{ backgroundColor: theme.backgroundColor }}
              >
                <div className="book-card-content">
                  <h2>{theme.title}</h2>
                  <p>{theme.description}</p>
                  
                  <div className="book-theme-icon">
                    <img src="/logoheart.png" alt={theme.title} className="theme-logo" />
                  </div>
                  
                  <button 
                    className="get-book-btn"
                    onClick={() => handleGetBook(theme.id)}
                  >
                    Get Mystery Book
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button className="carousel-arrow right-arrow" onClick={scrollRight}>
            &rarr;
          </button>
        </div>
      </main>
    </div>
  );
}