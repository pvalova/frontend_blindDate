import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./ProfilePage.css";

export default function ProfilePage() {
  const [user, setUser] = useState({
    full_name: "",
    email: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // In ProfilePage.jsx, modify the fetchUserData function:
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Directly use the Azure URL instead of relying on proxy
        const response = await fetch(`https://blinddatebackend.azurewebsites.net/users/me/`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        setUser(userData);
        setEditedName(userData.full_name);
        setEditedEmail(userData.email);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Don't immediately remove token on error
        if (error.message === "No token found") {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleEditName = () => {
    setIsEditingName(true);
  };

  const handleEditEmail = () => {
    setIsEditingEmail(true);
  };

  const handleSaveName = () => {
    // In a real app, this would call an API to update the user's name
    console.log(`Editing name: ${editedName}`);
    setIsEditingName(false);
  };

  const handleSaveEmail = () => {
    // In a real app, this would call an API to update the user's email
    console.log(`Editing email: ${editedEmail}`);
    setIsEditingEmail(false);
  };

  const handleSaveChanges = async () => {
    // In a real app, this would call an API to update all user data
    console.log(`Saving changes: Name - ${editedName}, Email - ${editedEmail}`);
    setUser({ 
      ...user, 
      full_name: editedName,
      email: editedEmail 
    });
    // Reset editing states
    setIsEditingName(false);
    setIsEditingEmail(false);
  };

  const handleChangePassword = () => {
    // In a real app, this would open a password change form
    console.log("Change password clicked");
    alert("Password change functionality would be implemented here");
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <Navbar />
      
      <div className="profile-content">
        {/* Left Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              {user.full_name.charAt(0)}
            </div>
            <div className="edit-avatar-icon">
              <span role="img" aria-label="edit">✏️</span>
            </div>
          </div>
          
          <h2 className="sidebar-name">{user.full_name}</h2>
          
          <nav className="profile-nav">
            <button 
              className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => handleSectionChange('profile')}
            >
              Profile
            </button>
            <button 
              className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => handleSectionChange('settings')}
            >
              Settings
            </button>
            <button 
              className={`nav-item ${activeSection === 'subscription' ? 'active' : ''}`}
              onClick={() => handleSectionChange('subscription')}
            >
              Manage subscription
            </button>
          </nav>
        </div>
        
        {/* Main Content Area */}
        <div className="profile-main">
          {activeSection === 'profile' && (
            <div className="profile-section">
              <h1>Profile</h1>
              
              <div className="profile-form">
                <div className="form-group">
                  <label>Name</label>
                  <div className="input-group">
                    {isEditingName ? (
                      <>
                        <input 
                          type="text" 
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          autoFocus
                        />
                        <button className="edit-button" onClick={handleSaveName}>
                          <span role="img" aria-label="done">✓</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="display-value">{user.full_name}</div>
                        <button className="edit-button" onClick={handleEditName}>
                          <span role="img" aria-label="edit">✏️</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <div className="input-group">
                    {isEditingEmail ? (
                      <>
                        <input 
                          type="email" 
                          value={editedEmail}
                          onChange={(e) => setEditedEmail(e.target.value)}
                          autoFocus
                        />
                        <button className="edit-button" onClick={handleSaveEmail}>
                          <span role="img" aria-label="done">✓</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="display-value">{user.email}</div>
                        <button className="edit-button" onClick={handleEditEmail}>
                          <span role="img" aria-label="edit">✏️</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="form-actions">
                  <button className="save-changes-btn" onClick={handleSaveChanges}>
                    Save Changes
                  </button>
                  <button className="password-change-btn" onClick={handleChangePassword}>
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'settings' && (
            <div className="settings-section">
              <h1>Settings</h1>
              <p>Settings options will be displayed here.</p>
            </div>
          )}
          
          {activeSection === 'subscription' && (
            <div className="subscription-section">
              <h1>Manage Subscription</h1>
              <p>Subscription management options will be displayed here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}