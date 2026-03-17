import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import your components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import About from "./components/About";
import Contact from "./components/Contact";
import SignIn from "./components/Signin";
import SignUp from "./components/Signup";
import ScrollToTop from "./components/ScrollToTop";

// Import your global styles
import "./App.css";

function App() {
  return (
    <Router>
      <ScrollToTop />
      {/* Navbar stays at the top of every page */}
      <Navbar />

      {/* Routes decide which component to load in the middle based on the URL */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>

      {/* Footer stays at the bottom of every page */}
      <Footer />
    </Router>
  );
}

export default App;