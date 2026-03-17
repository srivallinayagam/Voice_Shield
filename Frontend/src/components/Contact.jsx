import React from 'react';
import './Auth.css';

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent! We will get back to you shortly.");
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2 className="title-center">Contact Support</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" className="form-input" required placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-input" required placeholder="john@example.com" />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea className="form-input" rows="4" required placeholder="How can we help?"></textarea>
          </div>
          <button type="submit" className="btn-primary">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;