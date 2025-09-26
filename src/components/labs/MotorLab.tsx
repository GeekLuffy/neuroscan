// MotorLabWithReport_Fixed.tsx
import React, { useEffect, useRef, useState } from "react";
import { HandLandmarker, FilesetResolver, DrawingUtils} from "@mediapipe/tasks-vision";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Camera as CameraIcon, Play } from "lucide-react";

const WASM_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm";
const MODEL_PATH = "/models/hand_landmarker.task";

let globalHandLandmarker: HandLandmarker | undefined;
let globalLastVideoTime = -1;

type TremorSample = { t: number; y: number };

export const MotorLabWithReport_Fixed: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [permission, setPermission] = useState<"idle" | "granted" | "denied">("idle");
  const [testDuration, setTestDuration] = useState(0);
  const [fingerTaps, setFingerTaps] = useState(0);
  const [tapIntervals, setTapIntervals] = useState<number[]>([]);
  const [status, setStatus] = useState('Click "Enable Camera" to begin motor assessment');
  const [thresholdFraction, setThresholdFraction] = useState(0.05);
  const [handsDetected, setHandsDetected] = useState(0);
  const [lastDistancePx, setLastDistancePx] = useState<number | null>(null);
  const [tapDetectedFrame, setTapDetectedFrame] = useState(false);
  const [tremorSamples, setTremorSamples] = useState<TremorSample[]>([]);

  const fingerTapsRef = useRef(0);
  const tremorSamplesRef = useRef<TremorSample[]>([]);
  const lastTapTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const renderLoopStartedRef = useRef(false);
  const isRecordingRef = useRef(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);

  // --- Load model ---
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setStatus("Loading ML runtime + model...");
        const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
        globalHandLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_PATH },
          runningMode: "VIDEO",
          numHands: 2,
        });
        if (!mounted) return;
        setStatus('Model loaded. Click "Enable Camera" to begin motor assessment');
      } catch (err) {
        console.error("Model init error:", err);
        setStatus("Failed to load model. Check console/model path.");
      }
    })();
    return () => {
      mounted = false;
      if (timerRef.current) window.clearInterval(timerRef.current);
      try { globalHandLandmarker?.close(); } catch { }
      globalHandLandmarker = undefined;
    };
  }, []);

  // --- Camera init ---
  async function initCamera() {
    if (!videoRef.current) return;
    try {
      setStatus("Requesting camera permission...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setPermission("granted");
      setStatus("Camera ready. Click Start Test to begin measurement.");

      if (!renderLoopStartedRef.current) {
        renderLoopStartedRef.current = true;
        requestAnimationFrame(predictWebcam);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setPermission("denied");
      setStatus("Camera permission denied.");
    }
  }

  // --- Start/stop recording ---
  function beginRecording() {
    setIsRecording(true);
    isRecordingRef.current = true;
    setTestDuration(0);
    setFingerTaps(0);
    fingerTapsRef.current = 0;
    setTapIntervals([]);
    tremorSamplesRef.current = [];
    setTremorSamples([]);
    lastTapTimeRef.current = null;
    setStatus("Test running — tap index & thumb rapidly for 5s");

    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTestDuration(prev => {
        const next = +(prev + 0.1).toFixed(1);
        if (next >= 5) { stopTest(); return 5; }
        return next;
      });
    }, 100);
  }

  function startTest() {
    if (permission !== "granted") { setStatus("Please enable camera first."); return; }
    if (isRecordingRef.current) return;
    beginRecording();
  }

  function stopTest() {
    setIsRecording(false);
    isRecordingRef.current = false;
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    setStatus("Test complete. See results & report below.");
  }

  // --- Helpers ---
  function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, label?: string) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    if (label) { ctx.font = "12px Arial"; ctx.fillStyle = "white"; ctx.fillText(label, x + 8, y - 8); }
  }

  function registerTap() {
    const now = Date.now();
    const last = lastTapTimeRef.current ?? 0;
    if (now - last <= 200) return false;
    lastTapTimeRef.current = now;

    setFingerTaps(prev => { const next = prev + 1; fingerTapsRef.current = next; return next; });
    setTapIntervals(prev => { const next = [...prev, now - (last || now)]; if (next.length > 600) next.splice(0, next.length - 600); return next; });
    return true;
  }

  // --- Prediction/render loop ---
function predictWebcam() {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  if (!video || !canvas || !globalHandLandmarker) {
    requestAnimationFrame(predictWebcam);
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    requestAnimationFrame(predictWebcam);
    return;
  }
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    requestAnimationFrame(predictWebcam);
    return;
  }
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  // 👇 ADD THIS LINE to create an instance of DrawingUtils
  const drawingUtils = new DrawingUtils(ctx);

  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    if (isRecordingRef.current && video.currentTime !== globalLastVideoTime) {
      globalLastVideoTime = video.currentTime;
      const results = globalHandLandmarker.detectForVideo(video, performance.now());
      const landmarksArray = results?.landmarks ?? [];
      setHandsDetected(landmarksArray.length);
      setTapDetectedFrame(false);
      setLastDistancePx(null);

      if (landmarksArray.length > 0) {
        let minDist = Infinity;
        for (let i = 0; i < landmarksArray.length; i++) {
          const lm = landmarksArray[i];

          drawingUtils.drawLandmarks(lm, {
            color: "#FF0000",
            lineWidth: 2,
            radius: 5,
          });
          const connections: { start: number; end: number }[] =
            HAND_CONNECTIONS.map(([start, end]) => ({ start, end }));

          drawingUtils.drawConnectors(lm, connections, {
            color: "#00FF00",
            lineWidth: 5,
          });

          if (lm[8] && lm[4]) {
            const x8 = lm[8].x * video.videoWidth, y8 = lm[8].y * video.videoHeight;
            const x4 = lm[4].x * video.videoWidth, y4 = lm[4].y * video.videoHeight;
            const d = Math.hypot(x8 - x4, y8 - y4);
            if (d < minDist) minDist = d;
            drawDot(ctx, x8, y8, "lime", `h${i} idx`);
            drawDot(ctx, x4, y4, "orange", `h${i} thb`);
          }

          if (lm[0]) {
            tremorSamplesRef.current.push({ t: Date.now(), y: lm[0].y * video.videoHeight });
          }
        }
        
        if (tremorSamplesRef.current.length > 300) tremorSamplesRef.current.splice(0, tremorSamplesRef.current.length - 300);
        setTremorSamples([...tremorSamplesRef.current]);

        if (minDist !== Infinity) {
          setLastDistancePx(Math.round(minDist));
          const TAP_THRESHOLD_PX = Math.min(video.videoWidth, video.videoHeight) * thresholdFraction;
          if (minDist < TAP_THRESHOLD_PX) {
            setTapDetectedFrame(true);
            registerTap();
          }
        }
      }
    }
  } catch (err) {
    console.error("Detection loop error:", err);
    setStatus("Error running model: Please run this lab on localhost, because due to the DeepLearning requirements, it cannot be run on vercel.");
  }

  requestAnimationFrame(predictWebcam);
}

  // --- Metrics ---
  function computeTremorMetrics(samples: TremorSample[]) {
    if (!videoRef.current || samples.length < 6) return { ampNorm: 0, freqHz: 0 };
    const ys = samples.map(s => s.y), ts = samples.map(s => s.t);
    const n = ys.length, mean = ys.reduce((a,b)=>a+b,0)/n;
    const std = Math.sqrt(ys.map(y=>(y-mean)**2).reduce((a,b)=>a+b,0)/n);
    const ampNorm = std / videoRef.current.videoHeight;
    const durationMs = ts[n-1]-ts[0];
    if (durationMs <= 0) return { ampNorm, freqHz: 0 };
    const fs = (n-1)/(durationMs/1000.0);
    let bestK=-1,bestMag=0;
    for(let k=1;k<=Math.floor(n/2);k++){let re=0,im=0;for(let j=0;j<n;j++){const angle=(-2*Math.PI*k*j)/n; re+=ys[j]*Math.cos(angle); im+=ys[j]*Math.sin(angle);} const mag=Math.sqrt(re*re+im*im); if(mag>bestMag){bestMag=mag;bestK=k;}}
    const freqHz = bestK>0 ? (bestK*fs)/n : 0;
    return { ampNorm, freqHz };
  }

  function computeCoordinationScore(intervals: number[]) {
    if (intervals.length <= 1) return 0;
    const mean = intervals.reduce((a,b)=>a+b,0)/intervals.length;
    if(mean===0) return 0;
    const std = Math.sqrt(intervals.map(x=>(x-mean)**2).reduce((a,b)=>a+b,0)/intervals.length);
    const cv = std/mean;
    return Math.round(Math.max(0,Math.min(100,(1/(1+cv))*100)));
  }

  function computeMovementQuality(coordination:number, tremorAmpNorm:number){
    const tremorPenalty=Math.min(100,tremorAmpNorm*300*100)/100;
    return Math.round(Math.max(0,Math.min(100,coordination*0.7+(100-tremorPenalty)*0.3)));
  }

  const tremorMetrics = computeTremorMetrics(tremorSamplesRef.current);
  const tremorAmpPercent = tremorMetrics.ampNorm*100;
  const coordinationScore = computeCoordinationScore(tapIntervals);
  const movementQuality = computeMovementQuality(coordinationScore, tremorMetrics.ampNorm);
  const tapRate = testDuration>0 ? fingerTaps/testDuration : 0;

  return (
    <div className="space-y-8 pt-24">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold">Motor & Tremor Lab</h1>
        <p className="text-lg text-muted-foreground">{status}</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex-1 text-center sm:text-left"><p className="text-sm text-muted-foreground">{status}</p></div>
        <div className="flex gap-2">
          <Button onClick={initCamera} variant="secondary">
            <CameraIcon className="w-4 h-4 mr-2"/> Enable Camera
          </Button>
          <Button onClick={startTest} disabled={permission!=="granted"||isRecording}>
            {isRecording ? `Testing... ${testDuration.toFixed(1)}s` : <><Play className="w-4 h-4 mr-2"/> Start 5s Test</>}
          </Button>
        </div>
      </div>

      {/* Video + Metrics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Camera Feed */}
        <Card>
          <CardHeader><CardTitle>Movement Capture</CardTitle><CardDescription>Visual + calibration</CardDescription></CardHeader>
          <CardContent>
            <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay style={{ transform:"scaleX(-1)" }} />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform:"scaleX(-1)" }} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>Hands detected: <strong>{handsDetected}</strong></div>
              <div>Tap count: <strong>{fingerTaps}</strong></div>
              <div>Last distance (px): <strong>{lastDistancePx??"-"}</strong></div>
              <div>Tap rate: <strong>{tapRate.toFixed(2)} taps/sec</strong></div>
              <div>Tap this frame: <strong>{tapDetectedFrame?"YES":"no"}</strong></div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics & Report */}
        <Card>
          <CardHeader><CardTitle>Analysis & Report</CardTitle><CardDescription>Metrics & tremor</CardDescription></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div>Tap Count</div>
                <div className="text-xl font-bold">{fingerTaps}</div>
                <div className="text-xs text-muted-foreground">{tapRate.toFixed(2)} taps/sec</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div>Tremor (Hz)</div>
                <div className="text-xl font-bold">{tremorMetrics.freqHz>0?tremorMetrics.freqHz.toFixed(2):"—"}</div>
                <div className="text-xs text-muted-foreground">{tremorAmpPercent.toFixed(3)}% amp</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div>Coordination</div>
                <div className="text-xl font-bold">{coordinationScore}%</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div>Movement Quality</div>
                <div className="text-xl font-bold">{movementQuality}</div>
              </div>
            </div>

            {/* Report */}
            <div className="mt-4 p-4 border rounded-lg bg-muted/10 text-sm space-y-2">
              <div><strong>Test Duration:</strong> {testDuration.toFixed(1)} s</div>
              <div><strong>Total Taps:</strong> {fingerTaps}</div>
              <div><strong>Average Tap Rate:</strong> {tapRate.toFixed(2)} taps/sec</div>
              <div><strong>Tremor Amplitude:</strong> {tremorAmpPercent.toFixed(3)}%</div>
              <div><strong>Tremor Frequency:</strong> {tremorMetrics.freqHz.toFixed(2)} Hz</div>
              <div><strong>Coordination Score:</strong> {coordinationScore}%</div>
              <div><strong>Movement Quality:</strong> {movementQuality}%</div>
            </div>

            <div className="mt-4"><Progress value={movementQuality} className="h-3" /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MotorLabWithReport_Fixed;
