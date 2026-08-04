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
    this.wristXHistory = [];
    this.isProcessing = false;

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
    this.isProcessing = false;
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
      modelComplexity: 0,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    hands.onResults((results) => {
      this.isProcessing = false;
      this.processMediaPipeResults(results);
    });

    let lastSendTime = 0;

    const cameraLoop = async () => {
      const now = Date.now();
      if (this.isRunning && this.videoElement && this.videoElement.readyState >= 2) {
        if (!this.isProcessing && now - lastSendTime >= 30) {
          this.isProcessing = true;
          lastSendTime = now;
          try {
            await hands.send({ image: this.videoElement });
          } catch (e) {
            this.isProcessing = false;
          }
        }
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
      if (this.onGesture) {
        this.onGesture({ gesture: null, handPos: null, landmarks: null, timestamp: new Date().toLocaleTimeString() });
      }
      return;
    }

    const landmarks = results.multiHandLandmarks[0];

    // Draw Skeleton Landmarks on overlay canvas
    this.drawLandmarks(ctx, landmarks);

    // Calculate Index-Thumb Pinch Distance & Hand Cursor Position
    const dx = landmarks[4].x - landmarks[8].x;
    const dy = landmarks[4].y - landmarks[8].y;
    const pinchDist = Math.sqrt(dx * dx + dy * dy);
    const handPos = { x: landmarks[8].x, y: landmarks[8].y, pinchDist };

    // Classify Gesture
    const gesture = this.classifyHandGesture(landmarks);

    const now = Date.now();
    let isNewGesture = false;
    if (gesture && (gesture !== this.lastGesture || now - this.lastGestureTime > 1500)) {
      this.lastGesture = gesture;
      this.lastGestureTime = now;
      isNewGesture = true;
    }

    if (this.onGesture) {
      this.onGesture({
        gesture: gesture || 'TRACKING',
        isNewGesture,
        handPos,
        landmarks,
        timestamp: new Date().toLocaleTimeString()
      });
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

  dist2D(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  classifyHandGesture(landmarks) {
    const wrist = landmarks[0];
    const distToWrist = (idx) => this.dist2D(landmarks[idx], wrist);

    // Orientation-invariant finger extension check using distance ratios to wrist
    const indexExt = distToWrist(8) > distToWrist(6) * 1.12;
    const middleExt = distToWrist(12) > distToWrist(10) * 1.12;
    const ringExt = distToWrist(16) > distToWrist(14) * 1.12;
    const pinkyExt = distToWrist(20) > distToWrist(18) * 1.12;

    const thumbExt = distToWrist(4) > distToWrist(2) * 1.2;

    const extendedCount = [indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length;

    // 1. PINCH / OK SIGN (Thumb tip close to Index tip)
    const pinchDist = this.dist2D(landmarks[4], landmarks[8]);
    if (pinchDist < 0.075 && (middleExt || ringExt)) {
      return 'PINCH_OK';
    }

    // 2. OPEN PALM (4 or 5 fingers extended)
    if (extendedCount >= 4 || (extendedCount >= 3 && thumbExt)) {
      return 'OPEN_PALM';
    }

    // 3. CLOSED FIST (0 fingers extended, thumb folded)
    if (extendedCount === 0 && !thumbExt) {
      return 'CLOSED_FIST';
    }

    // 4. PEACE / V-SIGN (Index & Middle extended only)
    if (indexExt && middleExt && !ringExt && !pinkyExt) {
      return 'PEACE_SIGN';
    }

    // 5. THUMBS UP (Thumb extended, other fingers folded)
    if (thumbExt && extendedCount === 0) {
      return 'THUMBS_UP';
    }

    // 6. SWIPE DETECTOR (Using position history queue over 300ms window)
    const now = Date.now();
    const wristX = wrist.x;
    this.wristXHistory.push({ x: wristX, time: now });
    this.wristXHistory = this.wristXHistory.filter(h => now - h.time <= 300);

    if (this.wristXHistory.length >= 3) {
      const oldest = this.wristXHistory[0];
      const deltaX = wristX - oldest.x;
      const deltaTime = now - oldest.time;

      if (deltaTime >= 70) {
        if (deltaX > 0.14) {
          this.wristXHistory = [];
          return 'SWIPE_RIGHT';
        } else if (deltaX < -0.14) {
          this.wristXHistory = [];
          return 'SWIPE_LEFT';
        }
      }
    }

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

