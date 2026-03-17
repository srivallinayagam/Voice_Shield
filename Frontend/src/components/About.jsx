import React from 'react';
import './Auth.css';

const About = () => {
  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: '800px' }}>
        <h2>About Our Technology</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          In an era where synthetic media is increasingly indistinguishable from reality, 
          our neural network provides a critical layer of verification.
        </p>
        <p style={{ color: 'var(--text-muted)' }}>
          By analyzing high-frequency Mel-spectrograms, our CNN model detects the microscopic 
          acoustic anomalies left behind by generative AI voice cloning software. Whether you are 
          verifying a caller's identity or authenticating media, our system delivers high-confidence 
          results in seconds.
        </p>
      </div>
    </div>
  );
};

export default About;