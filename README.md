# 🐏 Enzo Is You - HTML5 Canvas Edition

An interactive, visual-heavy, procedurally audio-enabled clone of the award-winning puzzle game **Baba Is You** in HTML5 Canvas, Vanilla CSS, and modular Vanilla JavaScript. The entire codebase is self-contained and operates directly from a local drive (completely free of CORS issues).

### 🎮 [PLAY ONLINE NOW](https://enzocage.de/code/enzo_is_you)

---

## 📖 Table of Contents
1. [Core Concept & Rules](#-core-concept--rules)
2. [Key Features](#-key-features)
3. [The 20 Graphic Styles](#-the-20-graphic-styles)
4. [20 COLOURlovers Color Palettes](#-20-colourlovers-color-palettes)
5. [Audio Synthesizer Engine](#-audio-synthesizer-engine)
6. [Interactive Level Editor](#-interactive-level-editor)
7. [Controls & Mobile Accessibility](#-controls--mobile-accessibility)
8. [File Structure & Technical Architecture](#-file-structure--technical-architecture)
9. [Local Installation & Execution](#-local-installation--execution)

---

## 🧠 Core Concept & Rules

In **Enzo Is You**, the rules of the game are present in the levels themselves as pushable blocks. By manipulating word blocks, you change how the game behaves:
- Push words to align sentences in grid-aligned horizontal or vertical chains.
- Sentences follow the syntax: **`[Subject/Noun] IS [Predicate/Property or Noun]`** (e.g. `ENZO IS YOU`, `WALL IS STOP`, `ROCK IS PUSH`).
- **Dynamic Transformations**: Rearranging rules can change entities instantly (e.g. aligning `ROCK IS ENZO` turns every boulder into a controllable player).

### Rule Properties Mapped:
- **`YOU`**: Gives you keyboard/touch controls over the entity.
- **`STOP`**: Makes the entity solid; players cannot walk through it.
- **`PUSH`**: Makes the entity pushable by `YOU` characters.
- **`WIN`**: Touching this entity triggers level completion.
- **`DEFEAT`**: Touching this entity destroys the `YOU` character.
- **`SINK`**: Any entity walking onto this is destroyed along with the sink entity (swallowed up).
- **`HOT`** & **`MELT`**: If a `MELT` entity touches a `HOT` entity, the `MELT` entity dissolves.
- **`OPEN`** & **`SHUT`**: If an `OPEN` key overlaps a `SHUT` door, both are destroyed, unlocking the passage.

---

## ✨ Key Features

- **16 Classic-Inspired Puzzles**: Hand-crafted puzzles across 3 worlds with escalating difficulty (*Intro World*, *The Lake*, and *Solitary Island*).
- **Responsive Layout**: Adapts dynamically from massive desktop monitors to hand-held smartphone viewports.
- **Typography & Safeguards**: Text wiggles inside word containers but is dynamically downscaled via `ctx.measureText` parameters so it **never** touches or overflows container boundaries.
- **Frame-Interpolated Animations**: Character movement uses wobbly elastic squashing and sliding animations, creating a wobbly cartoon-like aesthetic.
- **Screen Shake & Particle Trails**: Tactile bumps, character dust trails, fluid splashes, explosions, and celebratory victory fireworks.

---

## 🎨 The 20 Graphic Styles

You can switch between **20 distinct graphic themes** in real-time, instantly transforming the visual look and particles:

### Original Styles
1. **Neon Cyberpunk (Default)**: Deep dark background, glowing neon outlines, neon round sparkles, grid line glows.
2. **Classic Retro Pixel**: Flat blocky retro shapes, thick 8-bit outlines, scrolling stars, and pixelated square particles.
3. **Chalkboard Sketch**: Chalkboard canvas, wobbly hand-drawn wobbly chalk lines, and drifting chalk dust particles.
4. **Blueprint Draughtsman**: Deep drafting paper, white technical design layout guidelines, coordinate markers.
5. **Monochrome GameBoy**: Retro olive-green palette (4 shades of green), pixelated grid LCD screen overlay, green square particles.
6. **Paper Cutout**: Pastel shaded cards, paper drop shadows on overlaps, drifting geometric confetti.
7. **Candy Land**: Fluffy cotton candy Enzo, chocolate bar walls, swirl lollipop flags, jelly water waves, molten strawberry lava.
8. **Matrix Digital Code**: Terminal black screen, cascading green katakana code rain. Sprites are drawn as green glowing characters (`B` for Enzo, `W` for Wall, `R` for Rock, `F` for Flag).
9. **Minimalist Geometric**: Clean solid flat shapes with pastel high-contrast colors and no outlines.
10. **Aura Watercolor**: Textured white paper, soft blending watercolor blobs, ink droplet particles.

### Google Material Design 3 Styles
1. **Material 3 Lavender**: Tonal Violet and Indigo theme on a soft lavender surface.
2. **Material 3 Mint**: Fresh Mint and Sage green theme with subtle forest accents.
3. **Material 3 Coral**: Warm peach surface with soft terracotta and coral tones.
4. **Material 3 Sky**: Icy blue surface with ocean blue elements and deep violet accents.
5. **Material 3 Lemon**: Bright cream-yellow surface with sunny lemon and amber tones.
6. **Material 3 Rose**: Soft pink blush surface with magenta rose and pastel crimson tones.
7. **Material 3 Emerald**: Elegant minty-white surface with deep emerald and jade green.
8. **Material 3 Clay**: Organic earthy sand surface with terracotta clay and mud rust tones.
9. **Material 3 Charcoal (Dark)**: Deep charcoal dark mode surface with glowing lavender and M3 dark outlines.
10. **Material 3 Warm Sand**: Warm cream surface with cozy amber, espresso, and warm taupe tones.

---

## 🌈 20 COLOURlovers Color Palettes

Under Settings in the sidebar, a **Color Palette** selector allows you to override the game elements' visual colors with the top 20 most loved color schemes of all time from [COLOURlovers](https://www.colourlovers.com/palettes/most-loved/all-time/meta):

- **Supported Schemes**: Giant Goldfish, Melancholy, Thought Provoking, Cheer Up Emo Kid, Vintage Cardigan, Moorish Garden, Couples Quarrel, Fresh Cut Day, Ocean Five, Clivia Cardigan, A Dream in Color, Quiet Cry, Wedding Spells, Curiosity Killed, Business of Silence, Sweet Lullaby, Daydreaming, I'm a Little Monster, Fading Star, and Citrus Salad.
- **How it Works**: The 5-color hex arrays are mapped to Enzo, Keke, walls, rocks, flags, keys, doors, hearts, skulls, grass, water, and lava.
- **Aesthetic Integration**: Color schemes integrate with your selected Graphic Style (e.g. playing *Chalkboard Sketch* or *Watercolor* using *Giant Goldfish* colors).

---

## 🔊 Audio Synthesizer Engine

The game incorporates a completely procedural audio engine in [sound.js](file:///c:/Users/enzoc/Desktop/AI%20Code/baba%20is%20you/sound.js) using the native **HTML5 Web Audio API**:
- **Generative Soundtrack**: Layered ambient synthesizer music playing an infinite pentatonic scale. The soundtrack has real-time frequency changes to match the pacing of the game.
- **Synthesized SFX**: Sound effects (movement wiggles, rule creation chimes, bump thuds, victory fanfares, and undo rewinds) are synthesized dynamically via oscillator nodes, completely eliminating external asset loads.

---

## 🛠️ Interactive Level Editor

Design, test, and save your own levels with the built-in Sandbox suite:
- **Responsive Painting**: Tap/drag to paint blocks; right-click to erase them. Supports full touchscreen painting.
- **Custom Sizing**: Modify layout bounds in real-time (width and height up to 30x30).
- **Import/Export**: Copy or paste level codes in standardized JSON format.
- **LocalStorage Saves**: Save your creations directly to your browser's local sandbox, allowing you to reload them later.

---

## 🎮 Controls & Mobile Accessibility

### Keyboard Layout
- **Movement / Direction**: Arrow keys / `W`, `A`, `S`, `D`
- **Rewind Turn (Undo)**: `Z`
- **Reset Level**: `R`
- **Exit Playtest Sandbox**: `Escape`

### Mobile Gestures & Touch D-Pad
- **Gesture Swipes**: Swipe in any direction on the canvas to move.
- **Invisible Touch D-Pad**: Tap anywhere on the canvas; the game calculates the click angle relative to the center, mapping your tap to the corresponding movement direction quadrant (UP, DOWN, LEFT, or RIGHT).
- **Sliding Drawers**: Click **Menu** in the mobile HUD header to slide open the settings drawer, or enter the **Level Editor** to open brush choices.

---

## 📂 File Structure & Technical Architecture

The project has a modular, object-oriented design spanning 7 core files:
1. **[index.html](file:///c:/Users/enzoc/Desktop/AI%20Code/baba%20is%20you/index.html)**: High-end HTML layout incorporating sidebar settings, modals, canvases, and font links.
2. **[index.css](file:///c:/Users/enzoc/Desktop/AI%20Code/baba%20is%20you/index.css)**: Glassmorphic borders, custom range inputs, layout animations, and mobile drawer styles.
3. **[renderer.js](file:///c:/Users/enzoc/Desktop/AI%20Code/baba%20is%20you/renderer.js)**: Full HTML5 Canvas vector engine containing graphics parameters, particle pools, and M3 styling.
4. **[game.js](file:///c:/Users/enzoc/Desktop/AI%20Code/baba%20is%20you/game.js)**: Coordinates turn-taking logic, rule parsing algorithms, and interaction overlaps solver.
5. **[editor.js](file:///c:/Users/enzoc/Desktop/AI%20Code/baba%20is%20you/editor.js)**: Captures input brushes, updates editor grids, and loads custom local sandboxes.
6. **[levels.js](file:///c:/Users/enzoc/Desktop/AI%20Code/baba%20is%20you/levels.js)**: Hard-coded database storing level sizes, text strings, and categorized coordinates.
7. **[sound.js](file:///c:/Users/enzoc/Desktop/AI%20Code/baba%20is%20you/sound.js)**: Configures low-frequency oscillators, delay nodes, and synth envelopes.

---

## 🚀 Local Installation & Execution

Since the project is built in raw Vanilla JavaScript and uses Web Audio APIs without requiring external API requests, you do not need Node.js or any compilers:

1. Clone or download the workspace directory.
2. Double-click **`index.html`** to run the game instantly in any web browser.
