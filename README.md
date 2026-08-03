# 🎙️ VoiceShield - AI Voice Deepfake Detection

VoiceShield is a web application that detects whether an uploaded voice recording is **Human (Real)** or **AI-Generated (Fake)** using a Convolutional Neural Network (CNN). Users can upload audio in various formats, and the system predicts the result along with a confidence score.

---

## 🚀 Features

- Upload audio files in multiple formats
- Automatic audio conversion using **FFmpeg**
- Detects whether the voice is:
  - 🟢 Human (Real)
  - 🔴 AI-Generated (Fake)
- Displays prediction confidence (e.g., **Real: 90%**, **Fake: 80%**)
- Responsive React-based user interface
- Flask REST API backend
- CNN-based deep learning model
- Hosted AI model on Hugging Face
- Backend deployment on Render

---

## 🛠️ Tech Stack

### Frontend
- React.js
- HTML
- CSS
- JavaScript

### Backend
- Python
- Flask
- Flask-CORS

### AI & Audio Processing
- Convolutional Neural Network (CNN)
- FFmpeg
- Librosa
- NumPy
- TensorFlow/Keras
- Kaggle ASVspoof 2019 Dataset

### Deployment
- Hugging Face (Model Hosting)
- Render (Backend Hosting)

---

## 📂 Dataset

This project is trained using the **ASVspoof 2019** dataset obtained from **Kaggle**. The dataset contains genuine and spoofed speech samples designed for research in automatic speaker verification and audio deepfake detection.

**Dataset:** Kaggle - ASVspoof 2019

---

## 📂 Project Structure

```text
VoiceShield/
│
├── frontend/          # React application
├── backend/           # Flask API
├── model/             # CNN model files
├── uploads/           # Temporary uploaded files
├── requirements.txt
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/VoiceShield.git
cd VoiceShield
```

### 2. Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
```

> **Note:** Make sure **FFmpeg** is installed and added to your system PATH.

### 3. Frontend Setup

```bash
cd frontend

npm install
```

---

## ▶️ Running the Project

### Start the Flask Backend

```bash
cd backend
python app.py
```

Backend:

```
http://localhost:5000
```

### Start the React Frontend

```bash
cd frontend
npm start
```

Frontend:

```
http://localhost:3000
```

---

## 🔄 How It Works

1. Upload an audio file.
2. The backend receives the audio.
3. FFmpeg converts the audio into a supported format.
4. Audio features are extracted and preprocessed.
5. The CNN model classifies the audio as **Real** or **Fake**.
6. The prediction confidence is returned to the frontend.
7. The result is displayed to the user.

---

## 📊 Example Output

| Prediction | Confidence |
|------------|-----------:|
| 🟢 Real (Human) | 90% |
| 🔴 Fake (AI) | 80% |

---

## 🌐 Live Demo

**Demo:** *Coming Soon*

---

## 🤖 Model

**Hugging Face:** *Coming Soon*

---

## 📜 License

This project is developed for educational and research purposes.
