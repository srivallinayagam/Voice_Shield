import React, { useState, useRef, useEffect } from "react"; 
import "./Home.css";

function Home() {
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  
  // Reference to secretly click the hidden file input
  const fileInputRef = useRef(null);

  // ======================================================================
  // --- GITHUB OAUTH CATCHER ---
  // ======================================================================
  useEffect(() => {
    // 1. Check the URL for GitHub's return parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    // 2. If we caught a code, we know they just got back from GitHub!
    if (code) {
      console.log("GitHub Code caught:", code);
      
      // 3. Send this code to Flask to exchange it for the user profile
      fetch("http://127.0.0.1:5000/github-login", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((userData) => {
          if (userData.error) {
            console.error("GitHub Auth Error:", userData.error);
          } else {
            console.log("Successfully fetched user profile!", userData);
            
            // 1. Save the user data
            localStorage.setItem("user", JSON.stringify(userData));
            
            // 2. THIS IS THE FIX: Shout into the void so the Navbar hears it and updates!
            window.dispatchEvent(new Event("authChange"));
          }
        });
    }
  }, []);
  // ======================================================================

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setAudioURL(URL.createObjectURL(selectedFile));
    setOutput(null); // Reset output when a new file is chosen
  };

  const uploadAudio = async () => {
    if (!file) {
      alert("Please select an audio file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    // --- Attach user data to the scan so the database can save it! ---
    const userData = localStorage.getItem("user");
    if (userData) {
      const { email } = JSON.parse(userData);
      formData.append("email", email);
    }

    // Attach the file size so it looks nice in the table (converts bytes to MB)
    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    formData.append("size", `${fileSizeInMB} MB`);

    try {
      setLoading(true);
      setOutput(null);

      // Make sure your Flask backend is running!
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        setOutput(`Error: ${data.error}`);
      } else {
        // Storing as an object to easily style the prediction vs confidence
        setOutput({
          prediction: data.prediction,
          confidence: data.confidence,
        });
      }
    } catch (err) {
      setOutput("Error: Server connection failed. Is the Flask backend running?");
    } finally {
      setLoading(false);
    }
  };

  // Determine border and text colors based on the result
  const isFake = output?.prediction === "Fake Voice";
  const resultColor = isFake ? "#ff0055" : "var(--primary-accent)";
  const resultShadow = isFake ? "0 0 15px rgba(255, 0, 85, 0.4)" : "var(--glow-shadow)";

  return (
    <div className="page-container home-container">
      <h1 className="hero-title">
        Audio Deepfake <span>Scanner</span>
      </h1>
      <p className="hero-subtitle">
        Upload an audio file to analyze for synthetic manipulation and AI voice cloning.
      </p>

      {/* The Hidden File Input */}
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />

      {/* The Styled Upload Box */}
      <div 
        className="upload-box" 
        onClick={() => fileInputRef.current.click()}
      >
        <div className="upload-icon">🎙️</div>
        <h3>{file ? file.name : "Click to Select Audio File"}</h3>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
          Supports WAV, MP3, FLAC, M4A, OGG
        </p>
      </div>

      <br />

      {/* Audio Preview and Scan Button */}
      {audioURL && (
        <div style={{ width: "100%", maxWidth: "600px", marginTop: "1rem" }}>
          <audio 
            controls 
            src={audioURL} 
            style={{ width: "100%", marginBottom: "1.5rem", borderRadius: "8px" }}
          ></audio>
          
          <button 
            className="btn-primary" 
            onClick={uploadAudio} 
            disabled={loading}
          >
            {loading ? "Analyzing Audio Signatures..." : "Run Security Scan"}
          </button>
        </div>
      )}

      {/* Results Display Area */}
      {output && (
        <div 
          className="card" 
          style={{ 
            marginTop: "3rem", 
            width: "100%", 
            borderColor: typeof output === 'object' ? resultColor : '#ff0055',
            boxShadow: typeof output === 'object' ? resultShadow : 'none'
          }}
        >
          {typeof output === 'string' ? (
             // Display Server Errors here
            <p style={{ color: "#ff0055", fontWeight: "bold" }}>{output}</p>
          ) : (
            // Display valid predictions here
            <>
              <h2 style={{ color: resultColor, fontSize: "2rem", marginBottom: "0.5rem" }}>
                {output.prediction}
              </h2>
              <p style={{ color: "var(--text-main)", fontSize: "1.1rem" }}>
                Confidence Score: <strong>{output.confidence}%</strong>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;