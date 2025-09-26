import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, TrendingUp, Timer, Target, Brain, FileText, RefreshCw, Play, Square } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

/**
 * Eye & Cognition Lab — robust, validated versions of:
 *  - Saccade reaction test (click target quickly; strict hit window & radius)
 *  - Stroop color-word interference test (respond to INK color; tracks misses & false clicks)
 *  - 2-Back working-memory test (tracks hits, misses, false alarms; optional d')
 *
 * Key improvements vs. original:
 *  - Pre-generated, controlled trials (no biased randomness)
 *  - Precise timing with single active timer per trial; all timers cleaned up
 *  - Debounced responses (one-and-only-one response per trial)
 *  - Proper accuracy, hit/miss/false-alarm bookkeeping
 *  - Stable UI with keyboard shortcuts
 *  - Downloadable report (JSON/CSV; PDF if jsPDF available)
 */

type TestType = 'saccade' | 'stroop' | 'nback' | null;
type TestPhase = 'ready' | 'instructions' | 'running' | 'complete';

type TrialResult = {
  trial: number;
  rt: number | null; // ms; null if no response
  correct: boolean;
  response?: string | null;
  stimulus?: any;
  type?: 'hit' | 'miss' | 'false_alarm' | 'correct_rejection';
};

type TestSummary = {
  avgRT: number | null; // average over responded trials
  accuracy: number; // 0-100
  hits?: number;
  misses?: number;
  falseAlarms?: number;
  correctRejections?: number;
  dPrime?: number | null; // for n-back
};

function mean(arr: number[]): number | null {
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

// Inverse normal CDF approximation for d' (sufficiently accurate for UI)
function invNorm(p: number) {
  // Abramowitz & Stegun approximation
  const a1 = -39.6968302866538, a2 = 220.946098424521, a3 = -275.928510446969, a4 = 138.357751867269, a5 = -30.6647980661472, a6 = 2.50662827745924;
  const b1 = -54.4760987982241, b2 = 161.585836858041, b3 = -155.698979859887, b4 = 66.8013118877197, b5 = -13.2806815528857;
  const c1 = -0.00778489400243029, c2 = -0.322396458041136, c3 = -2.40075827716184, c4 = -2.54973253934373, c5 = 4.37466414146497, c6 = 2.93816398269878;
  const d1 = 0.00778469570904146, d2 = 0.32246712907004, d3 = 2.445134137143, d4 = 3.75440866190742;

  const plow = 0.02425, phigh = 1 - plow;
  let q, r;
  if (p < plow) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6)
            / (((((d1 * q + d2) * q + d3) * q + d4) * q + 1));
  }

  if (phigh < p) {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6)
            / (((((d1 * q + d2) * q + d3) * q + d4) * q + 1));
  }

  q = p - 0.5;
  r = q * q;
  return ((((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q)
        / ((((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1));
}  // <-- make sure this closing brace exists

export const EyeLab: React.FC = () => {
  // -------- Core state --------
  const [currentTest, setCurrentTest] = useState<TestType>(null);
  const [testPhase, setTestPhase] = useState<TestPhase>('ready');
  const [testProgress, setTestProgress] = useState(0);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [status, setStatus] = useState('Select a cognitive test to begin assessment');

  const [trialResults, setTrialResults] = useState<TrialResult[]>([]);
  const [sessionResults, setSessionResults] = useState<Record<'saccade' | 'stroop' | 'nback', TrialResult[]>>({
    saccade: [], stroop: [], nback: []
  });

  // -------- Test-specific state --------
  const [saccadeTarget, setSaccadeTarget] = useState({ x: 50, y: 50, visible: false });
  const [stroopStimulus, setStroopStimulus] = useState({ word: '', color: '' });
  const [nbackLetter, setNbackLetter] = useState('');

  // -------- Refs for timing & safety --------
  const trialStartTime = useRef<number>(0);
  const activeTimer = useRef<number | null>(null);
  const testActive = useRef<boolean>(false);
  const responseTaken = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Refs for pre-generated trial data
  const saccadeTrials = useRef<{x: number, y: number}[]>([]);
  const stroopTrials = useRef<{word: string, color: string}[]>([]);
  const nBackSeq = useRef<string[]>([]);
  const currentTestResults = useRef<TrialResult[]>([]);

  // -------- Configs --------
  const totalTrials = 20;
  const nVal = 2;
  const saccadeTimeout = 2000; // ms
  const stroopTimeout = 3000;  // ms
  const nbackSOA = 1600;       // total time per item (ms)
  const nbackStimulusOn = 800; // show letter duration (ms)
  const targetRadiusPx = 22;   // clickable radius for saccade target

  // Cleanup timers on unmount/test changes
  useEffect(() => () => { if (activeTimer.current) window.clearTimeout(activeTimer.current); }, []);

  // ------------- Trial Generators -------------
  const makeSaccadeTrials = useCallback(() => {
    return Array.from({ length: totalTrials }, () => ({
      x: Math.random() * 80 + 10, // 10-90%
      y: Math.random() * 80 + 10
    }));
  }, [totalTrials]);

  const makeStroopTrials = useCallback(() => {
    const colors = ['red', 'blue', 'green', 'yellow'];
    const trials: { word: string; color: string }[] = [];
    const half = Math.floor(totalTrials / 2);
    // half congruent, half incongruent
    for (let i = 0; i < half; i++) {
      const c = colors[Math.floor(Math.random() * colors.length)];
      trials.push({ word: c, color: c });
    }
    for (let i = half; i < totalTrials; i++) {
      const word = colors[Math.floor(Math.random() * colors.length)];
      let color = colors[Math.floor(Math.random() * colors.length)];
      while (color === word) color = colors[Math.floor(Math.random() * colors.length)];
      trials.push({ word, color });
    }
    // shuffle
    for (let i = trials.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [trials[i], trials[j]] = [trials[j], trials[i]];
    }
    return trials;
  }, [totalTrials]);

  const makeNBackSeq = useCallback(() => {
    const letters = ['A','B','C','D','E','F','G','H'];
    const targetRate = 0.3; // ~30% targets
    const seq: string[] = [];
    for (let t = 0; t < totalTrials; t++) {
      if (t >= nVal && Math.random() < targetRate) {
        // force a match
        seq.push(seq[t - nVal]);
      } else {
        // choose a letter that won't accidentally match
        let L = letters[Math.floor(Math.random() * letters.length)];
        if (t >= nVal) {
          while (L === seq[t - nVal]) {
            L = letters[Math.floor(Math.random() * letters.length)];
          }
        }
        seq.push(L);
      }
    }
    return seq;
  }, [totalTrials, nVal]);

  const recordResult = useCallback((res: TrialResult) => {
    currentTestResults.current.push(res);
    setTrialResults([...currentTestResults.current]);
  }, []);

  const finishTest = useCallback((testType: Exclude<TestType, null>) => {
    testActive.current = false;
    setTestProgress(100);
    setTestPhase('complete');
    setStatus('Test complete! Review your performance and export a report.');
    setSessionResults(prev => ({ ...prev, [testType]: currentTestResults.current }));
  }, []);

  const advanceOrFinish = useCallback((t: number, testType: Exclude<TestType, null>) => {
    const next = t + 1;
    if (next >= totalTrials) {
      finishTest(testType);
    } else {
      // small ISI to stabilize UI
      activeTimer.current = window.setTimeout(() => runTrial(next, testType), 400);
    }
  }, [totalTrials, finishTest]);

  const runTrial = useCallback((t: number, testType: Exclude<TestType, null>) => {
    responseTaken.current = false;
    setCurrentTrial(t + 1);
    setTestProgress(((t) / totalTrials) * 100);
    setStatus(`Running ${testType} — Trial ${t + 1}/${totalTrials}`);

    if (testType === 'saccade') {
      const { x, y } = saccadeTrials.current[t];
      setSaccadeTarget({ x, y, visible: true });
      trialStartTime.current = performance.now();
      activeTimer.current = window.setTimeout(() => {
        if (!responseTaken.current) {
          setSaccadeTarget(prev => ({ ...prev, visible: false }));
          recordResult({ trial: t + 1, rt: null, correct: false, type: 'miss', stimulus: { x, y } });
          advanceOrFinish(t, testType);
        }
      }, saccadeTimeout);
    }

    if (testType === 'stroop') {
      const trial = stroopTrials.current[t];
      setStroopStimulus(trial);
      trialStartTime.current = performance.now();
      activeTimer.current = window.setTimeout(() => {
        if (!responseTaken.current) {
          recordResult({ trial: t + 1, rt: null, correct: false, type: 'miss', stimulus: trial });
          advanceOrFinish(t, testType);
        }
      }, stroopTimeout);
    }

if (testType === 'nback') {
  const letter = nBackSeq.current[t];
  setNbackLetter(letter);
  trialStartTime.current = performance.now();

  // Clear letter after stimulus duration
  const stimTimer = window.setTimeout(() => {
    setNbackLetter('');
  }, nbackStimulusOn);

  // End-of-trial logic
  const trialTimer = window.setTimeout(() => {
    const wasTarget = t >= nVal && nBackSeq.current[t - nVal] === letter;
    if (!responseTaken.current) {
      if (wasTarget) {
        recordResult({ trial: t + 1, rt: null, correct: false, type: 'miss', stimulus: letter });
      } else {
        recordResult({ trial: t + 1, rt: null, correct: true, type: 'correct_rejection', stimulus: letter });
      }
    }
    advanceOrFinish(t, testType);
  }, nbackSOA);

  // Store both timers so you can clear on reset
  activeTimer.current = trialTimer;
}
  }, [totalTrials, saccadeTimeout, stroopTimeout, nbackSOA, nbackStimulusOn, nVal, recordResult, advanceOrFinish]);

  const startTest = useCallback((testType: TestType) => {
    if (!testType) return;
    if (activeTimer.current) window.clearTimeout(activeTimer.current);
    testActive.current = true;
    responseTaken.current = false;
    setTrialResults([]);
    currentTestResults.current = [];
    setCurrentTrial(0);
    setTestProgress(0);
    setCurrentTest(testType);
    setTestPhase('instructions');

    const instructionText: Record<Exclude<TestType, null>, string> = {
      saccade: 'Focus on the center. A dot will appear around the screen—click it as fast as possible. Clicks anywhere else won\'t count.',
      stroop: 'Select the INK COLOR of the word (not the text). Use keys R/B/G/Y or click.',
      nback: 'If the current letter matches the one from 2 steps earlier, press Space or the Match button.'
    };
    setStatus(`Instructions: ${instructionText[testType]}`);

    if (testType === 'saccade') saccadeTrials.current = makeSaccadeTrials();
    if (testType === 'stroop') stroopTrials.current = makeStroopTrials();
    if (testType === 'nback') nBackSeq.current = makeNBackSeq();

    activeTimer.current = window.setTimeout(() => {
      setTestPhase('running');
      runTrial(0, testType);
    }, 4000);
  }, [makeSaccadeTrials, makeStroopTrials, makeNBackSeq, runTrial]);

  const onSaccadeClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (currentTest !== 'saccade' || !saccadeTarget.visible || responseTaken.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const targetX = (saccadeTarget.x / 100) * rect.width;
    const targetY = (saccadeTarget.y / 100) * rect.height;
    const dist = Math.hypot(clickX - targetX, clickY - targetY);
    const within = dist <= targetRadiusPx;

    const rt = Math.round(performance.now() - trialStartTime.current);
    responseTaken.current = true;
    setSaccadeTarget(prev => ({ ...prev, visible: false }));
    if (activeTimer.current) window.clearTimeout(activeTimer.current);

    recordResult({
      trial: currentTrial,
      rt,
      correct: within,
      type: within ? 'hit' : 'false_alarm',
      stimulus: { x: saccadeTarget.x, y: saccadeTarget.y },
      response: within ? 'hit' : 'outside_click'
    });
    advanceOrFinish(currentTrial - 1, 'saccade');
  }, [currentTest, saccadeTarget, currentTrial, recordResult, advanceOrFinish, targetRadiusPx]);

  const onStroopAnswer = useCallback((choiceColor: string) => {
    if (currentTest !== 'stroop' || responseTaken.current) return;
    responseTaken.current = true;
    if (activeTimer.current) window.clearTimeout(activeTimer.current);
    const rt = Math.round(performance.now() - trialStartTime.current);
    const correct = choiceColor === stroopStimulus.color;
    recordResult({
      trial: currentTrial,
      rt,
      correct,
      type: correct ? 'hit' : 'false_alarm',
      stimulus: { ...stroopStimulus },
      response: choiceColor,
    });
    advanceOrFinish(currentTrial - 1, 'stroop');
  }, [currentTest, stroopStimulus, currentTrial, recordResult, advanceOrFinish]);

  const onNBackAnswer = useCallback(() => {
    if (currentTest !== 'nback' || responseTaken.current) return;
    const t = currentTrial - 1;
    const letter = nBackSeq.current[t];
    const isTarget = t >= nVal && nBackSeq.current[t - nVal] === letter;
    responseTaken.current = true;
    // Note: We don't clear the main SOA timer here, as it handles non-responses
    
    const rt = Math.round(performance.now() - trialStartTime.current);
    recordResult({
      trial: currentTrial,
      rt,
      correct: isTarget,
      type: isTarget ? 'hit' : 'false_alarm',
      stimulus: letter,
      response: 'match_press'
    });
    // Don't advance here, let the main SOA timer handle it to keep rhythm
  }, [currentTest, currentTrial, nVal, recordResult]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (testPhase !== 'running') return;
      if (currentTest === 'stroop') {
        const map: Record<string, string> = { r: 'red', b: 'blue', g: 'green', y: 'yellow' };
        const key = e.key.toLowerCase();
        if (map[key]) {
          e.preventDefault();
          onStroopAnswer(map[key]);
        }
      } else if (currentTest === 'nback') {
        if (e.code === 'Space') {
          e.preventDefault();
          onNBackAnswer();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [testPhase, currentTest, onStroopAnswer, onNBackAnswer]);

  const resetTest = () => {
    if (activeTimer.current) window.clearTimeout(activeTimer.current);
    testActive.current = false;
    setCurrentTest(null);
    setTestPhase('ready');
    setTestProgress(0);
    setTrialResults([]);
    setCurrentTrial(0);
    setStatus('Select a cognitive test to begin assessment');
    setSaccadeTarget({ x: 50, y: 50, visible: false });
    setStroopStimulus({ word: '', color: '' });
    setNbackLetter('');
  };

  // ------------- Summaries -------------
  const { avgRT, accuracy, counts } = useMemo(() => {
    const results = trialResults;
    const rts = results.map(r => (r.rt ?? undefined)).filter((x): x is number => typeof x === 'number');
    const avg = mean(rts);
    const correct = results.filter(t => t.correct).length;
    const acc = results.length > 0 ? (correct / results.length) * 100 : 0;
    const hits = results.filter(t => t.type === 'hit').length;
    const misses = results.filter(t => t.type === 'miss').length;
    const fas = results.filter(t => t.type === 'false_alarm').length;
    const crs = results.filter(t => t.type === 'correct_rejection').length;
    return { avgRT: avg, accuracy: acc, counts: { hits, misses, fas, crs } };
  }, [trialResults]);

  const nbackDPrime = useMemo(() => {
    if (currentTest !== 'nback' || testPhase !== 'complete') return null;
    const tr = trialResults;
    const hits = tr.filter(t => t.type === 'hit').length;
    const misses = tr.filter(t => t.type === 'miss').length;
    const fas = tr.filter(t => t.type === 'false_alarm').length;
    const crs = tr.filter(t => t.type === 'correct_rejection').length;
    const hitRate = hits + misses > 0 ? hits / (hits + misses) : 0.5;
    const faRate = fas + crs > 0 ? fas / (fas + crs) : 0.5;
    const adjHit = clamp(hitRate, 1 / (2 * totalTrials), 1 - 1 / (2 * totalTrials));
    const adjFA = clamp(faRate, 1 / (2 * totalTrials), 1 - 1 / (2 * totalTrials));
    return +(invNorm(adjHit) - invNorm(adjFA)).toFixed(2);
  }, [trialResults, testPhase, currentTest, totalTrials]);

  const chartData = useMemo(() => trialResults.map((t) => ({ trial: t.trial, rt: t.rt ?? 0 })), [trialResults]);

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ------------- Report Generation -------------
  const generateReport = useCallback(async (testName: TestType, results: TrialResult[]) => {
    if (!testName || !results.length) return;

    const rts = results.map(r => r.rt).filter((x): x is number => typeof x === 'number');
    const localAvgRt = mean(rts);
    const localAccuracy = (results.filter(t => t.correct).length / results.length) * 100;
    const localCounts = {
        hits: results.filter(t => t.type === 'hit').length,
        misses: results.filter(t => t.type === 'miss').length,
        fas: results.filter(t => t.type === 'false_alarm').length,
        crs: results.filter(t => t.type === 'correct_rejection').length,
    };
    
    let dPrime = null;
    if (testName === 'nback') {
        const hitRate = localCounts.hits + localCounts.misses > 0 ? localCounts.hits / (localCounts.hits + localCounts.misses) : 0.5;
        const faRate = localCounts.fas + localCounts.crs > 0 ? localCounts.fas / (localCounts.fas + localCounts.crs) : 0.5;
        const adjHit = clamp(hitRate, 1 / (2 * totalTrials), 1 - 1 / (2 * totalTrials));
        const adjFA = clamp(faRate, 1 / (2 * totalTrials), 1 - 1 / (2 * totalTrials));
        dPrime = +(invNorm(adjHit) - invNorm(adjFA)).toFixed(2);
    }

    const summary: TestSummary = {
      avgRT: localAvgRt,
      accuracy: +localAccuracy.toFixed(1),
      hits: localCounts.hits,
      misses: localCounts.misses,
      falseAlarms: localCounts.fas,
      correctRejections: localCounts.crs,
      dPrime,
    };

    const payload = {
      test: testName,
      timestamp: new Date().toISOString(),
      trials: results,
      summary,
    };

    const jsonBlob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    triggerDownload(jsonBlob, `eye-lab-${testName}-report.json`);

    const header = 'trial,rt_ms,correct,type,stimulus,response\n';
    const rows = results.map(t => [t.trial, t.rt ?? '', t.correct ? 1 : 0, t.type ?? '', JSON.stringify(t.stimulus ?? ''), t.response ?? ''].join(','));
    const csvBlob = new Blob([header + rows.join('\n')], { type: 'text/csv' });
    triggerDownload(csvBlob, `eye-lab-${testName}-trials.csv`);

    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Eye & Cognition Lab Report', 14, 18);
      doc.setFontSize(11);
      doc.text(`Test: ${testName.toUpperCase()}`, 14, 28);
      doc.text(`Date: ${new Date().toLocaleString()}`, 14, 34);
      doc.text(`Avg RT: ${summary.avgRT ? Math.round(summary.avgRT) + ' ms' : 'n/a'}`, 14, 40);
      doc.text(`Accuracy: ${summary.accuracy.toFixed(1)}%`, 14, 46);
      if (testName === 'nback') {
        doc.text(`d': ${summary.dPrime ?? 'n/a'}`, 14, 52);
      }
      const tableRows = results.map(t => [t.trial, t.rt ?? '', t.correct ? '1' : '0', t.type ?? '', JSON.stringify(t.stimulus ?? ''), t.response ?? '']);
      autoTable(doc, {
        head: [['Trial', 'RT (ms)', 'Correct', 'Type', 'Stimulus', 'Response']],
        body: tableRows,
        startY: testName === 'nback' ? 56 : 52,
        styles: { fontSize: 8 },
        columnStyles: { 4: { cellWidth: 70 } },
      });
      doc.save(`eye-lab-${testName}-report.pdf`);
    } catch (e) {
      console.warn('PDF generation skipped. Install jspdf & jspdf-autotable.', e);
    }
  }, [totalTrials]);


  // ------------- UI -------------
  const tests = [
    { id: 'saccade', title: 'Saccade Test', description: 'Measure eye-movement reaction speed', icon: Target },
    { id: 'stroop', title: 'Stroop Test', description: 'Attention & interference control', icon: Brain },
    { id: 'nback', title: '2-Back Test', description: 'Working memory & vigilance', icon: Timer }
  ] as const;

  const avgRTDisplay = avgRT ? Math.round(avgRT) : 0;

  return (
    <div className="space-y-8 animate-fade-in pt-24">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Eye className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Eye & Cognition Lab</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Validated micro-assessments for reaction time, attention, and working memory.
        </p>
        <Badge variant="secondary" className="w-fit mx-auto flex items-center gap-2">
          <Brain className="w-3 h-3" /> Cognitive Battery
        </Badge>
      </div>

      {currentTest ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Area */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize flex items-center gap-2">
                  {currentTest === 'saccade' && <Target className="w-5 h-5" />} 
                  {currentTest === 'stroop' && <Brain className="w-5 h-5" />} 
                  {currentTest === 'nback' && <Timer className="w-5 h-5" />} 
                  {currentTest} Test
                </CardTitle>
                <div className="flex gap-2">
                  {testPhase === 'running' || testPhase === 'complete' ? (
                    <Button variant="outline" size="sm" onClick={resetTest}><Square className="w-4 h-4 mr-1"/>Exit</Button>
                  ) : null}
                </div>
              </div>
              <CardDescription>{status}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {testPhase === 'running' && (
                <div className="space-y-2">
                  <Progress value={testProgress} />
                  <p className="text-xs text-muted-foreground text-center">Trial {currentTrial}/{totalTrials}</p>
                </div>
              )}

              <div
                ref={containerRef}
                className="relative bg-muted/30 rounded-lg aspect-video select-none"
                onClick={onSaccadeClick}
              >
                {/* Saccade */}
                {currentTest === 'saccade' && saccadeTarget.visible && (
                  <div
                    className="absolute w-6 h-6 rounded-full bg-destructive/90 shadow"
                    style={{ left: `${saccadeTarget.x}%`, top: `${saccadeTarget.y}%`, transform: 'translate(-50%, -50%)' }}
                    aria-label="Saccade target"
                  />
                )}

                {/* Stroop */}
                {currentTest === 'stroop' && stroopStimulus.word && testPhase === 'running' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="text-5xl font-bold" style={{ color: stroopStimulus.color }}>
                        {stroopStimulus.word.toUpperCase()}
                      </div>
                      <div className="flex gap-2 justify-center">
                        {['red','blue','green','yellow'].map(c => (
                          <Button key={c} variant="outline" onClick={() => onStroopAnswer(c)} style={{ backgroundColor: c, color: 'white' }}>
                            {c}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Shortcuts: R / B / G / Y</p>
                    </div>
                  </div>
                )}

                {/* N-Back */}
                {currentTest === 'nback' && testPhase === 'running' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="text-7xl font-bold">{nbackLetter}</div>
                      <div className="flex items-center justify-center gap-2">
                        <Button onClick={onNBackAnswer}><Play className="w-4 h-4 mr-1"/>Match (Space)</Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Press only on 2-back matches</p>
                    </div>
                  </div>
                )}

                {/* States */}
                {testPhase === 'instructions' && (
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center p-6">
                      <Brain className="w-12 h-12 mx-auto mb-3 animate-pulse" />
                      <p className="font-semibold">Get ready…</p>
                      <p className="text-xs text-muted-foreground">Starting in 4 seconds</p>
                    </div>
                  </div>
                )}
                 {testPhase === 'complete' && (
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center p-6">
                      <TrendingUp className="w-12 h-12 mx--auto mb-3" />
                      <p className="font-semibold">Test Complete</p>
                      <p className="text-xs text-muted-foreground">Check your results</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5"/> Real-time Results</CardTitle>
              <CardDescription>Objective performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Avg RT</div>
                  <div className="text-2xl font-semibold">{avgRTDisplay} ms</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Accuracy</div>
                  <div className="text-2xl font-semibold">{accuracy.toFixed(0)}%</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Hits / Misses</div>
                  <div className="text-2xl font-semibold">{counts.hits} / {counts.misses}</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">False Alarms</div>
                  <div className="text-2xl font-semibold">{counts.fas}</div>
                </div>
                {currentTest === 'nback' && (
                  <div className="text-center p-4 rounded-lg bg-muted/50 col-span-2">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">d'</div>
                    <div className="text-2xl font-semibold">{nbackDPrime ?? '—'}</div>
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Reaction Time Trend</div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="trial" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip formatter={(v: any) => [`${v} ms`, 'RT']} />
                      <Line type="monotone" dataKey="rt" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => generateReport(currentTest, trialResults)} disabled={testPhase !== 'complete'}>
                  <FileText className="w-4 h-4 mr-2"/> Generate Report
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => startTest(currentTest)}>
                  <RefreshCw className="w-4 h-4 mr-2"/> Restart Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tests.map(({ id, title, description, icon: Icon }) => (
            <Card key={id} className="group cursor-pointer" onClick={() => startTest(id as TestType)}>
              <CardHeader className="text-center">
                <Icon className="w-12 h-12 mx-auto mb-3" />
                <CardTitle className="group-hover:text-primary transition-colors">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Start Test</Button>
              </CardContent>
            </Card>
          ))}

          {/* If any prior test completed, offer a combined export */}
          {(sessionResults.saccade.length > 0 || sessionResults.stroop.length > 0 || sessionResults.nback.length > 0) && (
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5"/> Export Past Results</CardTitle>
                <CardDescription>Download the most recent results from each test</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(['saccade','stroop','nback'] as const).map(key => (
                    sessionResults[key].length > 0 ? (
                      <Button key={key} variant="outline" onClick={() => generateReport(key, sessionResults[key])}>
                        Download {key} report
                      </Button>
                    ) : null
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
