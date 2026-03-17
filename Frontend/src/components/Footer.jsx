import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Audio Deepfake Detection. All rights reserved.</p>
    </footer>
  );
};

export default Footer;