import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const location = useLocation(); 
  const navigate = useNavigate();

  // 1. The Safety-First Checker
  const checkAuthStatus = () => {
    try {
      const loggedInUser = localStorage.getItem("user");
      
      // Ensure we didn't accidentally save the word "undefined" or "null"
      if (loggedInUser && loggedInUser !== "undefined" && loggedInUser !== "null") {
        const parsedUser = JSON.parse(loggedInUser);
        console.log("Navbar sees user:", parsedUser); // <-- This will help us debug!
        setUser(parsedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Navbar failed to read local storage:", error);
      setUser(null); // Fallback to guest mode if data is corrupted
    }
  };

  // 2. ONLY attach the event listener ONCE when the Navbar first loads
  useEffect(() => {
    // Run an initial check
    checkAuthStatus();
    
    // Set up the radio antenna for our broadcast signal
    window.addEventListener("authChange", checkAuthStatus);
    
    // Clean up when the app closes
    return () => {
      window.removeEventListener("authChange", checkAuthStatus);
    };
  }, []); // <-- Empty array means this listener never gets interrupted!

  // 3. Keep checking every time the page URL changes
  useEffect(() => {
    checkAuthStatus();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("authChange")); 
    navigate("/signin");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">Voice Shield</Link>

      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        
        {user && <Link to="/records" className="nav-link">Records</Link>}
        
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/contact" className="nav-link">Contact</Link>

        {/* Conditional Rendering */}
        {!user ? (
          <>
            <Link to="/signin" className="nav-link">Sign In</Link>
            <Link to="/signup" className="nav-link highlight-btn">Sign Up</Link>
          </>
        ) : (
          <div className="profile-section" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="avatar" title={user.email} style={{ width: '40px', height: '40px' }}>
              {user.profile_pic ? (
                <img 
                  src={user.profile_pic} 
                  alt={user.name} 
                  className="avatar-img" 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#555', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </div>
            <button onClick={handleLogout} className="nav-link logout-btn" style={{ background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;