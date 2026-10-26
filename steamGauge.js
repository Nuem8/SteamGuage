/**
 * Round steampunk speedometer.
 * One arc covers 80% of the circle, red through yellow to green, with the gap at the bottom.
 * The needle pivots at the center. The label sits halfway from the needle to the arc.
 * The number sits centered in the bottom gap.
 *
 * value is 0 (red) to 1 (green). Numbers above 1 are a percent.
 */
function createSteamGauge(options) {
  const settings = options || {};
  const size = Number(settings.size) > 0 ? Number(settings.size) : 400;
  const label = escapeXml(settings.label == null ? "STEAM" : String(settings.label));
  const value = normalizeValue(settings.value);
  const numberColor = zoneColor(value);
  const cx = size / 2;
  const cy = size / 2;
  const outer = size * 0.48;
  const face = size * 0.4;
  const arcRadius = size * 0.31;
  const sweep = 360 * 0.8;
  const startAngle = 270 - (360 - sweep) / 2;
  const endAngle = startAngle - sweep;
  const needleAngle = startAngle - value * sweep;
  const scaleStart = pointOnCircle(cx, cy, arcRadius, startAngle);
  const scaleEnd = pointOnCircle(cx, cy, arcRadius, endAngle);
  const needleTip = pointOnCircle(cx, cy, arcRadius * 0.78, needleAngle);
  const ticks = tickMarks(cx, cy, arcRadius, startAngle, sweep, 17);
  const rivets = [0, 45, 90, 135, 180, 225, 270, 315].map(function (angle) {
    return rivet(cx, cy, outer * 0.9, angle, size);
  }).join("");

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + " " + size + '" width="' + size + '" height="' + size + '" role="img" aria-label="' + label + " " + Math.round(value * 100) + '%">',
    "<defs>",
    radial("brass", [
      [0, "#f3e2b0"],
      [0.45, "#d7b15a"],
      [0.72, "#8d6a2a"],
      [1, "#5c4316"]
    ]),
    radial("face", [
      [0, "#4a341c"],
      [0.62, "#24180f"],
      [1, "#100b07"]
    ]),
    radial("hub", [
      [0, "#f8edd0"],
      [0.55, "#c89b3c"],
      [1, "#6d5218"]
    ]),
    '<linearGradient id="scale" gradientUnits="userSpaceOnUse" x1="' + scaleStart.x.toFixed(2) + '" y1="' + cy + '" x2="' + scaleEnd.x.toFixed(2) + '" y2="' + cy + '">',
    '<stop offset="0" stop-color="#9d2a24"/>',
    '<stop offset="0.5" stop-color="#e0b84a"/>',
    '<stop offset="1" stop-color="#2f8f4e"/>',
    "</linearGradient>",
    '<linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">',
    '<stop offset="0" stop-color="#fff8e6" stop-opacity="0.28"/>',
    '<stop offset="0.45" stop-color="#fff8e6" stop-opacity="0"/>',
    "</linearGradient>",
    "</defs>",
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + outer + '" fill="url(#brass)" stroke="#3d2a0e" stroke-width="' + (size * 0.012) + '"/>',
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + (outer * 0.9) + '" fill="none" stroke="#6a4e1d" stroke-width="' + (size * 0.018) + '"/>',
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + face + '" fill="url(#face)" stroke="#e6c98a" stroke-width="' + (size * 0.012) + '"/>',
    arc(cx, cy, arcRadius, startAngle, endAngle, "url(#scale)", size * 0.03),
    ticks,
    rivets,
    '<line x1="' + cx + '" y1="' + cy + '" x2="' + needleTip.x.toFixed(2) + '" y2="' + needleTip.y.toFixed(2) + '" stroke="#f4e7c8" stroke-width="' + (size * 0.012) + '" stroke-linecap="round"/>',
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + (size * 0.05) + '" fill="url(#hub)" stroke="#3d2a0e" stroke-width="' + (size * 0.006) + '"/>',
    '<line x1="' + (cx - size * 0.022) + '" y1="' + cy + '" x2="' + (cx + size * 0.022) + '" y2="' + cy + '" stroke="#3d2a0e" stroke-width="' + (size * 0.006) + '"/>',
    '<ellipse cx="' + cx + '" cy="' + (cy - face * 0.35) + '" rx="' + (face * 0.7) + '" ry="' + (face * 0.28) + '" fill="url(#glass)"/>',
    '<text x="' + cx + '" y="' + (cy - arcRadius * 0.5 + size * 0.025) + '" text-anchor="middle" fill="#f4e5c3" font-family="Palatino Linotype, Palatino, Times New Roman, serif" font-size="' + (size * 0.07) + '" letter-spacing="' + (size * 0.006) + '">' + label + "</text>",
    '<text x="' + cx + '" y="' + (cy + arcRadius * 0.78) + '" text-anchor="middle" fill="' + numberColor + '" font-family="Palatino Linotype, Palatino, Times New Roman, serif" font-size="' + (size * 0.055) + '">' + Math.round(value * 100) + "</text>",
    "</svg>"
  ].join("");
}

function zoneColor(value) {
  if (value < 1 / 3) {
    return "#9d2a24";
  }
  if (value < 2 / 3) {
    return "#e0b84a";
  }
  return "#2f8f4e";
}

function normalizeValue(value) {
  const number = Number(value);
  if (!isFinite(number)) {
    return 0;
  }
  const unit = number > 1 ? number / 100 : number;
  return Math.max(0, Math.min(1, unit));
}

function pointOnCircle(cx, cy, radius, angleDeg) {
  const rad = angleDeg * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy - radius * Math.sin(rad)
  };
}

function arc(cx, cy, radius, startAngle, endAngle, color, width) {
  const start = pointOnCircle(cx, cy, radius, startAngle);
  const end = pointOnCircle(cx, cy, radius, endAngle);
  return '<path d="M ' + start.x.toFixed(2) + " " + start.y.toFixed(2) + " A " + radius.toFixed(2) + " " + radius.toFixed(2) + " 0 1 1 " + end.x.toFixed(2) + " " + end.y.toFixed(2) + '" fill="none" stroke="' + color + '" stroke-width="' + width + '" stroke-linecap="round"/>';
}

function tickMarks(cx, cy, radius, startAngle, sweep, count) {
  const marks = [];
  for (let index = 0; index < count; index += 1) {
    const angle = startAngle - sweep * (index / (count - 1));
    const outer = pointOnCircle(cx, cy, radius * 0.86, angle);
    const inner = pointOnCircle(cx, cy, radius * (index % 4 === 0 ? 0.72 : 0.78), angle);
    marks.push('<line x1="' + inner.x.toFixed(2) + '" y1="' + inner.y.toFixed(2) + '" x2="' + outer.x.toFixed(2) + '" y2="' + outer.y.toFixed(2) + '" stroke="#f4e5c3" stroke-width="' + (index % 4 === 0 ? 2.4 : 1.2) + '" stroke-linecap="round"/>');
  }
  return marks.join("");
}

function rivet(cx, cy, radius, angle, size) {
  const point = pointOnCircle(cx, cy, radius, angle);
  return '<circle cx="' + point.x.toFixed(2) + '" cy="' + point.y.toFixed(2) + '" r="' + (size * 0.018) + '" fill="#f3e2b0" stroke="#5c4316" stroke-width="' + (size * 0.004) + '"/>';
}

function radial(id, stops) {
  const parts = ['<radialGradient id="' + id + '" cx="35%" cy="30%" r="75%">'];
  stops.forEach(function (stop) {
    parts.push('<stop offset="' + (stop[0] * 100) + '%" stop-color="' + stop[1] + '"/>');
  });
  parts.push("</radialGradient>");
  return parts.join("");
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { createSteamGauge: createSteamGauge };
}

if (typeof window !== "undefined") {
  window.createSteamGauge = createSteamGauge;
  window.addEventListener("DOMContentLoaded", function () {
    const mount = document.getElementById("steam-gauge");
    if (!mount) {
      return;
    }
    mount.innerHTML = createSteamGauge({
      label: mount.dataset.label || "STEAM",
      value: mount.dataset.value == null ? 0.62 : Number(mount.dataset.value),
      size: mount.dataset.size == null ? 400 : Number(mount.dataset.size)
    });
  });
}

if (typeof require !== "undefined" && require.main === module) {
  const fs = require("fs");
  const path = require("path");
  const svg = createSteamGauge({ label: "STEAM", value: 0.62, size: 400 });
  fs.writeFileSync(path.join(__dirname, "steam-gauge.svg"), svg);
  process.stdout.write("Wrote steam-gauge.svg\n");
}
