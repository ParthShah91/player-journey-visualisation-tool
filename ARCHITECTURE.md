
---

# 📄 arch.md


# Architecture Overview

## Design Goal

Build a lightweight, interactive visualization tool to replay player movement and events on a map.

---

##  High-Level Architecture
Parquet Files
    ↓
Preprocessing Script (Python)
    ↓
JSON Files
    ↓
Frontend (React + Canvas)
    ↓
User Interaction (Map + Timeline)


---

## Components

### 1. Data Layer

- Input: Parquet files
- Output:
  - `match_index.json`
  - Per-match JSON files

Each match is stored separately to:
- Reduce load time
- Avoid loading unnecessary data
- Improve UI responsiveness

---

### 2. Preprocessing Layer

Script: `scripts/preprocess.py`

Responsibilities:
- Read parquet data
- Extract:
  - Player paths
  - Events
- Normalize structure
- Generate JSON files

---

### 3. Frontend Layer

Built using React + Vite.

#### Key Files:

- `App.jsx`
  - Handles state:
    - selected map
    - selected match
    - timeline
    - opacity
  - Fetches data
  - Controls UI

- `MapCanvas.jsx`
  - Renders:
    - Map image
    - Player paths
    - Events
  - Uses HTML Canvas for performance

---

## Data Flow

1. Load `match_index.json`
2. User selects map
3. Filter matches by map
4. User selects match
5. Fetch match JSON
6. Normalize timestamps
7. Render:
   - Map
   - Paths
   - Events

---

## Timeline Handling

- Raw timestamps may not start at 0
- Normalize: normalized_ts = ts - min_ts

- Ensures:
- Slider starts at 0
- Smooth replay experience

---

---

## Coordinate Mapping (World → Minimap)

One of the key challenges was converting 3D world coordinates into 2D minimap positions.

The raw data provides:
- `x`, `y`, `z` coordinates
- Where:
  - `x` and `z` represent horizontal position
  - `y` represents elevation (ignored for 2D rendering)

### Approach

We map `(x, z)` world coordinates onto a 1024x1024 minimap image using a two-step transformation:

### Step 1: Normalize to UV space (0 → 1)

u = (x - origin_x) / scale  
v = (z - origin_z) / scale  

Each map has its own configuration:

| Map | Scale | Origin (x, z) |
|-----|------|---------------|
| AmbroseValley | 900 | (-370, -473) |
| GrandRift | 581 | (-290, -290) |
| Lockdown | 1000 | (-500, -500) |

### Step 2: Convert to pixel coordinates

pixel_x = u * 1024  
pixel_y = (1 - v) * 1024  

- The Y-axis is flipped because image coordinates start from the top-left corner.

### Example

For AmbroseValley:

World position:  
x = -301.45, z = -355.55  

u = (-301.45 - (-370)) / 900 = 0.0762  
v = (-355.55 - (-473)) / 900 = 0.1305  

pixel_x = 0.0762 * 1024 ≈ 78  
pixel_y = (1 - 0.1305) * 1024 ≈ 890  

### Assumptions

- Minimap images are aligned with world axes
- Scaling is uniform across both axes
- Elevation (`y`) does not affect 2D positioning

This mapping ensures that all player paths and events align correctly with the visual map.

## Rendering Strategy

Canvas-based rendering for:
- Better performance than DOM
- Efficient handling of large datasets

### Layers:

1. Map image (with opacity)
2. Player paths (lines + arrowheads)
3. Events (symbols)

---

## Key Decisions

### 1. No Backend

Reason:
- Data is static after preprocessing
- Simpler deployment
- Faster UI

---

### 2. Per-Match JSON

Instead of loading all data:
- Load only selected match
- Reduces memory usage
- Improves performance

---

### 3. Map → Match Filtering

Ensures:
- No invalid combinations
- Cleaner UX
- Prevents empty rendering

---

### 4. Canvas over SVG

Chosen because:
- Large number of points (~50k+)
- Better rendering performance

---

## Trade-offs

| Decision | Trade-off |
|--------|----------|
| Canvas rendering | Harder to debug than DOM |
| No backend | Limited dynamic querying |
| Static JSON | Larger initial data preparation |

---

## Scalability Considerations

- Current approach works well for:
- Single match visualization
- Future improvements:
- Data chunking
- Player-level filtering
- WebGL rendering (if needed)

---

## Future Enhancements

- Start/end markers
- Current position highlight
- Hover tooltips
- Performance optimization
- Multi-match comparison

---

## Summary

The system is designed to be:
- Simple
- Fast
- Easy to deploy

By separating preprocessing and visualization, the app remains efficient and scalable for the current use case.