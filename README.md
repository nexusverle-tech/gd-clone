# Geometry Dash — Clone (polished textures + tuning)

This folder contains an improved iteration of the Geometry Dash clone with:
# Geometry Dash — Clone (polished textures + tuning)

This folder contains an improved iteration of the Geometry Dash clone with:

- Texture assets (SVG) for background and block tiles
- Live tuning controls (gravity, speed, jump, hold) for playtesting
- Improved player gradient + glow and tile-based block rendering

How to try locally
1. Open `gd-clone/index.html` in a modern browser (drag into browser or use a simple static server).

Example using Python (in the parent directory):

```bash
cd gd-clone
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Particle settings
 Use the sliders in the top bar to change particle multiplier, size and gravity, and toggle sprite particles on/off.
 Save and load your favorite particle settings as presets using the Save/Load buttons.

## Packaging and Web Deploy

To package your game for the web:

1. Download all files in the `gd-clone` folder, including the `assets` directory and all sound/image files.
2. (Optional) Zip the folder for easy sharing.
3. To run locally, open `index.html` in your browser, or use a static server:

```bash
cd gd-clone
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

To deploy online, upload the folder to any static web host (GitHub Pages, Netlify, Vercel, etc.).
What I changed
- Added `assets/bg.svg` and `assets/tile.svg` and updated `game.js` to use them as textures when available.
- Added tuning sliders in the UI so you can play and adjust physics live.
- Added particle settings in the UI so you can adjust particle visuals and behavior.

Next steps I can do for you
- Further polish visuals (animated background layers, particle effects on death/jump)
- Add more obstacle types (moving platforms, portals)
- Create a UI to save tuned physics presets

Tell me which of those you'd like next or if you want me to further tweak the physics now.
