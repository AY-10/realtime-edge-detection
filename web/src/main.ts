/**
 * Interactive Canvas Edge Viewer
 * - Client-side Sobel edge detection (for demo/presentation)
 * - File upload / start / stop / download
 * - FPS measured from the rendering loop
 */

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const fpsEl = document.getElementById("fps")!;
const resEl = document.getElementById("res")!;
const statusEl = document.getElementById("status")!;
const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const uploadBtn = document.getElementById("uploadBtn") as HTMLButtonElement;
const startBtn = document.getElementById("startBtn") as HTMLButtonElement;
const stopBtn = document.getElementById("stopBtn") as HTMLButtonElement;
const downloadBtn = document.getElementById("downloadBtn") as HTMLButtonElement;
const fallbackImg = document.getElementById("fallbackImg") as HTMLImageElement;
const processingIndicator = document.getElementById(
  "processingIndicator"
) as HTMLDivElement;
const progressBar = document.getElementById("progressBar") as HTMLDivElement;

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const offCanvas = document.createElement("canvas");
const offCtx = offCanvas.getContext("2d") as CanvasRenderingContext2D;

let lastTime = performance.now();
let frameCount = 0;
let currentFPS = 0;
let running = false;
let sourceImage: HTMLImageElement | null = null;

// Default processing params
let threshold = 100; // simple threshold for Sobel magnitude (0-255)

// Toast notification
function showToast(message: string, icon = "✓") {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}

// Helper: set status text
function setStatus(text: string) {
  if (statusEl) {
    statusEl.textContent = text;
  }
}

// Load default fallback image at startup
function initDefaultImage() {
  processingIndicator.style.display = "flex";
  sourceImage = new Image();
  sourceImage.crossOrigin = "anonymous";
  sourceImage.src = fallbackImg.src || "assets/sample.svg";
  sourceImage.onload = () => {
    resizeToSource();
    renderProcessed(); // render once immediately
    setStatus("Ready");
    processingIndicator.style.display = "none";
    showToast("Sample image loaded", "📷");
    console.log("✅ Fallback image loaded for demo");
  };
  sourceImage.onerror = () => {
    setStatus("Load Failed");
    processingIndicator.style.display = "none";
    showToast("Failed to load image", "❌");
    console.error("❌ Failed to load fallback image");
  };
}

function resizeToSource() {
  if (!sourceImage) return;
  const maxW = 900;
  const scale = Math.min(1, maxW / sourceImage.naturalWidth || 1);
  const w = Math.max(
    320,
    Math.round((sourceImage.naturalWidth || 640) * scale)
  );
  const h = Math.max(
    240,
    Math.round((sourceImage.naturalHeight || 480) * scale)
  );
  canvas.width = w;
  canvas.height = h;
  offCanvas.width = w;
  offCanvas.height = h;
  resEl.textContent = `${w}×${h}`;
}

// Simple grayscale conversion
function toGrayscale(data: Uint8ClampedArray, w: number, h: number) {
  const gray = new Float32Array(w * h);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    gray[j] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  return gray;
}

// Sobel operator implementation (returns Float32Array magnitude)
function sobel(gray: Float32Array, w: number, h: number) {
  const out = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx =
        -gray[i - w - 1] -
        2 * gray[i - 1] -
        gray[i + w - 1] +
        gray[i - w + 1] +
        2 * gray[i + 1] +
        gray[i + w + 1];
      const gy =
        -gray[i - w - 1] -
        2 * gray[i - w] -
        gray[i - w + 1] +
        gray[i + w - 1] +
        2 * gray[i + w] +
        gray[i + w + 1];
      out[i] = Math.hypot(gx, gy);
    }
  }
  return out;
}

function renderProcessed() {
  if (!sourceImage) return;
  // draw source into offscreen (scaled)
  offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);
  offCtx.drawImage(sourceImage, 0, 0, offCanvas.width, offCanvas.height);

  const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
  const w = imgData.width;
  const h = imgData.height;
  const gray = toGrayscale(imgData.data, w, h);
  const edges = sobel(gray, w, h);

  // find max to normalize
  let max = 0;
  for (let i = 0; i < edges.length; i++) {
    if (edges[i] > max) max = edges[i];
  }
  const scale = max > 0 ? 255 / max : 1;

  const out = ctx.createImageData(w, h);
  for (let i = 0, j = 0; i < edges.length; i++, j += 4) {
    const v = Math.min(255, Math.round(edges[i] * scale));
    const px = v >= threshold ? 255 : 0; // binary threshold for demo clarity
    out.data[j] = px;
    out.data[j + 1] = px;
    out.data[j + 2] = px;
    out.data[j + 3] = 255;
  }

  ctx.putImageData(out, 0, 0);
}

// Rendering loop
function loop(now: number) {
  frameCount++;
  renderProcessed();

  // FPS calc
  const elapsed = now - lastTime;
  if (elapsed >= 1000) {
    currentFPS = Math.round((frameCount * 1000) / elapsed);
    fpsEl.textContent = String(currentFPS);
    if (currentFPS >= 55) {
      fpsEl.className = "stat-value fps-high";
    } else if (currentFPS >= 30) {
      fpsEl.className = "stat-value";
    } else {
      fpsEl.className = "stat-value warning";
    }
    frameCount = 0;
    lastTime = now;
  }

  if (running) requestAnimationFrame(loop);
}

// Start/Stop handlers
startBtn?.addEventListener("click", () => {
  if (!sourceImage) {
    showToast("Please load an image first", "⚠️");
    return;
  }
  if (!running) {
    running = true;
    lastTime = performance.now();
    frameCount = 0;
    requestAnimationFrame(loop);
    setStatus("Running");
    startBtn.style.opacity = "0.5";
    stopBtn.style.opacity = "1";
    progressBar.classList.add("active");
    showToast("Processing started", "▶️");
  }
});

stopBtn?.addEventListener("click", () => {
  running = false;
  setStatus("Paused");
  startBtn.style.opacity = "1";
  stopBtn.style.opacity = "0.5";
  progressBar.classList.remove("active");
  showToast("Processing paused", "⏸️");
});

uploadBtn?.addEventListener("click", () => fileInput.click());
fileInput?.addEventListener("change", (ev) => {
  const f = fileInput.files?.[0];
  if (!f) return;

  processingIndicator.style.display = "flex";
  const url = URL.createObjectURL(f);
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    sourceImage = img;
    resizeToSource();
    renderProcessed(); // render once immediately
    setStatus("Uploaded");
    processingIndicator.style.display = "none";
    showToast(`Loaded: ${f.name}`, "✓");
    URL.revokeObjectURL(url);
  };
  img.onerror = () => {
    console.error("Failed to load uploaded image");
    setStatus("Upload Error");
    processingIndicator.style.display = "none";
    showToast("Failed to load image", "❌");
  };
  img.src = url;
});

downloadBtn?.addEventListener("click", () => {
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = `edge-${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast("Image downloaded", "💾");
});

// Keyboard shortcuts
document.addEventListener("keydown", (e: KeyboardEvent) => {
  switch (e.key.toLowerCase()) {
    case "r":
      location.reload();
      break;
    case "f":
      const container = document.getElementById("container");
      if (!document.fullscreenElement) {
        container?.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      break;
    case " ": // space toggles
      running = !running;
      if (running) {
        lastTime = performance.now();
        requestAnimationFrame(loop);
        setStatus("Running");
        progressBar.classList.add("active");
      } else {
        setStatus("Paused");
        progressBar.classList.remove("active");
      }
      break;
  }
});

// Expose debug helpers
(window as any).viewerDebug = {
  getFPS: () => currentFPS,
  isRunning: () => running,
  start: () => startBtn.click(),
  stop: () => stopBtn.click(),
  setThreshold: (v: number) => (threshold = v),
};

// init
initDefaultImage();
setStatus("Loading...");
stopBtn.style.opacity = "0.5";
console.log(
  "🚀 Interactive Edge Viewer ready. Use upload, start, stop and download buttons."
);
console.log(
  "💡 Keyboard: R (reload) | F (fullscreen) | Space (toggle processing)"
);
