from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import librosa
import numpy as np
import tensorflow as tf
import os
import uuid
import re
from dotenv import load_dotenv 

# 1. Initialize Flask & Load Environment
app = Flask(__name__)
CORS(app)
load_dotenv()

# ==========================================
# FFMPEG LOCAL PATH CONFIGURATION
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FFMPEG_BIN_PATH = os.path.join(BASE_DIR, "ffmpeg", "bin") 
os.environ["PATH"] = FFMPEG_BIN_PATH + os.pathsep + os.environ.get("PATH", "")

# ==========================================
# MONGODB ATLAS CONNECTION
# ==========================================
MONGO_URI = os.getenv("MONGO_URI") 

if not MONGO_URI:
    raise ValueError("No MONGO_URI found. Please check your .env file!")

# Initialize variables at the top level to avoid NameError
client = MongoClient(MONGO_URI)
db = client["AudioGuardDB"] 

# Define collections (Global Scope)
users_collection = db["users"] 
contact_collection = db["contacts"] # Changed to 'contacts' for consistency
records_collection = db["records"]

try:
    # Test connection
    client.admin.command('ping')
    print("Connected to MongoDB Atlas successfully!")
except Exception as e:
    print(f"CRITICAL ERROR: Failed to connect to MongoDB: {e}")

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
    return "Audio Deepfake API Running (Audio & Auth)"

# --- 1. AI PREDICTION ROUTE ---
@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error":"No file uploaded"}), 400

    file = request.files["file"]
    email = request.form.get("email", "Guest")
    file_size = request.form.get("size", "Unknown")
    
    temp = None
    try:
        temp = save_audio(file)
        spec = extract_spectrogram(temp)
        spec = np.expand_dims(spec, axis=0)
        prediction = float(model.predict(spec)[0][0])
        
        result = "Fake Voice" if prediction > 0.5 else "Real Voice"
        confidence = prediction if prediction > 0.5 else 1 - prediction
        confidence_pct = round(confidence * 100, 2)

        # Save to records if logged in
        if email != "Guest":
            records_collection.insert_one({
                "email": email,
                "filename": file.filename,
                "size": file_size,
                "result": result,
                "confidence": confidence_pct,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })

        return jsonify({
            "prediction": result,
            "confidence": confidence_pct
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
        return jsonify({"error": "Password does not meet requirements"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409

    hashed_password = generate_password_hash(password)
    users_collection.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password
    })

    return jsonify({"message": "User created successfully!"}), 201

# --- 3. USER SIGNIN ROUTE ---
@app.route("/signin", methods=["POST"])
def signin():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})

    if user and check_password_hash(user["password"], password):
        return jsonify({
            "message": "Login successful!",
            "name": user["name"],
            "email": user["email"]
        }), 200
    
    return jsonify({"error": "Invalid email or password"}), 401

# --- 4. CONTACT SUPPORT ROUTE ---
@app.route("/contact", methods=["POST"])
def contact():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    message = data.get("message")

    if not name or not email or not message:
        return jsonify({"error": "All fields are required"}), 400

    contact_collection.insert_one({
        "name": name,
        "email": email,
        "message": message,
        "timestamp": datetime.now().isoformat()
    })

    return jsonify({"message": "Message sent successfully!"}), 201
    
# --- 5. GET USER RECORDS ROUTE (PAGINATED) ---
@app.route("/user_records", methods=["POST"])
def get_user_records():
    data = request.json
    email = data.get("email")
    
    page = int(data.get("page", 1))
    limit = int(data.get("limit", 5))

    if limit not in [5, 25, 50, 100]:
        limit = 5

    if not email:
        return jsonify({"error": "Email is required"}), 400

    skip_amount = (page - 1) * limit
    cursor = records_collection.find({"email": email}).sort("timestamp", -1).skip(skip_amount).limit(limit)
    records = list(cursor)

    total_records = records_collection.count_documents({"email": email})
    total_pages = (total_records + limit - 1) // limit

    for record in records:
        record["_id"] = str(record["_id"])

    return jsonify({
        "records": records,
        "total_records": total_records,
        "total_pages": total_pages,
        "current_page": page
    }), 200

if __name__ == "__main__":
    app.run(debug=True)