# Edge Detection Web Viewer

This directory contains a minimal TypeScript web viewer that displays processed frames from the Android app.

## Setup

```bash
npm install
npm run build
```

## Usage

Open `index.html` in a web browser. The page will display:

- A sample processed frame (Canny edges)
- FPS counter (simulated)
- Resolution information
- System architecture overview

## Adding Your Processed Frame

1. Run the Android app and capture a processed frame
2. Save it as `assets/sample.png`
3. Refresh the web page

The viewer will automatically display your frame with overlay statistics.
