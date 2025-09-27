// MotorLabWithReport_Fixed.tsx
import React, { useEffect, useRef, useState } from "react";
import { HandLandmarker, FilesetResolver, DrawingUtils} from "@mediapipe/tasks-vision";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Camera as CameraIcon, Play, Brain, Lightbulb, FileText } from "lucide-react";

const WASM_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm";
const MODEL_PATH = "/models/hand_landmarker.task";

let globalHandLandmarker: HandLandmarker | undefined;
let globalLastVideoTime = -1;

type TremorSample = { t: number; y: number };

export const MotorLab: React.FC = () => {
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
    
    // Check if mediaDevices is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("Camera API not available");
      setPermission("denied");
      setStatus("Camera API not available. Please use HTTPS or a modern browser.");
      return;
    }
    
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
      
      // Provide more specific error messages
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setStatus("Camera permission denied. Please allow camera access and try again.");
        } else if (err.name === 'NotFoundError') {
          setStatus("No camera found. Please connect a camera and try again.");
        } else if (err.name === 'NotSupportedError') {
          setStatus("Camera not supported. Please use HTTPS or a modern browser.");
        } else {
          setStatus(`Camera error: ${err.message}`);
        }
      } else {
        setStatus("Camera access failed. Please check permissions and try again.");
      }
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

  // Enhanced analysis functions
  function getRiskLevel(score: number, type: 'coordination' | 'tremor' | 'speed'): { level: string; color: string; description: string } {
    if (type === 'coordination') {
      if (score >= 80) return { level: 'Excellent', color: 'text-green-400', description: 'Very good motor coordination' };
      if (score >= 60) return { level: 'Good', color: 'text-blue-400', description: 'Normal coordination patterns' };
      if (score >= 40) return { level: 'Fair', color: 'text-yellow-400', description: 'Mild coordination irregularities' };
      return { level: 'Poor', color: 'text-red-400', description: 'Significant coordination issues detected' };
    }
    if (type === 'tremor') {
      if (tremorMetrics.freqHz === 0) return { level: 'None', color: 'text-green-400', description: 'No significant tremor detected' };
      if (tremorMetrics.freqHz < 4) return { level: 'Low', color: 'text-blue-400', description: 'Minimal tremor activity' };
      if (tremorMetrics.freqHz < 8) return { level: 'Moderate', color: 'text-yellow-400', description: 'Moderate tremor detected' };
      return { level: 'High', color: 'text-red-400', description: 'Significant tremor activity' };
    }
    if (type === 'speed') {
      if (tapRate >= 8) return { level: 'Fast', color: 'text-green-400', description: 'Excellent movement speed' };
      if (tapRate >= 5) return { level: 'Normal', color: 'text-blue-400', description: 'Normal movement speed' };
      if (tapRate >= 3) return { level: 'Slow', color: 'text-yellow-400', description: 'Reduced movement speed' };
      return { level: 'Very Slow', color: 'text-red-400', description: 'Significantly reduced movement speed' };
    }
    return { level: 'Unknown', color: 'text-gray-400', description: 'Unable to assess' };
  }

  function generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (coordinationScore < 60) {
      recommendations.push("Consider coordination exercises like finger-to-nose movements");
      recommendations.push("Practice fine motor tasks such as writing or drawing");
    }
    
    if (tremorMetrics.freqHz > 6) {
      recommendations.push("Monitor tremor patterns over time for changes");
      recommendations.push("Consider consultation with a neurologist");
      recommendations.push("Avoid caffeine before assessments as it may increase tremor");
    }
    
    if (tapRate < 4) {
      recommendations.push("Practice rapid alternating movements to improve speed");
      recommendations.push("Consider occupational therapy evaluation");
    }
    
    if (movementQuality < 70) {
      recommendations.push("Regular exercise may help improve overall motor function");
      recommendations.push("Consider tracking improvements over multiple sessions");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Excellent motor function - maintain current activity level");
      recommendations.push("Consider periodic re-assessment to monitor any changes");
    }
    
    return recommendations;
  }

  function getClinicalInsights(): { category: string; findings: string[]; significance: string }[] {
    const insights = [];
    
    // Coordination Analysis
    insights.push({
      category: "Motor Coordination",
      findings: [
        `Coordination score: ${coordinationScore}%`,
        `Tap consistency: ${tapIntervals.length > 1 ? 'Measured' : 'Insufficient data'}`,
        `Movement pattern: ${coordinationScore >= 70 ? 'Regular' : 'Irregular'}`
      ],
      significance: coordinationScore >= 70 ? 
        "Normal coordination patterns suggest intact motor control pathways." :
        "Irregular patterns may indicate motor control difficulties requiring attention."
    });

    // Tremor Analysis
    insights.push({
      category: "Tremor Assessment",
      findings: [
        `Dominant frequency: ${tremorMetrics.freqHz.toFixed(2)} Hz`,
        `Amplitude: ${tremorAmpPercent.toFixed(2)}%`,
        `Tremor type: ${tremorMetrics.freqHz >= 4 && tremorMetrics.freqHz <= 12 ? 'Potential pathological' : 'Within normal range'}`
      ],
      significance: tremorMetrics.freqHz >= 4 && tremorMetrics.freqHz <= 12 ?
        "Tremor frequency in 4-12 Hz range may warrant clinical evaluation." :
        "Tremor patterns appear within normal physiological range."
    });

    // Speed Analysis
    insights.push({
      category: "Movement Speed",
      findings: [
        `Tap rate: ${tapRate.toFixed(2)} taps/second`,
        `Total taps: ${fingerTaps} in ${testDuration.toFixed(1)}s`,
        `Speed classification: ${getRiskLevel(0, 'speed').level}`
      ],
      significance: tapRate >= 5 ?
        "Movement speed within normal range for finger tapping tasks." :
        "Reduced movement speed may indicate bradykinesia or motor slowing."
    });

    return insights;
  }

  const coordinationRisk = getRiskLevel(coordinationScore, 'coordination');
  const tremorRisk = getRiskLevel(0, 'tremor');
  const speedRisk = getRiskLevel(0, 'speed');
  const recommendations = generateRecommendations();
  const clinicalInsights = getClinicalInsights();

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

        {/* Enhanced Analysis & Report */}
        <Card>
          <CardHeader><CardTitle>Analysis & Report</CardTitle><CardDescription>Comprehensive motor assessment</CardDescription></CardHeader>
          <CardContent>
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground">Tap Count</div>
                <div className="text-2xl font-bold">{fingerTaps}</div>
                <div className={`text-sm ${speedRisk.color}`}>{speedRisk.level}</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground">Tremor (Hz)</div>
                <div className="text-2xl font-bold">{tremorMetrics.freqHz>0?tremorMetrics.freqHz.toFixed(2):"—"}</div>
                <div className={`text-sm ${tremorRisk.color}`}>{tremorRisk.level}</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground">Coordination</div>
                <div className="text-2xl font-bold">{coordinationScore}%</div>
                <div className={`text-sm ${coordinationRisk.color}`}>{coordinationRisk.level}</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground">Overall Quality</div>
                <div className="text-2xl font-bold">{movementQuality}</div>
                <div className="text-sm text-muted-foreground">Combined Score</div>
              </div>
            </div>

            {/* Overall Quality Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Movement Quality Score</span>
                <span className="text-sm text-muted-foreground">{movementQuality}%</span>
              </div>
              <Progress value={movementQuality} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinical Insights Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Clinical Insights
            </CardTitle>
            <CardDescription>Detailed analysis of motor function patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {clinicalInsights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg bg-muted/5">
                <h4 className="font-semibold text-white mb-2">{insight.category}</h4>
                <ul className="text-sm text-gray-300 space-y-1 mb-3">
                  {insight.findings.map((finding, i) => (
                    <li key={i}>• {finding}</li>
                  ))}
                </ul>
                <p className="text-xs text-gray-400 italic">{insight.significance}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Recommendations
            </CardTitle>
            <CardDescription>Personalized suggestions for improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/5">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-300">{rec}</p>
                </div>
              ))}
            </div>
            
            {/* Risk Assessment Summary */}
            <div className="mt-6 p-4 border rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <h4 className="font-semibold text-white mb-3">Assessment Summary</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Coordination:</span>
                  <span className={coordinationRisk.color}>{coordinationRisk.description}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tremor Status:</span>
                  <span className={tremorRisk.color}>{tremorRisk.description}</span>
                </div>
                <div className="flex justify-between">
                  <span>Movement Speed:</span>
                  <span className={speedRisk.color}>{speedRisk.description}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Detailed Report
          </CardTitle>
          <CardDescription>Complete test results and measurements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Test Parameters</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Test Duration:</span>
                  <span className="text-white">{testDuration.toFixed(1)} seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Finger Taps:</span>
                  <span className="text-white">{fingerTaps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Tap Rate:</span>
                  <span className="text-white">{tapRate.toFixed(2)} taps/sec</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tap Intervals Recorded:</span>
                  <span className="text-white">{tapIntervals.length}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Motion Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tremor Frequency:</span>
                  <span className="text-white">{tremorMetrics.freqHz.toFixed(2)} Hz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tremor Amplitude:</span>
                  <span className="text-white">{tremorAmpPercent.toFixed(3)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Coordination Score:</span>
                  <span className="text-white">{coordinationScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Movement Quality:</span>
                  <span className="text-white">{movementQuality}%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Clinical Reference Ranges */}
          <div className="mt-6 p-4 border rounded-lg bg-muted/5">
            <h4 className="font-semibold text-white mb-3">Clinical Reference Ranges</h4>
            <div className="grid md:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="font-medium text-gray-300">Finger Tapping Rate</div>
                <div className="text-gray-400">Normal: 5-10 taps/sec</div>
                <div className="text-gray-400">Reduced: &lt;5 taps/sec</div>
              </div>
              <div>
                <div className="font-medium text-gray-300">Coordination Score</div>
                <div className="text-gray-400">Excellent: 80-100%</div>
                <div className="text-gray-400">Concerning: &lt;60%</div>
              </div>
              <div>
                <div className="font-medium text-gray-300">Tremor Frequency</div>
                <div className="text-gray-400">Physiological: 0-3 Hz</div>
                <div className="text-gray-400">Pathological: 4-12 Hz</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MotorLab;
