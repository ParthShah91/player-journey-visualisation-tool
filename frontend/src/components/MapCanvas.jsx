import React, { useEffect, useRef } from "react";

const CANVAS_SIZE = 1024;

function MapCanvas({ mapId, matchData, time, opacity }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (!mapId) return;

    const mapImages = {
      AmbroseValley: "AmbroseValley.png",
      GrandRift: "GrandRift.png",
      Lockdown: "Lockdown.jpg",
    };

    const img = new Image();
    img.src = `/maps/${mapImages[mapId]}`;

    img.onload = () => {
      // Draw map with opacity
      ctx.globalAlpha = opacity ?? 1;
      ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.globalAlpha = 1;

      if (!matchData) return;

      matchData.players.forEach((player) => {
        drawPath(ctx, player, time);
        drawEvents(ctx, player, time);
      });
    };
  }, [mapId, matchData, time, opacity]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      style={{ border: "1px solid black", marginTop: "20px" }}
    />
  );
}

// ===== PATH WITH ARROWHEADS =====
function drawPath(ctx, player, time) {
  const path = player.path.filter((pt) => pt.ts <= time);
  if (path.length < 2) return;

  ctx.beginPath();
  ctx.strokeStyle = player.is_bot ? "pink" : "red";
  ctx.lineWidth = 1;

  ctx.moveTo(path[0].x, path[0].y);

  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }

  ctx.stroke();

  // 👉 Draw arrowheads every N points
  const step = Math.max(5, Math.floor(path.length / 20)); // adaptive spacing

  for (let i = step; i < path.length; i += step) {
    const prev = path[i - 1];
    const curr = path[i];
    drawArrow(ctx, prev.x, prev.y, curr.x, curr.y, player.is_bot ? "pink" : "red");
  }
}

// ===== ARROW FUNCTION =====
function drawArrow(ctx, x1, y1, x2, y2, color) {
  const headLength = 6;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const angle = Math.atan2(dy, dx);

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1;

  // Arrow line (optional small segment)
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);

  // Arrow head
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLength * Math.cos(angle - Math.PI / 6),
    y2 - headLength * Math.sin(angle - Math.PI / 6)
  );

  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLength * Math.cos(angle + Math.PI / 6),
    y2 - headLength * Math.sin(angle + Math.PI / 6)
  );

  ctx.stroke();
}

// ===== EVENTS =====
function drawEvents(ctx, player, time) {
  player.events
    .filter((e) => e.ts <= time)
    .forEach((event) => {
      const { x, y } = event;

      switch (event.type) {
        case "Position":
          drawDot(ctx, x, y, "red");
          break;
        case "BotPosition":
          drawDot(ctx, x, y, "pink");
          break;
        case "Loot":
          drawDot(ctx, x, y, "yellow");
          break;

        case "Kill":
          drawCross(ctx, x, y, "red");
          break;

        case "Killed":
          drawCrossWithCircle(ctx, x, y, "red");
          break;

        case "BotKill":
          drawPlus(ctx, x, y, "pink");
          break;

        case "BotKilled":
          drawPlusWithCircle(ctx, x, y, "pink");
          break;

        case "KilledByStorm":
          drawTriangle(ctx, x, y, "yellow");
          break;

        default:
          drawDot(ctx, x, y, "white");
      }
    });
}

// ===== SHAPES =====

function drawDot(ctx, x, y, color) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, 3, 0, 2 * Math.PI);
  ctx.fill();
}

function drawCross(ctx, x, y, color) {
  const size = 5;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  ctx.moveTo(x - size, y - size);
  ctx.lineTo(x + size, y + size);

  ctx.moveTo(x + size, y - size);
  ctx.lineTo(x - size, y + size);

  ctx.stroke();
}

function drawCrossWithCircle(ctx, x, y, color) {
  drawCross(ctx, x, y, color);

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.arc(x, y, 6, 0, 2 * Math.PI);
  ctx.stroke();
}

function drawPlus(ctx, x, y, color) {
  const size = 5;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);

  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);

  ctx.stroke();
}

function drawPlusWithCircle(ctx, x, y, color) {
  drawPlus(ctx, x, y, color);

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.arc(x, y, 6, 0, 2 * Math.PI);
  ctx.stroke();
}

function drawTriangle(ctx, x, y, color) {
  const size = 6;

  ctx.beginPath();
  ctx.fillStyle = color;

  ctx.moveTo(x, y - size);
  ctx.lineTo(x - size, y + size);
  ctx.lineTo(x + size, y + size);
  ctx.closePath();

  ctx.fill();
}

export default MapCanvas;