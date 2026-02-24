import React, { useState } from "react";
import "./Home.css";

function Home() {
  const [output, setOutput] = useState("Waiting...");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadAudio = async () => {
    if (!file) {
      alert("Select file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      setOutput(
        `${data.prediction} (Confidence: ${(data.confidence*100).toFixed(2)}%)`
      );
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Audio Deepfake Detection</h2>

      <input type="file" accept="audio/*" onChange={handleFileChange} />

      <br /><br />

      <button onClick={uploadAudio} disabled={loading}>
        {loading ? "Checking..." : "Detect Audio"}
      </button>

      <p>{output}</p>
    </div>
  );
}

export default Home;