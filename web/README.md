# 🎥 Real-Time Edge Detection Web Viewer

A modern, interactive TypeScript-powered web viewer for visualizing edge detection output from the Android application.

## ✨ Features

- **Real-Time FPS Monitoring**: Dynamic frame rate calculation and display
- **Responsive Design**: Modern UI with smooth animations and hover effects
- **Interactive Controls**: Fullscreen mode and refresh functionality
- **Keyboard Shortcuts**: Quick access to viewer functions
- **Performance Metrics**: Detailed logging and debugging tools
- **Mobile Responsive**: Optimized for all screen sizes

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
cd web
npm install
```

### Development

```bash
# Compile TypeScript
npm run build

# Start local server
python -m http.server 8000
```

### Access

```
http://localhost:8000
```

## ⌨️ Keyboard Shortcuts

| Key | Action                     |
| --- | -------------------------- |
| `R` | Refresh viewer             |
| `F` | Toggle fullscreen          |
| `I` | Show debug info in console |

## 🛠️ Technology Stack

- **TypeScript 5.3**: Type-safe code with modern ES6+ features
- **CSS3**: Advanced animations, gradients, and glassmorphism effects
- **Google Fonts**: Inter & JetBrains Mono for clean typography
- **HTML5**: Semantic markup with accessibility features

## 🔧 Debug Tools

The viewer exposes debug utilities via `window.viewerDebug`:

```javascript
viewerDebug.getFPS(); // Get current FPS
viewerDebug.getResolution(); // Get image resolution
viewerDebug.isLoaded(); // Check if image loaded
viewerDebug.refresh(); // Reload page
viewerDebug.metrics(); // Log performance table
```

## 📱 Integration with Android App

1. Build and run the Android app
2. Capture processed frames from the device
3. Save frames to `web/assets/` directory
4. Refresh the web viewer to see real-time output

---

**Built with ❤️ for Flam Placement Drive Assignment**
