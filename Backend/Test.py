import os
import shutil

AUDIO_FOLDER = r"D:\Minor_Project\Dataset\ASVspoof 2019 Dataset\LA\LA\ASVspoof2019_LA_train\flac"
PROTOCOL_FILE = r"D:\Minor_Project\Dataset\ASVspoof 2019 Dataset\LA\LA\ASVspoof2019_LA_cm_protocols\ASVspoof2019.LA.cm.train.trn.txt"

REAL_OUTPUT = "Dataset/Real"
FAKE_OUTPUT = "Dataset/Fake"

REAL_LIMIT = 2500
FAKE_LIMIT = 2500

os.makedirs(REAL_OUTPUT, exist_ok=True)
os.makedirs(FAKE_OUTPUT, exist_ok=True)

real_count = 0
fake_count = 0

with open(PROTOCOL_FILE) as f:

    for line in f:

        parts = line.split()

        file_id = parts[1]
        label = parts[-1]

        audio_path = os.path.join(AUDIO_FOLDER, file_id + ".flac")

        if not os.path.isfile(audio_path):
            continue

        if label == "bonafide" and real_count < REAL_LIMIT:
            shutil.copy(audio_path, REAL_OUTPUT)
            real_count += 1

        elif label == "spoof" and fake_count < FAKE_LIMIT:
            shutil.copy(audio_path, FAKE_OUTPUT)
            fake_count += 1

        if real_count >= REAL_LIMIT and fake_count >= FAKE_LIMIT:
            break

print("Real copied:", real_count)
print("Fake copied:", fake_count)
