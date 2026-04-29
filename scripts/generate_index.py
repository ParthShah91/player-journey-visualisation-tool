import os
import json

INPUT_DIR = "processed_data"
OUTPUT_FILE = "processed_data/match_index.json"


def generate_index():
    index = []

    for filename in os.listdir(INPUT_DIR):
        if not filename.endswith(".json"):
            continue

        if filename == "match_index.json":
            continue

        path = os.path.join(INPUT_DIR, filename)

        with open(path, "r") as f:
            data = json.load(f)

        match_id = data["match_id"]
        map_id = data["map_id"]
        player_count = len(data["players"])

        index.append({
            "match_id": match_id,
            "map_id": map_id,
            "player_count": player_count
        })

    # Sort by map for nicer UX
    index = sorted(index, key=lambda x: (x["map_id"], x["match_id"]))

    with open(OUTPUT_FILE, "w") as f:
        json.dump(index, f, indent=2)

    print(f"Index generated: {OUTPUT_FILE}")


if __name__ == "__main__":
    generate_index()