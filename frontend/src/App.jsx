import React, { useEffect, useState } from "react";
import MapCanvas from "./components/MapCanvas";

function App() {
  const [matches, setMatches] = useState([]);
  const [selectedMap, setSelectedMap] = useState("");
  const [selectedMatch, setSelectedMatch] = useState("");
  const [matchData, setMatchData] = useState(null);

  const [time, setTime] = useState(0);
  const [maxTime, setMaxTime] = useState(0);
  const [opacity, setOpacity] = useState(0.5);

  // Load match index
  useEffect(() => {
    fetch("/data/match_index.json")
      .then((res) => res.json())
      .then((data) => setMatches(data))
      .catch((err) => console.error("Error loading index:", err));
  }, []);

  // Handle map change (FULL RESET)
  const handleMapChange = (map) => {
    setSelectedMap(map);

    setSelectedMatch("");
    setMatchData(null);
    setTime(0);
    setMaxTime(0);
    setOpacity(0.5);
  };

  // Load match data with normalization
  useEffect(() => {
    if (!selectedMatch) return;

    const matchMeta = matches.find((m) => m.match_id === selectedMatch);

    if (!matchMeta || matchMeta.map_id !== selectedMap) {
      console.warn("Invalid match-map combination blocked");
      setSelectedMatch("");
      setMatchData(null);
      return;
    }

    fetch(`/data/${selectedMatch}.json`)
      .then((res) => res.json())
      .then((data) => {
        let minTime = Infinity;
        let maxTimeLocal = 0;

        data.players.forEach((p) => {
          p.path.forEach((pt) => {
            if (pt.ts < minTime) minTime = pt.ts;
            if (pt.ts > maxTimeLocal) maxTimeLocal = pt.ts;
          });
          p.events.forEach((e) => {
            if (e.ts < minTime) minTime = e.ts;
            if (e.ts > maxTimeLocal) maxTimeLocal = e.ts;
          });
        });

        const normalizedData = {
          ...data,
          players: data.players.map((p) => ({
            ...p,
            path: p.path.map((pt) => ({
              ...pt,
              ts: pt.ts - minTime,
            })),
            events: p.events.map((e) => ({
              ...e,
              ts: e.ts - minTime,
            })),
          })),
        };

        setMatchData(normalizedData);
        setMaxTime(maxTimeLocal - minTime);
        setTime(0);
      })
      .catch((err) => console.error("Error loading match:", err));
  }, [selectedMatch, selectedMap, matches]);

  const maps = [...new Set(matches.map((m) => m.map_id))];

  const filteredMatches = matches.filter(
    (m) => m.map_id === selectedMap
  );

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Player Journey Viewer</h2>

      {/* TOP BAR (Controls + Legend) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* LEFT: Controls */}
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          {/* Map */}
          <div>
            <label>Map: </label>
            <select
              value={selectedMap}
              onChange={(e) => handleMapChange(e.target.value)}
            >
              <option value="">Select Map</option>
              {maps.map((map) => (
                <option key={map} value={map}>
                  {map}
                </option>
              ))}
            </select>
          </div>

          {/* Match */}
          <div>
            <label>Match: </label>
            <select
              value={selectedMatch}
              onChange={(e) => setSelectedMatch(e.target.value)}
              disabled={!selectedMap}
            >
              <option value="">Select Match</option>
              {filteredMatches.map((m) => (
                <option key={m.match_id} value={m.match_id}>
                  {m.match_id.substring(0, 8)} ({m.player_count} players)
                </option>
              ))}
            </select>
          </div>

          {/* Opacity */}
          <div>
            <label>Opacity: </label>
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
            />
          </div>
        </div>

        {/* RIGHT: Legend */}
        <div
          style={{
            background: "#f2f2f2",
            padding: "10px",
            borderRadius: "6px",
            fontSize: "13px",
            lineHeight: "1.5",
            maxWidth: "500px",
          }}
        >
          <div>
            <span style={{ color: "red" }}>●</span> Position &nbsp; | &nbsp;
            <span style={{ color: "pink" }}>●</span> BotPosition &nbsp; | &nbsp;
            <span style={{ color: "yellow" }}>●</span> Loot
          </div>
          <div>
            <span style={{ color: "red" }}>✖</span> Kill &nbsp; | &nbsp;
            <span style={{ color: "red", fontWeight: "bold" }}>✖</span> Killed &nbsp; | &nbsp;
            <span style={{ color: "pink" }}>✖</span> BotKill &nbsp; | &nbsp;
            <span style={{ color: "pink", fontWeight: "bold" }}>✖</span> BotKilled &nbsp; | &nbsp;
            <span style={{ color: "orange" }}>▲</span> Storm
          </div>
        </div>
      </div>

      {/* Time Slider */}
      {matchData && (
        <div style={{ marginTop: "20px" }}>
          <label>Time: </label>
          <input
            type="range"
            min="0"
            max={maxTime}
            value={time}
            onChange={(e) => setTime(Number(e.target.value))}
            style={{ width: "400px" }}
          />
        </div>
      )}

      {/* Map */}
      <MapCanvas
        mapId={selectedMap}
        matchData={matchData}
        time={time}
        opacity={opacity}
      />
    </div>
  );
}

export default App;