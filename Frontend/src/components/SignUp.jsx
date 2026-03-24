import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import "./Auth.css";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate(); 

 const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg(""); 
    
    const CleanName = name.trim();
    const CleanEmail = email.trim();
    const CleanPassword = password.trim();
    
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,}$/;
    
    if (!passwordRegex.test(CleanPassword)) {
      setErrorMsg("Password must be at least 7 characters, with 1 number and 1 special symbol.");
      return; 
    }

    try {
      setIsLoading(true);
      
      const response = await fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: CleanName, 
          email: CleanEmail, 
          password: CleanPassword 
        }) 
      });

      const data = await response.json();

    if (response.ok) {
        localStorage.setItem("user", JSON.stringify({ 
          name: CleanName, 
          email: CleanEmail 
        }));
        
        alert("Account created! Welcome to Voice Shield.");
        
        // Broadcast the update to the Navbar!
        window.dispatchEvent(new Event("authChange"));
        navigate("/"); 

      } else if (response.status === 409) {
        setErrorMsg("An account with this email already exists. Please sign in instead.");
      } else {
        setErrorMsg(data.error || "Failed to create account.");
      }
    } catch (err) {
      setErrorMsg("Server error. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };


//Google Signup & if user exists signin
const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true); 
        setErrorMsg("");

        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await res.json();

        const backendRes = await fetch("http://127.0.0.1:5000/google-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: googleUser.name,
            email: googleUser.email,
            profile_pic: googleUser.picture,
            action: "signup" 
          }),
        });

        const data = await backendRes.json();

        if (backendRes.ok) {
          localStorage.setItem("user", JSON.stringify({ 
            name: data.name, 
            email: data.email,
            profile_pic: data.profile_pic
          }));
          
          // Broadcast the update to the Navbar!
          window.dispatchEvent(new Event("authChange"));
          navigate("/"); 
        } else if (backendRes.status === 409) {
          alert("Account already exists with this Google email. Please go to Sign In.");
        } else {
          setErrorMsg(data.error || "Google Auth failed.");
        }
      } catch (err) {
        setErrorMsg("Failed to connect to backend.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setErrorMsg("Google Login Failed"),
  });

  //Github Login Function (Added the missing scope variable here!)
  const handleGithubLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const scope = "read:user user:email"; 
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}&state=signup`;
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2 className="title-center">Create Account</h2>
        
        {errorMsg && <p style={{ color: "#ff0055", textAlign: "center", marginBottom: "1rem" }}>{errorMsg}</p>}

        <form onSubmit={handleSignUp}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              required 
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              className="form-input" 
              required 
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className='form-group'>
            <label>Password</label>
            <div className="password-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-input" 
                required 
                placeholder="••••••••"
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="divider">or register with</div>

        <div className="social-container">
          <button className="btn-social" title="Google" type="button" onClick={() => googleLogin()}>
            <svg viewBox="0 0 24 24">
              <path fill="#ea4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
              <path fill="#34a853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 01-6.723-4.823l-4.04 3.067A11.965 11.965 0 0012 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z"/>
              <path fill="#4a90e2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21z"/>
              <path fill="#fbbc05" d="M5.277 14.268A7.12 7.12 0 014.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 000 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z"/>
            </svg>
          </button>
            
          <button className="btn-social" title="GitHub" type="button" onClick={()=>handleGithubLogin()}>
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </button>

          <button className="btn-social" title="Facebook">
            <svg viewBox="0 0 24 24">
              <path fill="#1877f2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/signin" style={{ color: 'var(--primary-accent)' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;