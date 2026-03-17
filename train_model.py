import os
import numpy as np
import librosa
import tensorflow as tf
from sklearn.model_selection import train_test_split

REAL_PATH = "Dataset/Real"
FAKE_PATH = "Dataset/Fake"

IMG_SIZE = 128


def extract_spectrogram(file):

    audio, sr = librosa.load(file, sr=16000)

    if len(audio) < 1000:
        raise ValueError("Audio too short")

    audio = librosa.util.normalize(audio)
    audio, _ = librosa.effects.trim(audio)

    mel = librosa.feature.melspectrogram(
        y=audio,
        sr=sr,
        n_mels=128
    )

    mel_db = librosa.power_to_db(mel, ref=np.max)

    mel_db = librosa.util.fix_length(mel_db, size=IMG_SIZE, axis=1)

    return mel_db


X = []
y = []

print("Loading REAL files...")

for file in os.listdir(REAL_PATH):

    if not file.lower().endswith((".wav",".flac",".mp3")):
        continue

    path = os.path.join(REAL_PATH, file)

    try:
        spec = extract_spectrogram(path)
        X.append(spec)
        y.append(0)

    except Exception as e:
        print("Skipped:", file)


print("Loading FAKE files...")

for file in os.listdir(FAKE_PATH):

    if not file.lower().endswith((".wav",".flac",".mp3")):
        continue

    path = os.path.join(FAKE_PATH, file)

    try:
        spec = extract_spectrogram(path)
        X.append(spec)
        y.append(1)

    except Exception as e:
        print("Skipped:", file)


X = np.array(X)
y = np.array(y)

X = X[..., np.newaxis]

print("Dataset shape:", X.shape)


X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    stratify=y,
    random_state=42
)


model = tf.keras.Sequential([

    tf.keras.layers.Conv2D(32,(3,3),activation='relu',input_shape=(128,128,1)),
    tf.keras.layers.MaxPooling2D(2,2),

    tf.keras.layers.Conv2D(64,(3,3),activation='relu'),
    tf.keras.layers.MaxPooling2D(2,2),

    tf.keras.layers.Conv2D(128,(3,3),activation='relu'),
    tf.keras.layers.MaxPooling2D(2,2),

    tf.keras.layers.Flatten(),

    tf.keras.layers.Dense(128,activation='relu'),
    tf.keras.layers.Dropout(0.3),

    tf.keras.layers.Dense(1,activation='sigmoid')

])


model.compile(
    optimizer="adam",
    loss="binary_crossentropy",
    metrics=["accuracy"]
)


print("Training CNN...")

model.fit(
    X_train,
    y_train,
    epochs=20,
    batch_size=16,
    validation_data=(X_test,y_test)
)


model.save("voice_model.h5")

print("Model saved as voice_model.h5")