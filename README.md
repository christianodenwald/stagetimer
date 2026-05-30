# StageTimer — Local

Simple local stage timer you can run on your machine. No build steps required.

Usage

- Open [index.html](index.html) directly in a browser (Chrome/Safari/Edge).
- Or run a local file server and open http://localhost:8000:

```bash
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Controls

- Set talk and Q&A minutes, then press `Set`.
- `Start`, `Pause`, `Reset`, `Next Phase` buttons control the countdown.
- Keyboard: `Space` to start/pause, `N` to go to next phase, `R` to reset.
- Click `Enter Fullscreen` for a full-screen large display.

Files

- [index.html](index.html)
- [app.js](app.js)
- [styles.css](styles.css)

Notes

- Designed to run locally on your device; no external dependencies.
- If audio doesn't play on first press, click `Start` (browsers require a user gesture to unlock audio).
