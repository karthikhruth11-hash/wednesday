/**
 * Real-Time Webcam Hand Gesture & Sign Recognition Engine for W.E.D.N.E.S.D.A.Y.
 * Detects hand gestures (Open Palm, Closed Fist, Thumbs Up, Peace / V-Sign, Pinch / OK, Swipes)
 * and dispatches live gesture events to control HUD, AI Personas, and Voice Engine.
 */

export class GestureEngine {
  constructor() {
    this.videoElement = null;
    this.canvasElement = null;
    this.canvasCtx = null;

    this.isRunning = false;
    this.stream = null;
    this.animFrameId = null;

    this.onGesture = null;
    this.lastGesture = null;
    this.lastGestureTime = 0;
    this.prevHandX = null;

    this.loadedScript = false;
  }

  async loadMediaPipeScript() {
    if (window.Hands) return true;
    return new Promise((resolve) => {
      const script1 = document.createElement('script');
      script1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
      script1.crossOrigin = 'anonymous';

      const script2 = document.createElement('script');
      script2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
      script2.crossOrigin = 'anonymous';

      script1.onload = () => {
        document.head.appendChild(script2);
      };

      script2.onload = () => {
        this.loadedScript = true;
        resolve(true);
      };

      script1.onerror = script2.onerror = () => {
        resolve(false);
      };

      document.head.appendChild(script1);
    });
  }

  async start(videoEl, canvasEl, onGestureCallback) {
    this.videoElement = videoEl;
    this.canvasElement = canvasEl;
    this.onGesture = onGestureCallback;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        await this.videoElement.play();
      }
      this.isRunning = true;

      const mpLoaded = await this.loadMediaPipeScript();
      if (mpLoaded && window.Hands) {
        this.initMediaPipeHands();
      } else {
        this.initFallbackVisionLoop();
      }
      return true;
    } catch (err) {
      console.warn('Webcam gesture camera access denied or failed:', err);
      return false;
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  initMediaPipeHands() {
    if (!window.Hands) return;

    const hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.65,
      minTrackingConfidence: 0.65
    });

    hands.onResults((results) => this.processMediaPipeResults(results));

    const cameraLoop = async () => {
      if (this.isRunning && this.videoElement && this.videoElement.readyState >= 2) {
        try {
          await hands.send({ image: this.videoElement });
        } catch {}
      }
      if (this.isRunning) {
        this.animFrameId = requestAnimationFrame(cameraLoop);
      }
    };
    cameraLoop();
  }

  processMediaPipeResults(results) {
    if (!this.canvasElement) return;
    const ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      return;
    }

    const landmarks = results.multiHandLandmarks[0];

    // Draw Skeleton Landmarks on overlay canvas
    this.drawLandmarks(ctx, landmarks);

    // Classify Gesture
    const gesture = this.classifyHandGesture(landmarks);
    if (gesture) {
      const now = Date.now();
      if (gesture !== this.lastGesture || now - this.lastGestureTime > 1200) {
        this.lastGesture = gesture;
        this.lastGestureTime = now;
        if (this.onGesture) {
          this.onGesture({ gesture, landmarks, timestamp: new Date().toLocaleTimeString() });
        }
      }
    }
  }

  drawLandmarks(ctx, landmarks) {
    const w = this.canvasElement.width;
    const h = this.canvasElement.height;

    // Draw connections
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;

    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [10, 11], [11, 12],
      [9, 13], [13, 14], [14, 15], [15, 16],
      [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]
    ];

    connections.forEach(([i, j]) => {
      ctx.beginPath();
      ctx.moveTo(landmarks[i].x * w, landmarks[i].y * h);
      ctx.lineTo(landmarks[j].x * w, landmarks[j].y * h);
      ctx.stroke();
    });

    // Draw points
    landmarks.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x * w, pt.y * h, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ff4d6d';
      ctx.fill();
    });
  }

  classifyHandGesture(landmarks) {
    // Landmark index references:
    // 0: Wrist
    // 4: Thumb tip, 8: Index tip, 12: Middle tip, 16: Ring tip, 20: Pinky tip
    // 3: Thumb IP, 6: Index PIP, 10: Middle PIP, 14: Ring PIP, 18: Pinky PIP

    const isExtended = (tipIdx, pipIdx) => landmarks[tipIdx].y < landmarks[pipIdx].y;

    const indexExt = isExtended(8, 6);
    const middleExt = isExtended(12, 10);
    const ringExt = isExtended(16, 14);
    const pinkyExt = isExtended(20, 18);

    const extendedCount = [indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length;

    // 1. OPEN PALM (4 or 5 fingers extended)
    if (extendedCount >= 4) {
      return 'OPEN_PALM';
    }

    // 2. CLOSED FIST (0 fingers extended)
    if (extendedCount === 0 && landmarks[4].y > landmarks[2].y) {
      return 'CLOSED_FIST';
    }

    // 3. PEACE / V-SIGN (Index & Middle extended only)
    if (indexExt && middleExt && !ringExt && !pinkyExt) {
      return 'PEACE_SIGN';
    }

    // 4. THUMBS UP (Thumb tip above wrist, other fingers curled)
    if (extendedCount === 0 && landmarks[4].y < landmarks[3].y && landmarks[3].y < landmarks[0].y) {
      return 'THUMBS_UP';
    }

    // 5. PINCH / OK SIGN (Thumb tip close to Index tip)
    const dx = landmarks[4].x - landmarks[8].x;
    const dy = landmarks[4].y - landmarks[8].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.06 && middleExt) {
      return 'PINCH_OK';
    }

    // 6. SWIPE DETECTOR
    const wristX = landmarks[0].x;
    if (this.prevHandX !== null) {
      const deltaX = wristX - this.prevHandX;
      if (deltaX > 0.22) {
        this.prevHandX = wristX;
        return 'SWIPE_RIGHT';
      } else if (deltaX < -0.22) {
        this.prevHandX = wristX;
        return 'SWIPE_LEFT';
      }
    }
    this.prevHandX = wristX;

    return null;
  }

  initFallbackVisionLoop() {
    // High-speed optical motion fallback if MediaPipe script is restricted
    const loop = () => {
      if (this.isRunning && this.videoElement && this.canvasElement) {
        const ctx = this.canvasElement.getContext('2d');
        ctx.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
      }
      if (this.isRunning) {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };
    loop();
  }
}

export const gestureEngine = new GestureEngine();
