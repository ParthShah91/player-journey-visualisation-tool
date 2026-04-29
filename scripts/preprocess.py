import os
import pyarrow.parquet as pq
import pandas as pd
import json
from collections import defaultdict

# ==============================
# CONFIG
# ==============================

DATA_DIR = "player_data"   # root folder
OUTPUT_DIR = "processed_data"

MAP_CONFIG = {
    "AmbroseValley": {"scale": 900, "origin_x": -370, "origin_z": -473},
    "GrandRift": {"scale": 581, "origin_x": -290, "origin_z": -290},
    "Lockdown": {"scale": 1000, "origin_x": -500, "origin_z": -500},
}

IMAGE_SIZE = 1024

# Downsample movement (ms)
DOWNSAMPLE_INTERVAL = 100


# ==============================
# HELPERS
# ==============================

def is_bot(user_id: str) -> bool:
    return user_id.isnumeric()


def world_to_pixel(x, z, map_id):
    config = MAP_CONFIG[map_id]
    u = (x - config["origin_x"]) / config["scale"]
    v = (z - config["origin_z"]) / config["scale"]

    px = int(u * IMAGE_SIZE)
    py = int((1 - v) * IMAGE_SIZE)

    return px, py


def load_all_data():
    frames = []

    for root, _, files in os.walk(DATA_DIR):
        for f in files:
            path = os.path.join(root, f)

            try:
                table = pq.read_table(path)
                df = table.to_pandas()

                # decode event bytes
                df["event"] = df["event"].apply(
                    lambda x: x.decode("utf-8") if isinstance(x, bytes) else x
                )

                frames.append(df)

            except Exception as e:
                print(f"Skipping {path}: {e}")

    return pd.concat(frames, ignore_index=True)


# ==============================
# MAIN PROCESSING
# ==============================

def process():
    print("Loading data...")
    df = load_all_data()

    print("Sorting...")
    df = df.sort_values(["match_id", "user_id", "ts"])

    print("Processing matches...")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    matches = df["match_id"].unique()

    for match_id in matches:
        match_df = df[df["match_id"] == match_id]

        map_id = match_df["map_id"].iloc[0]

        players = []

        for user_id, player_df in match_df.groupby("user_id"):
            player_df = player_df.sort_values("ts")

            is_bot_flag = is_bot(user_id)

            path = []
            events = []

            last_ts = None

            for _, row in player_df.iterrows():
                ts = int(pd.Timestamp(row["ts"]).timestamp() * 1000)

                px, py = world_to_pixel(row["x"], row["z"], map_id)

                event_type = row["event"]

                # Movement events
                if event_type in ["Position", "BotPosition"]:
                    if last_ts is None or (ts - last_ts) >= DOWNSAMPLE_INTERVAL:
                        path.append({
                            "x": px,
                            "y": py,
                            "ts": ts
                        })
                        last_ts = ts

                # Other events
                else:
                    events.append({
                        "type": event_type,
                        "x": px,
                        "y": py,
                        "ts": ts
                    })

            players.append({
                "user_id": user_id,
                "is_bot": is_bot_flag,
                "path": path,
                "events": events
            })

        output = {
            "match_id": match_id,
            "map_id": map_id,
            "players": players
        }

        filename = os.path.join(OUTPUT_DIR, f"{match_id}.json")

        with open(filename, "w") as f:
            json.dump(output, f)

    print("Done!")


if __name__ == "__main__":
    process()