import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./Auth.css";

const SignIn = () => {
  // 1. Setup State to hold the user's input and UI feedback
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // NEW: State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate(); // Used to redirect after a successful login

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // Clear any old errors when they try again
    
    // Moved inside function
    const CleanEmail = email.trim();
    const CleanPassword = password.trim();

    try {
      setIsLoading(true);

      // 2. Send the login request to your Flask backend
      const response = await fetch("http://127.0.0.1:5000/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: CleanEmail, 
          password: CleanPassword
        }) 
      });

      const data = await response.json();

      // 3. Handle the backend's response
      if (response.ok) {
        // ================================================================
        // THE MAGIC LINE: Saves the user data so the Navbar knows they are logged in!
        // ================================================================
        localStorage.setItem("user", JSON.stringify({ name: data.name, email: data.email }));
        
        // Login successful! 
        alert(`Welcome back, ${data.name}!`);
        
        // Redirect them to the main scanner page
        navigate("/"); 
      } else {
        // Login failed (e.g., wrong password, email doesn't exist)
        setErrorMsg(data.error || "Failed to sign in.");
      }
    } catch (err) {
      setErrorMsg("Server error. Is the Flask backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2 className="title-center">Welcome Back</h2>
        
        {/* Display error messages dynamically */}
        {errorMsg && (
          <p style={{ color: "#ff0055", textAlign: "center", marginBottom: "1rem", fontWeight: "bold" }}>
            {errorMsg}
          </p>
        )}

        <form onSubmit={handleSignIn}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              className="form-input" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            {/* --- NEW: Password Wrapper with Toggle --- */}
            <div className="password-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-input" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? (
                  /* Eye Slash SVG (Hidden) */
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  /* Eye SVG (Visible) */
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {/* ----------------------------------------- */}
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* --- Social Login Section --- */}
        <div className="divider">or continue with</div>
        
        <div className="social-container">
          <button className="btn-social" title="Google">
            {/* Google SVG */}
            <svg viewBox="0 0 24 24">
              <path fill="#ea4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
              <path fill="#34a853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 01-6.723-4.823l-4.04 3.067A11.965 11.965 0 0012 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z"/>
              <path fill="#4a90e2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21z"/>
              <path fill="#fbbc05" d="M5.277 14.268A7.12 7.12 0 014.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 000 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z"/>
            </svg>
          </button>

          <button className="btn-social" title="X (Twitter)">
            {/* X SVG */}
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </button>

          <button className="btn-social" title="Facebook">
            {/* Facebook SVG */}
            <svg viewBox="0 0 24 24">
              <path fill="#1877f2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
        </div>
        {/* ------------------------------- */}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--primary-accent)' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;