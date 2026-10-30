# SteamGuage

Version 1.1.0

From NueM8 Studios: a round brass dial, riveted and glassed. The needle wakes at rest, then sweeps the arc as the boilers take up pressure. Red bids you LOOK. Yellow bids you CHECK. Green says the engine is OK. One plate keeps its counsel behind a keyhole, and the rim of that lock tells the same tale as the words. A seal ring can carry a name along its lip, and the bolts on that ring sit as a hand left them.

The drawings are kept on [GitHub](https://github.com/Nuem8/SteamGuage). Further work from the shop is on the [NueM8 projects](https://nuem8.com/projects) page.

Copyright (C) 2026 NueM8 LLC. Developed by Kevin Roper.

SteamGauge is free software. You can redistribute it and modify it under the terms of the GNU General Public License version 3, published by the Free Software Foundation. See the `LICENSE` file.

SPDX-License-Identifier: GPL-3.0-only

Keep this copyright notice with any copy or modified version.

## Version 1.1.0

Since 1.0.0 the seal bezel is new. `bezel` set to `seal` draws a wide outer ring, a turned lip, and sixteen bolts. The band inside that lip is plain brass, with no leaf wreath. `legend` engraves one line along the top of the ring. Each bolt slot is turned once, at random, and that turn is kept while the needle sweeps, so the heads look hand-screwed.

`createSteamGauge.version` is `"1.1.0"`. Each drawing carries that version in its comment.

## Examples

These five gauges are the samples from `index.html`, drawn by `steamGauge.js` 1.1.0 and saved in `assets`. The needle still follows the number. Warning readouts replace the digits with LOOK, CHECK, or OK. The lock readout draws a keyhole in that gap, and its rim uses the same zone color. The pressure gauge wears the seal ring.

| BOILER, 18 — LOOK | STEAM, 62 — CHECK |
| --- | --- |
| ![BOILER at 18, warning LOOK](assets/boiler.svg) | ![STEAM at 62, warning CHECK](assets/steam.svg) |
| The kettle sulks in the red. LOOK to the valves before the rivets sing. | Steam crowds the yellow band. CHECK the joints and mind the whistle. |

| POWER, 88 — OK | PRESSURE, 72 — OK |
| --- | --- |
| ![POWER at 88, warning OK](assets/power.svg) | ![PRESSURE at 72, seal ring, warning OK](assets/pressure.svg) |
| The engine sings in the green. Pressure is OK, and the brass may rest. | The seal ring carries the name you set. Pressure is OK, and the bolts keep their watch. |

| LOCK, 40 — keyhole |
| --- |
| ![LOCK at 40, keyhole readout](assets/lock.svg) |
| Brass warms around the keyhole. CHECK the ward, then try the key. |

Below 34 is LOOK, 34 to 66 is CHECK, and 67 and above is OK.

Open `index.html` to see each gauge start at zero and sweep to its number over one second. The page then moves one gauge every 3.5 seconds. The seal-ring slots are chosen when that gauge is first drawn, and they stay put through the sweep.

## Use

```html
<div class="steam-gauge" data-label="BOILER" data-value="18" data-size="280" data-readout="warning"></div>
<div class="steam-gauge" data-label="PRESSURE" data-value="72" data-size="280" data-readout="warning" data-bezel="seal" data-legend="NUEM8 STEAM GAUGE"></div>
<script src="steamGauge.js"></script>
```

`data-readout` may be `warning`, `keyhole`, or omitted for the number. `data-value` is a percent when it is above 1, or a fraction from 0 to 1. `data-bezel="seal"` draws the wide ring. `data-legend` is the engraved line along the top of that ring. Call `setSteamGauge(element, 40)` to sweep from the current needle position to a new number.

## Contact

[Kevin Roper](https://nuem8.com) at NueM8. Write to [admin@nuem8.com](mailto:admin@nuem8.com), or send a note from the [contact page](https://nuem8.com/contact).

Website: [nuem8.com](https://nuem8.com)
