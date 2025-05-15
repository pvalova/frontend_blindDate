import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./BookDiscoveryPage.css";
import Navbar from "../components/Navbar";

// Card dimensions constants at the top level
const CARD_WIDTH = 300; // Width of each card in pixels
const CARD_GAP = 20; // Gap between cards in pixels

export default function BookDiscoveryPage() {
  const carouselRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookThemes, setBookThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Hardwired to local FastAPI for testing
        const response = await fetch(`https://blinddatebackend.azurewebsites.net/books/mystery-books`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch mystery books");
        }

        const booksData = await response.json();
        if (booksData && booksData.length > 0) {
          setBookThemes(booksData);
        } else {
          setBookThemes([
            {
              id: 1,
              theme: "Rainy Afternoon Escape",
              description: "A book that feels like warm tea during a thunderstorm.",
              backgroundColor: "#F5F5F0"
            },
            {
              id: 2,
              theme: "Break My Heart, Please",
              description: "A love story that will wreck you in the best way.",
              backgroundColor: "#F5F5F0"
            },
            {
              id: 3,
              theme: "Secrets in the Attic",
              description: "A story full of hidden truths, dusty letters, and late-night discoveries.",
              backgroundColor: "#F5F5F0"
            },
            {
              id: 4,
              theme: "Midnight in the Forgotten Garden",
              description: "Whispers of old letters, hidden pathways, and moonlit confessions.",
              backgroundColor: "#F5F5F0"
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching mystery books:", error);
        setBookThemes([
          {
            id: 1,
            theme: "Rainy Afternoon Escape",
            description: "A book that feels like warm tea during a thunderstorm.",
            backgroundColor: "#F5F5F0"
          },
          {
            id: 2,
            theme: "Break My Heart, Please",
            description: "A love story that will wreck you in the best way.",
            backgroundColor: "#F5F5F0"
          },
          {
            id: 3,
            theme: "Secrets in the Attic",
            description: "A story full of hidden truths, dusty letters, and late-night discoveries.",
            backgroundColor: "#F5F5F0"
          },
          {
            id: 4,
            theme: "Midnight in the Forgotten Garden",
            description: "Whispers of old letters, hidden pathways, and moonlit confessions.",
            backgroundColor: "#F5F5F0"
          },
          {
            id: 5,
            theme: "Laugh Until It Hurts",
            description: "Witty, hilarious, and guaranteed to brighten your day.",
            backgroundColor: "#F5F5F0"
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [navigate]);


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
  }, [bookThemes]); // Update when bookThemes changes

  // Scroll handler that ensures perfect transitions
  const scrollCarousel = (direction) => {
    if (carouselRef.current && bookThemes.length > 0) {
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

  // Updated to navigate to the reveal page
  const handleGetBook = (bookId) => {
    navigate(`/mystery/${bookId}/reveal`);
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
      if (!carouselRef.current || bookThemes.length === 0) return;
      
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
        
        {isLoading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '40px',
            color: '#5D4037',
            fontSize: '1.2rem'
          }}>
            Loading mystery books...
          </div>
        ) : (
          <div className="carousel-container">
            <button className="carousel-arrow left-arrow" onClick={scrollLeft}>
              &larr;
            </button>
            
            <div className="carousel" ref={carouselRef}>
              {duplicatedThemes.map((theme, index) => (
                <div 
                  className="book-card" 
                  key={`${theme.id}-${index}`} 
                  style={{ backgroundColor: theme.backgroundColor || "#F5F5F0" }}
                >
                  <div className="book-card-content">
                    <h2>{theme.theme}</h2>
                    <p>{theme.description}</p>
                    
                    <div className="book-theme-icon">
                      <img src="/logoheart.png" alt={theme.theme} className="theme-logo" />
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
        )}
      </main>
    </div>
  );
}