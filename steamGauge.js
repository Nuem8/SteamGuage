/**
 * Copyright (C) 2026 NueM8 LLC. Developed by Kevin Roper.
 *
 * This file is part of SteamGauge and is free software under the
 * GNU General Public License version 3. See the LICENSE file.
 * SPDX-License-Identifier: GPL-3.0-only
 *
 * Round steampunk speedometer.
 * One arc covers 80% of the circle, red through yellow to green, with the gap at the bottom.
 * The needle pivots at the center. The label sits halfway from the needle to the arc.
 * A two-word label stacks, one word on each line.
 * The readout sits centered in the bottom gap.
 *
 * value is 0 (red) to 1 (green). Numbers above 1 are a percent.
 * readout "warning" shows LOOK, CHECK, or OK in place of the number.
 * readout "keyhole" draws a lock keyhole there instead.
 * The number still sets the needle.
 * bezel "seal" adds a wide outer ring: a turned lip and bolts around the rim.
 * Each bolt slot is turned to its own angle, the way a hand stops a screwdriver.
 * legend is the engraved line along the top of that ring.
 *
 * Version 1.1.0
 * Since 1.0.0:
 * The seal bezel is new. bezel "seal" draws the wide ring, a turned lip, and
 * sixteen bolts. The band inside that lip is plain brass, with no leaf wreath.
 * legend engraves one line along the top of the ring.
 * Each bolt slot is turned once, at random, and that turn is kept while the
 * needle sweeps, so the heads look hand-screwed.
 */
function createSteamGauge(options) {
  const settings = options || {};
  const size = Number(settings.size) > 0 ? Number(settings.size) : 400;
  const rawLabel = settings.label == null ? "STEAM" : String(settings.label);
  const label = escapeXml(rawLabel);
  const value = normalizeValue(settings.value);
  // readout "warning" replaces the digits. readout "keyhole" replaces them with a lock.
  const warning = settings.readout === "warning";
  const keyholeReadout = settings.readout === "keyhole";
  const seal = settings.bezel === "seal";
  const readout = warning ? zoneWarning(value).toUpperCase() : String(Math.round(value * 100));
  const numberColor = zoneColor(value);
  // Each gauge gets its own gradient ids so several gauges can share one page.
  const gid = "sg" + (createSteamGauge.serial = (createSteamGauge.serial || 0) + 1);
  const cx = size / 2;
  const cy = size / 2;
  const outer = size * (seal ? 0.49 : 0.48);
  const face = size * (seal ? 0.292 : 0.4);
  const arcRadius = size * (seal ? 0.225 : 0.31);
  // 80% of the circle. The remaining 20% is the gap at the bottom.
  // 0° is east and angles increase counter-clockwise. 270° is straight down.
  const sweep = 360 * 0.8;
  const startAngle = 270 - (360 - sweep) / 2;
  const endAngle = startAngle - sweep;
  const needleAngle = startAngle - value * sweep;
  const scaleStart = pointOnCircle(cx, cy, arcRadius, startAngle);
  const scaleEnd = pointOnCircle(cx, cy, arcRadius, endAngle);
  // The stroke is centered on the arc, so the tip stops on the inner edge of that stroke.
  const needleTipRadius = arcRadius - size * 0.015;
  const ticks = tickMarks(cx, cy, arcRadius, startAngle, sweep, 17);
  const rivets = seal ? "" : [0, 45, 90, 135, 180, 225, 270, 315].map(function (angle) {
    return rivet(cx, cy, outer * 0.9, angle, size);
  }).join("");
  const legend = settings.legend == null ? "" : String(settings.legend).trim();

  return [
    '<!-- Copyright (C) 2026 NueM8 LLC. Developed by Kevin Roper. SteamGauge ' + createSteamGauge.version + '. SPDX-License-Identifier: GPL-3.0-only -->',
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + " " + size + '" width="' + size + '" height="' + size + '" role="img" aria-label="' + label + " " + Math.round(value * 100) + "% " + (keyholeReadout ? "lock" : warning ? escapeXml(readout) : "") + '">',
    "<defs>",
    radial(gid + "-brass", [
      [0, "#f3e2b0"],
      [0.45, "#d7b15a"],
      [0.72, "#8d6a2a"],
      [1, "#5c4316"]
    ]),
    radial(gid + "-face", [
      [0, "#4a341c"],
      [0.62, "#24180f"],
      [1, "#100b07"]
    ]),
    radial(gid + "-hub", [
      [0, "#f8edd0"],
      [0.55, "#c89b3c"],
      [1, "#6d5218"]
    ]),
    '<linearGradient id="' + gid + '-scale" gradientUnits="userSpaceOnUse" x1="' + scaleStart.x.toFixed(2) + '" y1="' + cy + '" x2="' + scaleEnd.x.toFixed(2) + '" y2="' + cy + '">',
    '<stop offset="0" stop-color="#9d2a24"/>',
    '<stop offset="0.5" stop-color="#e0b84a"/>',
    '<stop offset="1" stop-color="#2f8f4e"/>',
    "</linearGradient>",
    '<linearGradient id="' + gid + '-glass" x1="0" y1="0" x2="0" y2="1">',
    '<stop offset="0" stop-color="#fff8e6" stop-opacity="0.28"/>',
    '<stop offset="0.45" stop-color="#fff8e6" stop-opacity="0"/>',
    "</linearGradient>",
    seal && legend ? legendPath(gid, cx, cy, size * 0.405) : "",
    seal ? radial(gid + "-bolt", [
      [0, "#fff6d8"],
      [0.42, "#e4c278"],
      [0.74, "#8d6424"],
      [1, "#4a3212"]
    ]) : "",
    "</defs>",
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + outer + '" fill="url(#' + gid + '-brass)" stroke="#3d2a0e" stroke-width="' + (size * 0.012) + '"/>',
    seal ? sealBezel(cx, cy, size, gid, legend, settings.screwSlots) : '<circle cx="' + cx + '" cy="' + cy + '" r="' + (outer * 0.9) + '" fill="none" stroke="#6a4e1d" stroke-width="' + (size * 0.018) + '"/>',
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + face + '" fill="url(#' + gid + '-face)" stroke="#e6c98a" stroke-width="' + (size * 0.012) + '"/>',
    arc(cx, cy, arcRadius, startAngle, endAngle, "url(#" + gid + "-scale)", size * 0.03),
    ticks,
    rivets,
    needle(cx, cy, needleAngle, needleTipRadius, size * (seal ? 0.02 : 0.03)),
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + (size * (seal ? 0.034 : 0.05)) + '" fill="url(#' + gid + '-hub)" stroke="#3d2a0e" stroke-width="' + (size * 0.006) + '"/>',
    '<line x1="' + (cx - size * 0.022) + '" y1="' + cy + '" x2="' + (cx + size * 0.022) + '" y2="' + cy + '" stroke="#3d2a0e" stroke-width="' + (size * 0.006) + '"/>',
    '<ellipse cx="' + cx + '" cy="' + (cy - face * (seal ? 0.62 : 0.35)) + '" rx="' + (face * (seal ? 0.52 : 0.7)) + '" ry="' + (face * (seal ? 0.14 : 0.28)) + '" fill="url(#' + gid + '-glass)"/>',
    gaugeLabel(cx, cy - arcRadius * 0.5 + size * 0.025, size, rawLabel, seal ? 0.046 : 0.07),
    // Lock center is 75% of the way from the needle to the outer edge of the arc.
    keyholeReadout
      ? keyhole(cx, cy + (arcRadius + size * 0.015) * 0.75, size, numberColor)
      : '<text x="' + cx + '" y="' + (cy + arcRadius * 0.78) + '" text-anchor="middle" fill="' + numberColor + '" font-family="Palatino Linotype, Palatino, Times New Roman, serif" font-size="' + (size * (warning ? 0.042 : 0.055)) + '">' + escapeXml(readout) + "</text>",
    "</svg>"
  ].join("");
}

createSteamGauge.version = "1.1.0";

// Two words stack on two lines, centered on the same spot as a single-word label.
function gaugeLabel(cx, y, size, rawLabel, scale) {
  const words = rawLabel.trim().split(/\s+/).filter(function (word) {
    return word.length > 0;
  });
  const fontSize = size * (scale || 0.07);
  const style = ' text-anchor="middle" fill="#f4e5c3" font-family="Palatino Linotype, Palatino, Times New Roman, serif" font-size="' + fontSize + '" letter-spacing="' + (size * 0.006) + '"';
  if (words.length === 2) {
    const gap = fontSize * 1.05;
    return '<text x="' + cx + '" y="' + (y - gap / 2) + '"' + style + ">" + escapeXml(words[0]) + "</text>" +
      '<text x="' + cx + '" y="' + (y + gap / 2) + '"' + style + ">" + escapeXml(words[1]) + "</text>";
  }
  return '<text x="' + cx + '" y="' + y + '"' + style + ">" + escapeXml(words.join(" ")) + "</text>";
}

// Brass lock plate. The dark circle and slot are the keyhole. color is the zone rim.
function keyhole(cx, centerY, size, color) {
  // Drawn 50% larger than the first plate so it reads in the bottom gap.
  const s = size * 1.5;
  const plateW = s * 0.09;
  const plateH = s * 0.11;
  const top = centerY - plateH / 2;
  const holeR = s * 0.016;
  const holeY = centerY - s * 0.01;
  const slotTop = holeY + holeR * 0.2;
  const slotBottom = centerY + plateH * 0.22;
  const slotWide = holeR * 0.7;
  const slotNarrow = holeR * 0.28;
  const screwR = s * 0.005;
  return [
    '<rect x="' + (cx - plateW / 2).toFixed(2) + '" y="' + top.toFixed(2) + '" width="' + plateW.toFixed(2) + '" height="' + plateH.toFixed(2) + '" rx="' + (s * 0.018).toFixed(2) + '" fill="#c9a24a" stroke="' + color + '" stroke-width="' + (s * 0.005).toFixed(2) + '"/>',
    '<circle cx="' + cx.toFixed(2) + '" cy="' + (top + s * 0.012).toFixed(2) + '" r="' + screwR.toFixed(2) + '" fill="#5c4316"/>',
    '<circle cx="' + cx.toFixed(2) + '" cy="' + (top + plateH - s * 0.012).toFixed(2) + '" r="' + screwR.toFixed(2) + '" fill="#5c4316"/>',
    '<circle cx="' + cx.toFixed(2) + '" cy="' + holeY.toFixed(2) + '" r="' + holeR.toFixed(2) + '" fill="#140e09"/>',
    '<polygon points="' + (cx - slotWide).toFixed(2) + "," + slotTop.toFixed(2) + " " + (cx + slotWide).toFixed(2) + "," + slotTop.toFixed(2) + " " + (cx + slotNarrow).toFixed(2) + "," + slotBottom.toFixed(2) + " " + (cx - slotNarrow).toFixed(2) + "," + slotBottom.toFixed(2) + '" fill="#140e09"/>'
  ].join("");
}

// Warning words are uppercase. The number still chooses the zone.
function zoneWarning(value) {
  if (value < 1 / 3) {
    return "LOOK";
  }
  if (value < 2 / 3) {
    return "CHECK";
  }
  return "OK";
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

// Triangle pointer. The short wide triangle is the counterweight, opposite the tip.
function needle(cx, cy, angle, length, halfWidth) {
  const tip = pointOnCircle(cx, cy, length, angle);
  const left = pointOnCircle(cx, cy, halfWidth, angle + 90);
  const right = pointOnCircle(cx, cy, halfWidth, angle - 90);
  const counter = pointOnCircle(cx, cy, halfWidth * 4.2, angle + 180);
  const counterLeft = pointOnCircle(cx, cy, halfWidth * 1.15, angle + 90);
  const counterRight = pointOnCircle(cx, cy, halfWidth * 1.15, angle - 90);
  return '<polygon points="' + counter.x.toFixed(2) + "," + counter.y.toFixed(2) + " " + counterLeft.x.toFixed(2) + "," + counterLeft.y.toFixed(2) + " " + counterRight.x.toFixed(2) + "," + counterRight.y.toFixed(2) + '" fill="#c9b48a"/>' +
    '<polygon points="' + tip.x.toFixed(2) + "," + tip.y.toFixed(2) + " " + left.x.toFixed(2) + "," + left.y.toFixed(2) + " " + right.x.toFixed(2) + "," + right.y.toFixed(2) + '" fill="#f4e7c8"/>';
}

// Sweep flag 1 draws the long clockwise arc, leaving the gap at the bottom.
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

// Wide brass ring. A bright lip and a dark chase turn the outer edge.
// Bolts sit in that chase.
// The legend is engraved along the top, clear of both.
function sealBezel(cx, cy, size, gid, legend, screwSlots) {
  const boltCount = 16;
  const bolts = [];
  for (let index = 0; index < boltCount; index += 1) {
    // Half a step off the cardinals, so the top bolt does not sit on the legend.
    const angle = index * (360 / boltCount) + 360 / (boltCount * 2);
    const point = pointOnCircle(cx, cy, size * 0.458, angle);
    // A slot is the same upside down, so the turn only needs half a circle.
    const slot = screwSlots && isFinite(screwSlots[index]) ? screwSlots[index] : Math.random() * 180;
    bolts.push(bolt(point.x, point.y, size * 0.016, slot, gid));
  }
  const engraved = legend
    ? '<text fill="#3d2a0e" font-family="Palatino Linotype, Palatino, Times New Roman, serif" font-size="' + (size * 0.038) + '" letter-spacing="' + (size * 0.004) + '"><textPath href="#' + gid + '-legend" startOffset="50%" text-anchor="middle">' + escapeXml(legend) + "</textPath></text>"
    : "";
  return [
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + (size * 0.478) + '" fill="none" stroke="#f7e7c0" stroke-width="' + (size * 0.008) + '"/>',
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + (size * 0.466) + '" fill="none" stroke="#3a2910" stroke-width="' + (size * 0.01) + '"/>',
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + (size * 0.372) + '" fill="none" stroke="#3a2910" stroke-width="' + (size * 0.007) + '"/>',
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + (size * 0.362) + '" fill="none" stroke="#e6c98a" stroke-width="' + (size * 0.004) + '"/>',
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + (size * 0.32) + '" fill="none" stroke="#3a2910" stroke-width="' + (size * 0.005) + '"/>',
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + (size * 0.312) + '" fill="none" stroke="#c9a24a" stroke-width="' + (size * 0.003) + '"/>',
    bolts.join(""),
    engraved
  ].join("");
}

function legendPath(gid, cx, cy, radius) {
  const start = pointOnCircle(cx, cy, radius, 150);
  const end = pointOnCircle(cx, cy, radius, 30);
  return '<path id="' + gid + '-legend" fill="none" d="M ' + start.x.toFixed(2) + " " + start.y.toFixed(2) + " A " + radius.toFixed(2) + " " + radius.toFixed(2) + " 0 0 1 " + end.x.toFixed(2) + " " + end.y.toFixed(2) + '"/>';
}

// Domed head on a dark washer. angle is the slot, not the bolt's place on the ring.
// The bright spot stays on the same side of every head.
function bolt(x, y, radius, angle, gid) {
  const rad = angle * Math.PI / 180;
  const slot = radius * 0.62;
  const dx = Math.cos(rad) * slot;
  const dy = -Math.sin(rad) * slot;
  const sx = x + radius * 0.28;
  const sy = y + radius * 0.28;
  return '<circle cx="' + sx.toFixed(2) + '" cy="' + sy.toFixed(2) + '" r="' + (radius * 1.15).toFixed(2) + '" fill="#2a1c0c"/>' +
    '<circle cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" r="' + (radius * 1.34).toFixed(2) + '" fill="#6a4e1d" stroke="#3a2910" stroke-width="' + (radius * 0.14).toFixed(2) + '"/>' +
    '<circle cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" r="' + radius.toFixed(2) + '" fill="url(#' + gid + '-bolt)" stroke="#3a2910" stroke-width="' + (radius * 0.16).toFixed(2) + '"/>' +
    '<line x1="' + (x - dx).toFixed(2) + '" y1="' + (y - dy).toFixed(2) + '" x2="' + (x + dx).toFixed(2) + '" y2="' + (y + dy).toFixed(2) + '" stroke="#2a1c0c" stroke-width="' + (radius * 0.2).toFixed(2) + '" stroke-linecap="round"/>';
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

// One turn per bolt, kept on the gauge so a needle sweep does not spin the slots.
function screwSlots(mount) {
  if (!mount.screwSlots) {
    const slots = [];
    for (let index = 0; index < 16; index += 1) {
      slots.push(Math.random() * 180);
    }
    mount.screwSlots = slots;
  }
  return mount.screwSlots;
}

function gaugeOptions(mount, value) {
  const seal = mount.dataset.bezel === "seal";
  return {
    label: mount.dataset.label || "STEAM",
    value: value,
    size: mount.dataset.size == null ? 280 : Number(mount.dataset.size),
    readout: mount.dataset.readout === "warning" || mount.dataset.readout === "keyhole" ? mount.dataset.readout : "number",
    bezel: seal ? "seal" : "",
    legend: mount.dataset.legend || "",
    screwSlots: seal ? screwSlots(mount) : null
  };
}

function drawGauge(mount, value) {
  mount.gaugeValue = value;
  mount.innerHTML = createSteamGauge(gaugeOptions(mount, value));
}

// Sweep the needle from its current value to the next one over one second.
function sweepGauge(mount, nextValue) {
  const from = mount.gaugeValue || 0;
  const to = normalizeValue(nextValue);
  const started = performance.now();
  const duration = 1000;

  if (mount.gaugeFrame) {
    cancelAnimationFrame(mount.gaugeFrame);
  }

  function frame(now) {
    const t = Math.min(1, (now - started) / duration);
    const eased = t * t * (3 - 2 * t);
    drawGauge(mount, from + (to - from) * eased);
    if (t < 1) {
      mount.gaugeFrame = requestAnimationFrame(frame);
    }
  }

  mount.gaugeFrame = requestAnimationFrame(frame);
}

// First paint is zero, then the needle sweeps to data-value.
function watchGauge(mount) {
  drawGauge(mount, 0);
  sweepGauge(mount, mount.dataset.value == null ? 0.62 : mount.dataset.value);

  const observer = new MutationObserver(function (mutations) {
    const valueChanged = mutations.some(function (change) {
      return change.attributeName === "data-value";
    });
    if (valueChanged) {
      sweepGauge(mount, mount.dataset.value);
      return;
    }
    drawGauge(mount, mount.gaugeValue || 0);
  });
  observer.observe(mount, { attributes: true, attributeFilter: ["data-value", "data-readout"] });
  mount.sweepTo = function (value) {
    mount.dataset.value = value;
  };
}

if (typeof window !== "undefined") {
  window.createSteamGauge = createSteamGauge;
  // Set a new number. The needle sweeps from where it is now.
  window.setSteamGauge = function (mount, value) {
    if (mount && typeof mount.sweepTo === "function") {
      mount.sweepTo(value);
      return;
    }
    if (mount) {
      mount.dataset.value = value;
    }
  };
  window.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".steam-gauge").forEach(watchGauge);
  });
}

if (typeof require !== "undefined" && require.main === module) {
  const fs = require("fs");
  const path = require("path");
  const svg = createSteamGauge({ label: "STEAM", value: 0.62, size: 400 });
  fs.writeFileSync(path.join(__dirname, "steam-gauge.svg"), svg);
  process.stdout.write("Wrote steam-gauge.svg\n");
}
