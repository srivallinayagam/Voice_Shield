import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const location = useLocation(); // Tracks what page we are currently on
  const navigate = useNavigate();

  // Every time the URL changes, check if someone is logged in
  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    } else {
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    // 1. Delete the user from local storage
    localStorage.removeItem("user");
    // 2. Clear the state
    setUser(null);
    // 3. Kick them back to the sign-in page
    navigate("/signin");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">Voice Shield </Link>

      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        
        {/* Only show 'Records' if the user is logged in */}
        {user && <Link to="/records" className="nav-link">Records</Link>}
        
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/contact" className="nav-link">Contact</Link>

        {/* Conditional Rendering for Auth Buttons vs Profile */}
        {!user ? (
          // --- GUEST VIEW ---
          <>
            <Link to="/signin" className="nav-link">Sign In</Link>
            <Link to="/signup" className="nav-link highlight-btn">Sign Up</Link>
          </>
        ) : (
          // --- LOGGED IN VIEW ---

          <div className="profile-section">
          <div className="avatar" title={user.email}>
            {/* 1. Check if user has a profile_pic URL */}
            {user.profile_pic ? (
              <img 
                src={user.profile_pic} 
                alt={user.name} 
                className="avatar-img" 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              /* 2. Fallback to your original letter avatar if no photo */
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <button onClick={handleLogout} className="nav-link logout-btn">
              Logout
           </button>
        </div>
          
           
        )}
      </div>
    </nav>
  );
};

export default Navbar;