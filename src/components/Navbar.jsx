import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/dashboard" className="navbar-logo">
          <img src="/logoheart.png" alt="Blind Date with a Book" className="navbar-logo-img" />
          <span className="navbar-logo-text">
            Blind date with <span className="accent">a book</span>
          </span>
        </Link>
      </div>

      {/* Combined navigation elements on the right */}
      <div className="navbar-right">
        <div className="navbar-center">
          <Link to="/mystery" className="nav-link">Mystery</Link>
          <Link to="/swap" className="nav-link">Swap</Link>
          <Link to="/books" className="nav-link">Books</Link>
        </div>
        
        <div ref={dropdownRef}>
          <button 
            className="profile-btn"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-label="Profile menu"
          >
            <div className="profile-icon">
              <span className="profile-initial">
                {/* Display user initial or default icon */}
                {localStorage.getItem("userInitial") || "U"}
              </span>
            </div>
          </button>

          {showDropdown && (
            <div className="profile-dropdown">
              <Link to="/profile" className="dropdown-item">Profile</Link>
              <Link to="/bookshelf" className="dropdown-item">My Bookshelf</Link>
              <button onClick={handleLogout} className="dropdown-item logout-item">
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}