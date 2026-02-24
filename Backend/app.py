from flask import Flask, request, jsonify
from flask_cors import CORS
import librosa
import joblib
import numpy as np
import tensorflow as tf

app = Flask(__name__)
CORS(app)

# Load pretrained model
model = joblib.load("voice_model.pkl")



# Feature extraction function
def extract_features(file):
    audio, sr = librosa.load(file, res_type='kaiser_fast')
    mfccs = np.mean(librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40).T, axis=0)
    return mfccs


@app.route("/")
def home():
    return "Audio Deepfake Detection API Running"

@app.route("/predict", methods=["POST"])
def predict():

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"})

    file = request.files["file"]

    features = extract_features(file)
    features = features.reshape(1, -1)

    prediction = model.predict(features)[0]
    confidence = model.predict_proba(features)[0][prediction]

    result = "Fake Voice" if prediction == 1 else "Real Voice"

    return jsonify({
        "prediction": result,
        "confidence": float(confidence)
    })



if __name__ == "__main__":
    app.run(debug=True)
