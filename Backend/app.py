from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import librosa
import numpy as np
import tensorflow as tf
import os
import uuid
import re

# ==========================================
# FFMPEG LOCAL PATH CONFIGURATION
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FFMPEG_BIN_PATH = os.path.join(BASE_DIR, "ffmpeg", "bin") 
os.environ["PATH"] = FFMPEG_BIN_PATH + os.pathsep + os.environ.get("PATH", "")

# ==========================================
# MONGODB ATLAS CONNECTION
# ==========================================
# IMPORTANT: Put your actual Atlas connection string here
MONGO_URI = "mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority"

try:
    client = MongoClient(MONGO_URI)
    db = client["AuraGuardDB"] 
    users_collection = db["users"] 
    print("Connected to MongoDB Atlas successfully!")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")


app = Flask(__name__)
CORS(app)

# Load AI model once at startup
print("Loading AI Model...")
model = tf.keras.models.load_model("voice_model.h5")
print("AI Model Loaded!")

# ==========================================
# HELPER FUNCTIONS
# ==========================================
def save_audio(file):
    ext = file.filename.split('.')[-1]
    filename = f"temp_{uuid.uuid4()}.{ext}"
    file.save(filename)
    return filename

def extract_spectrogram(path):
    audio, sr = librosa.load(path, sr=16000)
    if len(audio) < 1000:
        raise ValueError("Audio too short")
    audio = librosa.util.normalize(audio)
    audio, _ = librosa.effects.trim(audio)
    mel = librosa.feature.melspectrogram(y=audio, sr=sr, n_mels=128)
    mel_db = librosa.power_to_db(mel, ref=np.max)
    mel_db = librosa.util.fix_length(mel_db, size=128, axis=1)
    mel_db = mel_db[..., np.newaxis]
    return mel_db

def is_valid_password(password):
    if len(password) < 7: return False
    if not re.search(r"\d", password): return False
    if not re.search(r"[!@#$%^&*]", password): return False
    return True

# ==========================================
# ROUTES
# ==========================================
@app.route("/")
def home():
    return "AuraGuard API Running (Audio & Auth)"

# --- 1. AI PREDICTION ROUTE ---
@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error":"No file uploaded"})

    file = request.files["file"]
    temp = None

    try:
        temp = save_audio(file)
        spec = extract_spectrogram(temp)
        spec = np.expand_dims(spec, axis=0)
        prediction = float(model.predict(spec)[0][0])
        result = "Fake Voice" if prediction > 0.5 else "Real Voice"
        confidence = prediction if prediction > 0.5 else 1 - prediction

        return jsonify({
            "prediction": result,
            "confidence": round(confidence * 100, 2)
        })
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        if temp and os.path.exists(temp):
            os.remove(temp)

# --- 2. USER SIGNUP ROUTE ---
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400
    
    if not is_valid_password(password):
        return jsonify({"error": "Password does not meet security requirements"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email is already registered"}), 409

    hashed_password = generate_password_hash(password)

    new_user = {
        "name": name,
        "email": email,
        "password": hashed_password
    }
    users_collection.insert_one(new_user)

    return jsonify({"message": "User created successfully!"}), 201

# --- 3. USER SIGNIN ROUTE ---
@app.route("/signin", methods=["POST"])
def signin():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})

    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    if check_password_hash(user["password"], password):
        return jsonify({
            "message": "Login successful!",
            "name": user["name"],
            "email": user["email"]
        }), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401


if __name__ == "__main__":
    app.run(debug=True)