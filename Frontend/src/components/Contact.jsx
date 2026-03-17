import React, { useState } from 'react';
import './Auth.css';

const Contact = () => {
  // 1. Setup State to hold the user's input and UI feedback
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ text: "", type: "" }); // Clear previous messages

    const CleanName = name.trim();
    const CleanEmail = email.trim();
    const CleanMessage = message.trim();

    try {
      setIsLoading(true);

      // 2. Send the contact data to your Flask backend
      const response = await fetch("http://127.0.0.1:5000/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: CleanName, 
          email: CleanEmail, 
          message: CleanMessage 
        }) // <--- explicitly mapping the keys here!
      });

      const data = await response.json();

      // 3. Handle the backend's response
      if (response.ok) {
        setStatusMsg({ text: data.message || "Message sent successfully!", type: "success" });
        // Clear the form fields after a successful send
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatusMsg({ text: data.error || "Failed to send message.", type: "error" });
      }
    } catch (err) {
      setStatusMsg({ text: "Server error. Is the Flask backend running?", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2 className="title-center">Contact Support</h2>
        
        {/* Dynamic Status Message Display */}
        {statusMsg.text && (
          <p style={{ 
            color: statusMsg.type === "success" ? "var(--primary-accent)" : "#ff0055", 
            textAlign: "center", 
            marginBottom: "1rem", 
            fontWeight: "bold",
            textShadow: statusMsg.type === "success" ? "var(--glow-shadow)" : "none"
          }}>
            {statusMsg.text}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
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
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              required 
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea 
              className="form-input" 
              rows="4" 
              required 
              placeholder="How can we help?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;