import os
import numpy as np
import librosa
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

# =======================
# PATHS
# =======================
REAL_PATH = "Dataset/Real"
FAKE_PATH = "Dataset/Fake"

# =======================
# FEATURE EXTRACTION
# =======================
def extract_features(file):
    audio, sr = librosa.load(file, res_type="kaiser_fast")
    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
    return np.mean(mfcc.T, axis=0)

# =======================
# LOAD DATASET
# =======================
X = []
y = []

print("Loading REAL files...")
for f in os.listdir(REAL_PATH):
    path = os.path.join(REAL_PATH, f)
    try:
        feat = extract_features(path)
        X.append(feat)
        y.append(0)  # Real = 0
    except Exception as e:
        print("Skipped:", f)

print("Loading FAKE files...")
for f in os.listdir(FAKE_PATH):
    path = os.path.join(FAKE_PATH, f)
    try:
        feat = extract_features(path)
        X.append(feat)
        y.append(1)  # Fake = 1
    except Exception as e:
        print("Skipped:", f)

X = np.array(X)
y = np.array(y)

print("\nTotal samples loaded:", len(X))

# =======================
# TRAIN TEST SPLIT
# =======================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# =======================
# TRAIN MODEL
# =======================
model = RandomForestClassifier(n_estimators=200)
model.fit(X_train, y_train)

# =======================
# EVALUATE
# =======================
y_pred = model.predict(X_test)

print("\nAccuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

# =======================
# SAVE MODEL
# =======================
joblib.dump(model, "voice_model.pkl")
print("\nModel saved as voice_model.pkl")