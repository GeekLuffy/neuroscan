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

interface MotorAnalysisResults {
  timestamp: string;
  fingerTaps: number;
  testDuration: number;
  tapRate: number;
  coordinationScore: number;
  tremorFrequency: number;
  tremorAmplitude: number;
  qualityScore: number;
  riskLevel: string;
  clinicalFindings: ClinicalFinding[];
  diseaseRiskAssessment: MotorDiseaseRiskAssessment;
  motorCharacteristics: MotorCharacteristics;
  recommendations: string[];
}

interface ClinicalFinding {
  parameter: string;
  value: string;
  normalRange: string;
  status: 'normal' | 'borderline' | 'abnormal';
  clinicalSignificance: string;
}

interface MotorDiseaseRiskAssessment {
  parkinsons: {
    riskLevel: 'low' | 'moderate' | 'high';
    confidence: number;
    indicators: string[];
    symptoms: string[];
  };
  essentialTremor: {
    riskLevel: 'low' | 'moderate' | 'high';
    confidence: number;
    indicators: string[];
    symptoms: string[];
  };
  cerebellarDisorders: {
    riskLevel: 'low' | 'moderate' | 'high';
    confidence: number;
    indicators: string[];
    symptoms: string[];
  };
}

interface MotorCharacteristics {
  movementSpeed: 'normal' | 'bradykinetic' | 'hyperkinetic';
  coordinationLevel: 'excellent' | 'good' | 'fair' | 'poor';
  tremorType: 'none' | 'physiological' | 'pathological' | 'severe';
  rhythmicity: 'regular' | 'irregular' | 'variable';
  overallAssessment: string;
}

// Advanced clinical analysis functions
function generateMotorClinicalFindings(
  fingerTaps: number, 
  testDuration: number, 
  tapRate: number, 
  coordinationScore: number, 
  tremorFrequency: number, 
  tremorAmplitude: number
): ClinicalFinding[] {
  const findings: ClinicalFinding[] = [];

  // Finger Tapping Rate Analysis
  const tapRateStatus = tapRate < 3 ? 'abnormal' : tapRate < 5 ? 'borderline' : 'normal';
  findings.push({
    parameter: 'Finger Tapping Rate',
    value: `${tapRate.toFixed(2)} taps/sec (${fingerTaps} taps in ${testDuration.toFixed(1)}s)`,
    normalRange: '5-10 taps/sec (healthy adults)',
    status: tapRateStatus,
    clinicalSignificance: tapRateStatus === 'abnormal' 
      ? 'Significantly reduced tapping rate may indicate bradykinesia or motor slowing associated with neurological conditions'
      : tapRateStatus === 'borderline'
      ? 'Mildly reduced tapping rate that may warrant monitoring for early motor changes'
      : 'Normal finger tapping rate indicating adequate motor speed and dexterity'
  });

  // Coordination Score Analysis
  const coordStatus = coordinationScore < 60 ? 'abnormal' : coordinationScore < 80 ? 'borderline' : 'normal';
  findings.push({
    parameter: 'Motor Coordination',
    value: `${coordinationScore}%`,
    normalRange: '80-100% (healthy adults)',
    status: coordStatus,
    clinicalSignificance: coordStatus === 'abnormal'
      ? 'Poor coordination may indicate cerebellar dysfunction or motor control difficulties'
      : coordStatus === 'borderline'
      ? 'Mild coordination impairment that may indicate early motor changes'
      : 'Excellent motor coordination suggesting intact cerebellar and motor cortex function'
  });

  // Tremor Analysis
  if (tremorFrequency > 0) {
    const tremorStatus = tremorFrequency >= 4 && tremorFrequency <= 12 ? 'abnormal' : tremorFrequency > 12 ? 'borderline' : 'normal';
    findings.push({
      parameter: 'Tremor Assessment',
      value: `${tremorFrequency.toFixed(2)} Hz, Amplitude: ${tremorAmplitude.toFixed(2)}%`,
      normalRange: '0-3 Hz (physiological tremor)',
      status: tremorStatus,
      clinicalSignificance: tremorStatus === 'abnormal'
        ? 'Tremor frequency in pathological range (4-12 Hz) may indicate Parkinson\'s disease or essential tremor'
        : tremorStatus === 'borderline'
        ? 'High frequency tremor may indicate anxiety or caffeine-induced physiological tremor'
        : 'Tremor within normal physiological range'
    });
  }

  return findings;
}

function assessMotorDiseaseRisk(
  tapRate: number, 
  coordinationScore: number, 
  tremorFrequency: number, 
  tremorAmplitude: number,
  tapIntervals: number[]
): MotorDiseaseRiskAssessment {
  // Calculate rhythm variability
  const rhythmVariability = tapIntervals.length > 1 
    ? Math.sqrt(tapIntervals.reduce((acc, interval, i) => i > 0 ? acc + Math.pow(interval - tapIntervals[i-1], 2) : acc, 0) / (tapIntervals.length - 1))
    : 0;

  // Parkinson's Disease Assessment
  const parkinsonsIndicators: string[] = [];
  const parkinsonsSymptoms: string[] = [];
  let parkinsonsRisk: 'low' | 'moderate' | 'high' = 'low';
  let parkinsonsConfidence = 0;

  if (tapRate < 4) {
    parkinsonsIndicators.push('Severe bradykinesia (slow movement)');
    parkinsonsSymptoms.push('Difficulty with rapid alternating movements');
    parkinsonsConfidence += 0.3;
  } else if (tapRate < 5) {
    parkinsonsIndicators.push('Mild bradykinesia');
    parkinsonsSymptoms.push('Slight slowing of finger movements');
    parkinsonsConfidence += 0.15;
  }

  if (tremorFrequency >= 4 && tremorFrequency <= 6) {
    parkinsonsIndicators.push('Rest tremor frequency (4-6 Hz)');
    parkinsonsSymptoms.push('Tremor at rest, pill-rolling motion');
    parkinsonsConfidence += 0.25;
  }

  if (coordinationScore < 70) {
    parkinsonsIndicators.push('Reduced motor coordination');
    parkinsonsSymptoms.push('Difficulty with precise movements');
    parkinsonsConfidence += 0.2;
  }

  if (rhythmVariability > 200) {
    parkinsonsIndicators.push('Irregular movement rhythm');
    parkinsonsSymptoms.push('Inconsistent timing between movements');
    parkinsonsConfidence += 0.15;
  }

  if (parkinsonsConfidence > 0.5) parkinsonsRisk = 'high';
  else if (parkinsonsConfidence > 0.25) parkinsonsRisk = 'moderate';

  // Essential Tremor Assessment
  const essentialTremorIndicators: string[] = [];
  const essentialTremorSymptoms: string[] = [];
  let essentialTremorRisk: 'low' | 'moderate' | 'high' = 'low';
  let essentialTremorConfidence = 0;

  if (tremorFrequency >= 6 && tremorFrequency <= 12) {
    essentialTremorIndicators.push('Action tremor frequency (6-12 Hz)');
    essentialTremorSymptoms.push('Tremor during voluntary movement');
    essentialTremorConfidence += 0.3;
  }

  if (tremorAmplitude > 15) {
    essentialTremorIndicators.push('High amplitude tremor');
    essentialTremorSymptoms.push('Visible shaking during tasks');
    essentialTremorConfidence += 0.2;
  }

  if (tapRate >= 5 && coordinationScore >= 70) {
    essentialTremorIndicators.push('Preserved motor speed and coordination');
    essentialTremorSymptoms.push('Normal movement speed despite tremor');
    essentialTremorConfidence += 0.15;
  }

  if (essentialTremorConfidence > 0.4) essentialTremorRisk = 'high';
  else if (essentialTremorConfidence > 0.2) essentialTremorRisk = 'moderate';

  // Cerebellar Disorders Assessment
  const cerebellarIndicators: string[] = [];
  const cerebellarSymptoms: string[] = [];
  let cerebellarRisk: 'low' | 'moderate' | 'high' = 'low';
  let cerebellarConfidence = 0;

  if (coordinationScore < 60) {
    cerebellarIndicators.push('Severe coordination impairment');
    cerebellarSymptoms.push('Ataxic movements, dysmetria');
    cerebellarConfidence += 0.35;
  } else if (coordinationScore < 70) {
    cerebellarIndicators.push('Mild coordination impairment');
    cerebellarSymptoms.push('Slight inaccuracy in targeted movements');
    cerebellarConfidence += 0.2;
  }

  if (rhythmVariability > 300) {
    cerebellarIndicators.push('Severe rhythm irregularity');
    cerebellarSymptoms.push('Inability to maintain steady rhythm');
    cerebellarConfidence += 0.25;
  }

  if (tremorFrequency > 0 && tremorFrequency < 4) {
    cerebellarIndicators.push('Intention tremor pattern');
    cerebellarSymptoms.push('Tremor worsening with goal-directed movement');
    cerebellarConfidence += 0.2;
  }

  if (cerebellarConfidence > 0.5) cerebellarRisk = 'high';
  else if (cerebellarConfidence > 0.25) cerebellarRisk = 'moderate';

  return {
    parkinsons: {
      riskLevel: parkinsonsRisk,
      confidence: Math.min(parkinsonsConfidence, 1),
      indicators: parkinsonsIndicators,
      symptoms: parkinsonsSymptoms
    },
    essentialTremor: {
      riskLevel: essentialTremorRisk,
      confidence: Math.min(essentialTremorConfidence, 1),
      indicators: essentialTremorIndicators,
      symptoms: essentialTremorSymptoms
    },
    cerebellarDisorders: {
      riskLevel: cerebellarRisk,
      confidence: Math.min(cerebellarConfidence, 1),
      indicators: cerebellarIndicators,
      symptoms: cerebellarSymptoms
    }
  };
}

function analyzeMotorCharacteristics(
  tapRate: number, 
  coordinationScore: number, 
  tremorFrequency: number, 
  tremorAmplitude: number,
  tapIntervals: number[]
): MotorCharacteristics {
  // Assess movement speed
  let movementSpeed: 'normal' | 'bradykinetic' | 'hyperkinetic' = 'normal';
  if (tapRate < 5) movementSpeed = 'bradykinetic';
  else if (tapRate > 12) movementSpeed = 'hyperkinetic';

  // Assess coordination level
  let coordinationLevel: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
  if (coordinationScore < 60) coordinationLevel = 'poor';
  else if (coordinationScore < 70) coordinationLevel = 'fair';
  else if (coordinationScore < 85) coordinationLevel = 'good';

  // Assess tremor type
  let tremorType: 'none' | 'physiological' | 'pathological' | 'severe' = 'none';
  if (tremorFrequency > 0) {
    if (tremorFrequency <= 3) tremorType = 'physiological';
    else if (tremorFrequency <= 12) tremorType = 'pathological';
    else tremorType = 'severe';
  }

  // Assess rhythmicity
  const rhythmVariability = tapIntervals.length > 1 
    ? Math.sqrt(tapIntervals.reduce((acc, interval, i) => i > 0 ? acc + Math.pow(interval - tapIntervals[i-1], 2) : acc, 0) / (tapIntervals.length - 1))
    : 0;
  
  let rhythmicity: 'regular' | 'irregular' | 'variable' = 'regular';
  if (rhythmVariability > 300) rhythmicity = 'irregular';
  else if (rhythmVariability > 150) rhythmicity = 'variable';

  // Overall assessment
  let overallAssessment = 'Motor function within normal limits';
  if (movementSpeed === 'bradykinetic' || coordinationLevel === 'poor' || tremorType === 'pathological' || tremorType === 'severe') {
    overallAssessment = 'Motor function shows signs of impairment requiring clinical evaluation';
  } else if (coordinationLevel === 'fair' || tremorType === 'physiological' || rhythmicity === 'irregular') {
    overallAssessment = 'Motor function shows mild changes that may warrant monitoring';
  }

  return {
    movementSpeed,
    coordinationLevel,
    tremorType,
    rhythmicity,
    overallAssessment
  };
}

function generateMotorRecommendations(
  diseaseRisk: MotorDiseaseRiskAssessment, 
  motorCharacteristics: MotorCharacteristics, 
  clinicalFindings: ClinicalFinding[]
): string[] {
  const recommendations: string[] = [];

  // General recommendations based on findings
  const abnormalFindings = clinicalFindings.filter(f => f.status === 'abnormal');
  const borderlineFindings = clinicalFindings.filter(f => f.status === 'borderline');

  if (abnormalFindings.length > 0) {
    recommendations.push('Recommend comprehensive neurological evaluation by movement disorder specialist');
    recommendations.push('Consider detailed motor assessment including DaTscan if Parkinson\'s suspected');
  }

  if (borderlineFindings.length > 0) {
    recommendations.push('Monitor motor function changes over time with regular assessments');
    recommendations.push('Consider physical therapy consultation for motor optimization');
  }

  // Disease-specific recommendations
  if (diseaseRisk.parkinsons.riskLevel === 'high') {
    recommendations.push('Urgent referral to movement disorder neurologist for Parkinson\'s evaluation');
    recommendations.push('Consider dopamine transporter imaging (DaTscan) for differential diagnosis');
    recommendations.push('Monitor for other Parkinson\'s symptoms: rigidity, postural instability, non-motor symptoms');
    recommendations.push('Consider early intervention with physical therapy and exercise programs');
  } else if (diseaseRisk.parkinsons.riskLevel === 'moderate') {
    recommendations.push('Schedule baseline neurological screening for movement disorders');
    recommendations.push('Implement regular exercise program focusing on large amplitude movements');
  }

  if (diseaseRisk.essentialTremor.riskLevel === 'high') {
    recommendations.push('Referral to neurologist for essential tremor evaluation and management');
    recommendations.push('Consider propranolol or primidone therapy if tremor is functionally limiting');
    recommendations.push('Evaluate for occupational therapy to improve daily function');
  } else if (diseaseRisk.essentialTremor.riskLevel === 'moderate') {
    recommendations.push('Monitor tremor progression and functional impact');
    recommendations.push('Consider lifestyle modifications: reduce caffeine, manage stress');
  }

  if (diseaseRisk.cerebellarDisorders.riskLevel === 'high') {
    recommendations.push('Urgent neurological evaluation for cerebellar dysfunction');
    recommendations.push('Consider brain MRI to evaluate cerebellar structure');
    recommendations.push('Referral to physical therapy for balance and coordination training');
  } else if (diseaseRisk.cerebellarDisorders.riskLevel === 'moderate') {
    recommendations.push('Monitor coordination and balance with regular assessments');
    recommendations.push('Consider balance training and coordination exercises');
  }

  // Motor characteristics specific recommendations
  if (motorCharacteristics.movementSpeed === 'bradykinetic') {
    recommendations.push('Focus on large amplitude, high-intensity exercises (LSVT BIG protocol)');
  }
  
  if (motorCharacteristics.coordinationLevel === 'poor') {
    recommendations.push('Implement targeted coordination and dexterity training exercises');
  }

  if (motorCharacteristics.tremorType === 'pathological' || motorCharacteristics.tremorType === 'severe') {
    recommendations.push('Consider tremor-specific interventions and adaptive equipment');
  }

  // General motor health recommendations
  if (recommendations.length === 0) {
    recommendations.push('Maintain regular physical activity to preserve motor function');
    recommendations.push('Continue periodic motor function monitoring for early detection of changes');
  }

  recommendations.push('Results should be interpreted by qualified healthcare professionals');
  recommendations.push('This screening tool is not a substitute for professional medical diagnosis');

  return recommendations;
}

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
  const [analysisResults, setAnalysisResults] = useState<MotorAnalysisResults | null>(null);
  
  // Ref for the report section to enable auto-scroll
  const reportRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to report when analysis results are generated
  useEffect(() => {
    if (analysisResults && reportRef.current) {
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 300);
    }
  }, [analysisResults]);

  const fingerTapsRef = useRef(0);
  const tremorSamplesRef = useRef<TremorSample[]>([]);
  const lastTapTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const renderLoopStartedRef = useRef(false);
  const isRecordingRef = useRef(false);
  const testDurationRef = useRef(0);
  const liveMetricsRef = useRef({
    tapRate: 0,
    coordinationScore: 0,
    tremorMetrics: { ampNorm: 0, freqHz: 0 },
    movementQuality: 0
  });

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
    testDurationRef.current = 0;
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
        testDurationRef.current = next;
        if (next >= 5) { 
          // Ensure we set the final duration before stopping
          testDurationRef.current = 5.0;
          stopTest(); 
          return 5; 
        }
        return next;
      });
    }, 100);
  }

  function startTest() {
    if (permission !== "granted") { setStatus("Please enable camera first."); return; }
    if (isRecordingRef.current) return;
    beginRecording();
  }

  function generateAnalysis() {
    setStatus("Processing motor data and generating advanced clinical analysis...");
    
    // Generate comprehensive analysis results
    setTimeout(() => {
      // Use the exact same metrics that the live display is showing
      const { tapRate, coordinationScore, tremorMetrics, movementQuality } = liveMetricsRef.current;
      
      console.log('Analysis using live metrics:', {
        fingerTaps,
        testDuration,
        liveMetrics: liveMetricsRef.current,
        tremorSamplesCount: tremorSamplesRef.current.length,
        tapIntervalsCount: tapIntervals.length
      });
      
      // Create comprehensive analysis results using live display values
      const results: MotorAnalysisResults = {
        timestamp: new Date().toISOString(),
        fingerTaps: fingerTaps, // Use current state
        testDuration: testDuration, // Use current state
        tapRate,
        coordinationScore,
        tremorFrequency: tremorMetrics.freqHz,
        tremorAmplitude: tremorMetrics.ampNorm,
        qualityScore: movementQuality, // Use the same quality score as live display
        riskLevel: movementQuality >= 80 ? 'Low' : movementQuality >= 60 ? 'Medium' : 'High',
        clinicalFindings: [],
        diseaseRiskAssessment: {
          parkinsons: { riskLevel: 'low', confidence: 0, indicators: [], symptoms: [] },
          essentialTremor: { riskLevel: 'low', confidence: 0, indicators: [], symptoms: [] },
          cerebellarDisorders: { riskLevel: 'low', confidence: 0, indicators: [], symptoms: [] }
        },
        motorCharacteristics: {
          movementSpeed: 'normal',
          coordinationLevel: 'excellent',
          tremorType: 'none',
          rhythmicity: 'regular',
          overallAssessment: ''
        },
        recommendations: []
      };
      
      // Generate advanced clinical analysis using current state values
      results.clinicalFindings = generateMotorClinicalFindings(
        fingerTaps, testDuration, tapRate, coordinationScore, tremorMetrics.freqHz, tremorMetrics.ampNorm
      );
      results.diseaseRiskAssessment = assessMotorDiseaseRisk(
        tapRate, coordinationScore, tremorMetrics.freqHz, tremorMetrics.ampNorm, tapIntervals
      );
      results.motorCharacteristics = analyzeMotorCharacteristics(
        tapRate, coordinationScore, tremorMetrics.freqHz, tremorMetrics.ampNorm, tapIntervals
      );
      results.recommendations = generateMotorRecommendations(
        results.diseaseRiskAssessment, results.motorCharacteristics, results.clinicalFindings
      );
      
      setAnalysisResults(results);
      setStatus("Analysis complete! View your detailed motor assessment report below.");
    }, 500); // Shorter delay since we're calling it separately
  }

  function stopTest() {
    setIsRecording(false);
    isRecordingRef.current = false;
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    setStatus("Test complete. Analyzing data and generating comprehensive report...");
    
    // Wait longer for all state updates to complete and UI to refresh
    setTimeout(() => {
      generateAnalysis();
    }, 1500); // Increased delay to ensure all state is synchronized
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

  // Store live metrics in ref for analysis to use
  liveMetricsRef.current = {
    tapRate,
    coordinationScore,
    tremorMetrics,
    movementQuality
  };

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

        {/* Data Collection Status */}
        <Card>
          <CardHeader><CardTitle>Data Collection Status</CardTitle><CardDescription>Real-time collection metrics</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Tremor Samples:</strong> {tremorSamplesRef.current.length}</div>
                <div><strong>Tap Intervals:</strong> {tapIntervals.length}</div>
                <div><strong>Test Duration:</strong> {testDuration.toFixed(1)}s</div>
                <div><strong>Recording:</strong> {isRecording ? "Yes" : "No"}</div>
              </div>
              
              {/* Recent tremor data preview */}
              {tremorSamplesRef.current.length > 0 && (
                <div className="text-xs">
                  <strong>Recent Tremor Data:</strong>
                  <div className="font-mono bg-muted/30 p-2 rounded mt-1">
                    Last Y: {tremorSamplesRef.current[tremorSamplesRef.current.length - 1]?.y.toFixed(2)}
                  </div>
                </div>
              )}
              
              {/* Recent tap intervals preview */}
              {tapIntervals.length > 0 && (
                <div className="text-xs">
                  <strong>Recent Tap Intervals:</strong>
                  <div className="font-mono bg-muted/30 p-2 rounded mt-1">
                    Last: {tapIntervals[tapIntervals.length - 1]?.toFixed(0)}ms
                  </div>
                </div>
              )}
              
              {/* Computed metrics preview */}
              <div className="text-xs border-t pt-2">
                <strong>Live Computed Metrics:</strong>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>Tremor Freq: {computeTremorMetrics(tremorSamplesRef.current).freqHz.toFixed(2)} Hz</div>
                  <div>Coordination: {computeCoordinationScore(tapIntervals)}%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Enhanced Inline Analysis Report - Only shown when analysis is complete */}
      {analysisResults && (
        <Card ref={reportRef}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Advanced Motor Analysis Report
            </CardTitle>
            <CardDescription>
              Comprehensive clinical analysis and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Generated: {new Date(analysisResults.timestamp).toLocaleString()}
            </div>
            
            {/* Key Metrics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground">Tap Rate</div>
                <div className="text-xl font-bold">{analysisResults.tapRate.toFixed(2)} /sec</div>
                <div className="text-xs text-muted-foreground">
                  {analysisResults.tapRate >= 5 ? 'Normal' : analysisResults.tapRate >= 3 ? 'Reduced' : 'Severely Reduced'}
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground">Coordination</div>
                <div className="text-xl font-bold">{analysisResults.coordinationScore}%</div>
                <div className="text-xs text-muted-foreground">
                  {analysisResults.coordinationScore >= 80 ? 'Excellent' : analysisResults.coordinationScore >= 60 ? 'Good' : 'Poor'}
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground">Tremor</div>
                <div className="text-xl font-bold">
                  {analysisResults.tremorFrequency > 0 ? `${analysisResults.tremorFrequency.toFixed(1)} Hz` : '—'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {analysisResults.tremorFrequency === 0 ? 'None' : 
                   analysisResults.tremorFrequency <= 3 ? 'Physiological' : 
                   analysisResults.tremorFrequency <= 12 ? 'Pathological' : 'High Frequency'}
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground">Quality Score</div>
                <div className="text-xl font-bold">{analysisResults.qualityScore}%</div>
                <div className="text-xs text-muted-foreground">
                  {analysisResults.qualityScore >= 80 ? 'Excellent' : analysisResults.qualityScore >= 60 ? 'Good' : 'Needs Attention'}
                </div>
              </div>
            </div>

            {/* Clinical Findings */}
            {analysisResults.clinicalFindings && analysisResults.clinicalFindings.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Clinical Findings</h3>
                <div className="space-y-3">
                  {analysisResults.clinicalFindings.map((finding, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{finding.parameter}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          finding.status === 'normal' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          finding.status === 'borderline' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {finding.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                        <div><strong>Value:</strong> {finding.value}</div>
                        <div><strong>Normal Range:</strong> {finding.normalRange}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong>Clinical Significance:</strong> {finding.clinicalSignificance}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disease Risk Assessment */}
            {analysisResults.diseaseRiskAssessment && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Disease Risk Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Parkinson's Disease */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Parkinson's Disease</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        analysisResults.diseaseRiskAssessment.parkinsons.riskLevel === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        analysisResults.diseaseRiskAssessment.parkinsons.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {analysisResults.diseaseRiskAssessment.parkinsons.riskLevel.toUpperCase()} RISK
                      </span>
                    </div>
                    <div className="text-sm mb-2">
                      <strong>Confidence:</strong> {(analysisResults.diseaseRiskAssessment.parkinsons.confidence * 100).toFixed(0)}%
                    </div>
                    {analysisResults.diseaseRiskAssessment.parkinsons.indicators.length > 0 && (
                      <div className="text-sm mb-2">
                        <strong>Indicators:</strong>
                        <ul className="list-disc list-inside mt-1 text-xs">
                          {analysisResults.diseaseRiskAssessment.parkinsons.indicators.map((indicator, idx) => (
                            <li key={idx}>{indicator}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysisResults.diseaseRiskAssessment.parkinsons.symptoms.length > 0 && (
                      <div className="text-sm">
                        <strong>Associated Symptoms:</strong>
                        <ul className="list-disc list-inside mt-1 text-xs">
                          {analysisResults.diseaseRiskAssessment.parkinsons.symptoms.map((symptom, idx) => (
                            <li key={idx}>{symptom}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Essential Tremor */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Essential Tremor</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        analysisResults.diseaseRiskAssessment.essentialTremor.riskLevel === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        analysisResults.diseaseRiskAssessment.essentialTremor.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {analysisResults.diseaseRiskAssessment.essentialTremor.riskLevel.toUpperCase()} RISK
                      </span>
                    </div>
                    <div className="text-sm mb-2">
                      <strong>Confidence:</strong> {(analysisResults.diseaseRiskAssessment.essentialTremor.confidence * 100).toFixed(0)}%
                    </div>
                    {analysisResults.diseaseRiskAssessment.essentialTremor.indicators.length > 0 && (
                      <div className="text-sm mb-2">
                        <strong>Indicators:</strong>
                        <ul className="list-disc list-inside mt-1 text-xs">
                          {analysisResults.diseaseRiskAssessment.essentialTremor.indicators.map((indicator, idx) => (
                            <li key={idx}>{indicator}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysisResults.diseaseRiskAssessment.essentialTremor.symptoms.length > 0 && (
                      <div className="text-sm">
                        <strong>Associated Symptoms:</strong>
                        <ul className="list-disc list-inside mt-1 text-xs">
                          {analysisResults.diseaseRiskAssessment.essentialTremor.symptoms.map((symptom, idx) => (
                            <li key={idx}>{symptom}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Cerebellar Disorders */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Cerebellar Disorders</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        analysisResults.diseaseRiskAssessment.cerebellarDisorders.riskLevel === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        analysisResults.diseaseRiskAssessment.cerebellarDisorders.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {analysisResults.diseaseRiskAssessment.cerebellarDisorders.riskLevel.toUpperCase()} RISK
                      </span>
                    </div>
                    <div className="text-sm mb-2">
                      <strong>Confidence:</strong> {(analysisResults.diseaseRiskAssessment.cerebellarDisorders.confidence * 100).toFixed(0)}%
                    </div>
                    {analysisResults.diseaseRiskAssessment.cerebellarDisorders.indicators.length > 0 && (
                      <div className="text-sm mb-2">
                        <strong>Indicators:</strong>
                        <ul className="list-disc list-inside mt-1 text-xs">
                          {analysisResults.diseaseRiskAssessment.cerebellarDisorders.indicators.map((indicator, idx) => (
                            <li key={idx}>{indicator}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysisResults.diseaseRiskAssessment.cerebellarDisorders.symptoms.length > 0 && (
                      <div className="text-sm">
                        <strong>Associated Symptoms:</strong>
                        <ul className="list-disc list-inside mt-1 text-xs">
                          {analysisResults.diseaseRiskAssessment.cerebellarDisorders.symptoms.map((symptom, idx) => (
                            <li key={idx}>{symptom}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Motor Characteristics */}
            {analysisResults.motorCharacteristics && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Motor Characteristics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Movement Speed:</strong> {analysisResults.motorCharacteristics.movementSpeed.replace('_', ' ')}
                  </div>
                  <div>
                    <strong>Coordination Level:</strong> {analysisResults.motorCharacteristics.coordinationLevel}
                  </div>
                  <div>
                    <strong>Tremor Type:</strong> {analysisResults.motorCharacteristics.tremorType}
                  </div>
                  <div>
                    <strong>Rhythmicity:</strong> {analysisResults.motorCharacteristics.rhythmicity}
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <strong>Overall Assessment:</strong> {analysisResults.motorCharacteristics.overallAssessment}
                </div>
              </div>
            )}

            {/* Clinical Recommendations */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Clinical Recommendations</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                {analysisResults.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            {/* Download Report Button */}
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  const report = `
ADVANCED MOTOR ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}

=== KEY METRICS ===
- Finger Taps: ${analysisResults.fingerTaps} taps in ${analysisResults.testDuration.toFixed(1)} seconds
- Tap Rate: ${analysisResults.tapRate.toFixed(2)} taps/sec
- Coordination Score: ${analysisResults.coordinationScore}%
- Tremor Frequency: ${analysisResults.tremorFrequency.toFixed(2)} Hz
- Tremor Amplitude: ${analysisResults.tremorAmplitude.toFixed(2)}%
- Quality Score: ${analysisResults.qualityScore}%

=== CLINICAL FINDINGS ===
${analysisResults.clinicalFindings?.map(finding => 
`${finding.parameter}: ${finding.value} (${finding.status.toUpperCase()})
  Normal Range: ${finding.normalRange}
  Clinical Significance: ${finding.clinicalSignificance}`
).join('\n\n') || 'No clinical findings available'}

=== DISEASE RISK ASSESSMENT ===

Parkinson's Disease: ${analysisResults.diseaseRiskAssessment?.parkinsons.riskLevel.toUpperCase()} RISK (${(analysisResults.diseaseRiskAssessment?.parkinsons.confidence * 100).toFixed(0)}% confidence)
${analysisResults.diseaseRiskAssessment?.parkinsons.indicators.length > 0 ? 
  `Indicators: ${analysisResults.diseaseRiskAssessment.parkinsons.indicators.join(', ')}
  Symptoms: ${analysisResults.diseaseRiskAssessment.parkinsons.symptoms.join(', ')}` : 'No specific indicators detected'}

Essential Tremor: ${analysisResults.diseaseRiskAssessment?.essentialTremor.riskLevel.toUpperCase()} RISK (${(analysisResults.diseaseRiskAssessment?.essentialTremor.confidence * 100).toFixed(0)}% confidence)
${analysisResults.diseaseRiskAssessment?.essentialTremor.indicators.length > 0 ? 
  `Indicators: ${analysisResults.diseaseRiskAssessment.essentialTremor.indicators.join(', ')}
  Symptoms: ${analysisResults.diseaseRiskAssessment.essentialTremor.symptoms.join(', ')}` : 'No specific indicators detected'}

Cerebellar Disorders: ${analysisResults.diseaseRiskAssessment?.cerebellarDisorders.riskLevel.toUpperCase()} RISK (${(analysisResults.diseaseRiskAssessment?.cerebellarDisorders.confidence * 100).toFixed(0)}% confidence)
${analysisResults.diseaseRiskAssessment?.cerebellarDisorders.indicators.length > 0 ? 
  `Indicators: ${analysisResults.diseaseRiskAssessment.cerebellarDisorders.indicators.join(', ')}
  Symptoms: ${analysisResults.diseaseRiskAssessment.cerebellarDisorders.symptoms.join(', ')}` : 'No specific indicators detected'}

=== MOTOR CHARACTERISTICS ===
- Movement Speed: ${analysisResults.motorCharacteristics?.movementSpeed.replace('_', ' ')}
- Coordination Level: ${analysisResults.motorCharacteristics?.coordinationLevel}
- Tremor Type: ${analysisResults.motorCharacteristics?.tremorType}
- Rhythmicity: ${analysisResults.motorCharacteristics?.rhythmicity}
- Overall Assessment: ${analysisResults.motorCharacteristics?.overallAssessment}

=== CLINICAL RECOMMENDATIONS ===
${analysisResults.recommendations.map(rec => `• ${rec}`).join('\n')}

=== DISCLAIMER ===
This is an AI-powered screening tool for research and educational purposes only. 
Results are not diagnostic and should not replace professional medical evaluation. 
Always consult with qualified healthcare professionals for proper diagnosis and treatment.
                  `;
                  
                  const blob = new Blob([report], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `advanced-motor-report-${new Date().toISOString().split('T')[0]}.txt`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Download Advanced Report
              </Button>
            </div>

            <div className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-lg border-l-4 border-yellow-500">
              <strong>⚠️ Important Disclaimer:</strong> This is an AI-powered screening tool for research and educational purposes only. 
              Results are not diagnostic and should not replace professional medical evaluation. Always consult with qualified healthcare 
              professionals for proper diagnosis and treatment.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MotorLab;
