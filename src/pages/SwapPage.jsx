import React, { useState, useEffect, useCallback } from "react";  // Add useCallback import
import Navbar from "../components/Navbar";
import "./SwapPage.css";
import { 
  getSwapThemes, 
  getActiveSwaps, 
  getSwapHistory, 
  joinSwap, 
  getUserBooks 
} from "../services/swapService";

export default function SwapPage() {
  const [activeTab, setActiveTab] = useState("themes");
  const [themes, setThemes] = useState([]);
  const [activeSwaps, setActiveSwaps] = useState([]);
  const [swapHistory, setSwapHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // State for book selection modal
  const [showModal, setShowModal] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState(null);
  const [userBooks, setUserBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);

  // Use useCallback to memoize the fetchData function
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    
    try {
      if (activeTab === "themes") {
        const themesData = await getSwapThemes();
        setThemes(themesData);
      } else if (activeTab === "active") {
        const activeSwapsData = await getActiveSwaps();
        setActiveSwaps(activeSwapsData);
      } else if (activeTab === "history") {
        const historyData = await getSwapHistory();
        setSwapHistory(historyData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]); // Add activeTab as a dependency

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleJoinTheme = async (themeId) => {
    setSelectedThemeId(themeId);
    setSelectedBookId(null);
    
    try {
      const books = await getUserBooks();
      
      // Check if books is an array and not empty
      if (!books || !Array.isArray(books) || books.length === 0) {
        setError("You don't have any available books to swap. Please add books to your collection first.");
        return;
      }
      
      setUserBooks(books);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching user books:", err);
      setError("Could not fetch your books. Please add books to your collection first.");
    }
  };

  const handleSelectBook = (book) => {
    // Store the entire book object instead of just the ID
    setSelectedBookId(book.book_id); // Use book_id from UserBook model
  };

  const handleConfirmBookSelection = async () => {
    if (!selectedBookId) {
      setError("Please select a book to swap");
      return;
    }
    
    try {
      await joinSwap(selectedThemeId, selectedBookId);
      setShowModal(false);
      setSuccessMessage("Successfully joined the swap! Wait for a match or check your active swaps.");
      
      // Refresh active swaps if we're on that tab
      if (activeTab === "active") {
        const activeSwapsData = await getActiveSwaps();
        setActiveSwaps(activeSwapsData);
      }
    } catch (err) {
      console.error("Error joining swap:", err);
      setError(err.message);
    }
  };

  const handleCancelSwap = async (swapId) => {
    try {
      await cancelSwap(swapId);
      setSuccessMessage("Swap cancelled successfully");
      
      // Refresh active swaps
      const activeSwapsData = await getActiveSwaps();
      setActiveSwaps(activeSwapsData);
    } catch (err) {
      console.error("Error cancelling swap:", err);
      setError(err.message);
    }
  };

  // Calculate time remaining for a swap
  const getTimeRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    
    if (diffTime <= 0) {
      return "Swap ending soon...";
    }
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${diffDays} days, ${diffHours} hours remaining`;
  };

  return (
    <div className="swap-container">
      <Navbar />
      
      <div className="swap-content">
        <h1 className="swap-title">Book Swap</h1>
        <p className="swap-subtitle">
          Swap books with other readers for a limited time. Join a themed swap room,
          contribute a book, and gain temporary access to someone else's book.
        </p>
        
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError("")}>×</button>
          </div>
        )}
        
        {successMessage && (
          <div className="success-message">
            {successMessage}
            <button onClick={() => setSuccessMessage("")}>×</button>
          </div>
        )}
        
        <div className="swap-tabs">
          <button 
            className={`tab-button ${activeTab === 'themes' ? 'active' : ''}`}
            onClick={() => setActiveTab('themes')}
          >
            Swap Themes
          </button>
          <button 
            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active Swaps
          </button>
          <button 
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Swap History
          </button>
        </div>
        
        {isLoading ? (
          <div className="loading-container">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {/* Themes Tab */}
            {activeTab === 'themes' && (
              <div className="themes-container">
                <h2>Available Swap Themes</h2>
                
                {themes.length > 0 ? (
                  <div className="themes-grid">
                    {themes.map(theme => (
                      <div key={theme.id} className="theme-card">
                        <div className="theme-header">
                          <h3 className="theme-title">{theme.name}</h3>
                        </div>
                        <div className="theme-content">
                          <p className="theme-description">{theme.description}</p>
                          <button 
                            className="join-theme-btn"
                            onClick={() => handleJoinTheme(theme.id)}
                          >
                            Join This Swap
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">📚</div>
                    <p className="empty-state-text">No swap themes available right now. Please check back later!</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Active Swaps Tab */}
            {activeTab === 'active' && (
              <div className="active-swaps-container">
                <h2>Your Active Swaps</h2>
                
                {activeSwaps.length > 0 ? (
                  <div className="active-swaps-grid">
                    {activeSwaps.map(swap => (
                      <div key={swap.id} className="swap-card">
                        <div className="swap-header">
                          <h3 className="swap-theme-name">{swap.theme.name}</h3>
                          <span className={`swap-status ${swap.status}`}>
                            {swap.status === 'pending' ? 'Waiting for Match' : 'Active Swap'}
                          </span>
                        </div>
                        
                        <div className="swap-books">
                          <div className="swap-book outgoing">
                            <h4 className="swap-book-title">{swap.book1_details?.title || "Unknown Book"}</h4>
                            <p className="swap-book-author">by {swap.book1_details?.author || "Unknown"}</p>
                            <span className="swap-direction">Your Book</span>
                          </div>
                          
                          <div className="swap-divider">
                            <div className="swap-arrow">⇄</div>
                          </div>
                          
                          {swap.book2_details ? (
                            <div className="swap-book incoming">
                              <h4 className="swap-book-title">{swap.book2_details.title}</h4>
                              <p className="swap-book-author">by {swap.book2_details.author}</p>
                              <span className="swap-direction">Their Book</span>
                            </div>
                          ) : (
                            <div className="swap-book incoming empty">
                              <p>Waiting for someone to join this swap...</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Show cancel button for pending swaps where the user is the creator */}
                        {swap.status === 'pending' && swap.user1_id === parseInt(localStorage.getItem('userId') || '0') && (
                          <div className="swap-actions">
                            <button 
                              className="cancel-swap-btn"
                              onClick={() => handleCancelSwap(swap.id)}
                            >
                              Cancel Swap
                            </button>
                          </div>
                        )}
                        
                        {swap.status === 'active' && swap.end_date && (
                          <div className="swap-timer">
                            {getTimeRemaining(swap.end_date)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">🔄</div>
                    <p className="empty-state-text">You don't have any active swaps. Join a swap theme to get started!</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Swap History Tab */}
            {activeTab === 'history' && (
              <div className="swap-history-container">
                <h2>Your Swap History</h2>
                
                {swapHistory.length > 0 ? (
                  <div className="active-swaps-grid">
                    {swapHistory.map(swap => (
                      <div key={swap.id} className="swap-card">
                        <div className="swap-header">
                          <h3 className="swap-theme-name">{swap.theme.name}</h3>
                          <span className="swap-completed-date">
                            {new Date(swap.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="swap-books">
                          <div className="swap-book outgoing">
                            <h4 className="swap-book-title">{swap.book1.title}</h4>
                            <p className="swap-book-author">by {swap.book1.author}</p>
                          </div>
                          
                          <div className="swap-divider">
                            <div className="swap-arrow">⇄</div>
                          </div>
                          
                          <div className="swap-book incoming">
                            <h4 className="swap-book-title">{swap.book2.title}</h4>
                            <p className="swap-book-author">by {swap.book2.author}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">📖</div>
                    <p className="empty-state-text">You don't have any swap history yet.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        
        {/* Book Selection Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Select a Book to Swap</h2>
                <button className="close-modal" onClick={() => setShowModal(false)}>×</button>
              </div>
              
              {userBooks.length > 0 ? (
                <>
                  <div className="books-selection-grid">
                    {userBooks.map(book => (
                      <div 
                        key={book.id} 
                        className={`book-selection-card ${selectedBookId === book.book_id ? 'selected' : ''}`}
                        onClick={() => handleSelectBook(book)}
                      >
                        <h4 className="book-title">{book.title}</h4>
                        <p className="book-author">by {book.author}</p>
                        <p className="book-genre">{book.genre}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <button 
                      className="select-book-btn"
                      onClick={handleConfirmBookSelection}
                      disabled={!selectedBookId}
                    >
                      Confirm Selection
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-books-message">
                  <p>You don't have any books available for swapping.</p>
                  <p>Add books to your collection first!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}