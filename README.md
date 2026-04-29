# Player Journey Viewer

A web-based visualization tool to explore player movement and events across maps.

Users can:
- Select a map
- Choose a match
- Replay player movement over time
- View events like kills, loot, and deaths
- Adjust map opacity for better visibility

---

## Live Demo

Deployed on Vercel:  
https://playerjourneyvisualisationtool.vercel.app/

---

## Features

- Map-based visualization (multiple maps supported)
- Match filtering by map
- Timeline slider (replay match over time)
- Player path rendering
- Event markers:
  - Position / BotPosition
  - Kill / Killed
  - BotKill / BotKilled
  - Loot
  - KilledByStorm
- Directional paths using arrowheads
- Adjustable map opacity
- Legend for easy interpretation

---

##  Project Structure
root/
├── data/
│ ├── raw/ # Original parquet files
│ ├── processed/ # Processed JSON files
├── scripts/
│ └── preprocess.py # Converts parquet → JSON
├── frontend/
│ ├── public/
│ │ ├── data/ # Match JSON files (served to UI)
│ │ ├── maps/ # Map images (png/jpg)
│ ├── src/
│ │ ├── components/
│ │ │ └── MapCanvas.jsx
│ │ ├── App.jsx
│ ├── package.json


---


## Data Pipeline
Raw data is provided as parquet files.
Processing steps:
• Read parquet files
• Extract:
    player paths
    events
• Generate:
    match_index.json
    Individual match JSON files

## Output format:
• Each match JSON contains:
   map_id
   players
   path (x, y, timestamp)
   events (type, x, y, timestamp)

## Data Requirements
Place files in:
  • Match data: frontend/public/data/
  • Map images: frontend/public/maps/

## How to Use
• Select a map
• Select a match
• Use the timeline slider to replay events
• Adjust opacity if paths are hard to see
• Refer to legend for event meanings

## Known Limitations
• Dense matches may look cluttered
• No player-level filtering yet
• Canvas rendering depends on image load timing
• No hover tooltips for events

## Future Improvements
• Start and end markers
• Highlight current player position
• Player filtering
• Tooltips on hover
• Performance optimization for large datasets

## Tech Stack
• React (Vite)
• HTML Canvas
• JavaScript
