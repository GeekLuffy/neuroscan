import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Play, RotateCcw, CheckCircle, XCircle, Clock, Target, AlertTriangle, FileText, Zap, Activity } from 'lucide-react';

// Types
type TestType = 'forward' | 'backward' | null;
type TestPhase = 'instructions' | 'practice' | 'running' | 'input' | 'feedback' | 'complete';

interface TrialData {
  level: number;
  sequence: number[];
  userInput: number[];
  correct: boolean;
  responseTime: number;
  timestamp: string;
}

interface TestResults {
  forwardSpan: number;
  backwardSpan: number;
  forwardTrials: TrialData[];
  backwardTrials: TrialData[];
  totalDuration: number;
  interpretation: {
    forwardLevel: 'Normal' | 'Mild Concern' | 'High Concern';
    backwardLevel: 'Normal' | 'Mild Concern' | 'High Concern';
    overallRisk: 'Low' | 'Medium' | 'High';
  };
}

// Digit Display Component
const DigitDisplay: React.FC<{ digit: number | null; isVisible: boolean }> = ({ digit, isVisible }) => {
  return (
    <div className="flex items-center justify-center h-32 w-32 mx-auto">
      <div className={`text-6xl font-bold transition-all duration-300 ${
        isVisible && digit !== null 
          ? 'opacity-100 scale-100 text-primary' 
          : 'opacity-0 scale-75 text-muted-foreground'
      }`}>
        {digit !== null ? digit : ''}
      </div>
    </div>
  );
};

// Input Interface Component
const InputInterface: React.FC<{
  onSubmit: (digits: number[]) => void;
  onClear: () => void;
  currentInput: number[];
  expectedLength: number;
  isBackward: boolean;
  onInputChange: (input: number[]) => void;
}> = ({ onSubmit, onClear, currentInput, expectedLength, isBackward, onInputChange }) => {
  const handleNumberClick = (num: number) => {
    if (currentInput.length < expectedLength) {
      const newInput = [...currentInput, num];
      onInputChange(newInput);
      if (newInput.length === expectedLength) {
        setTimeout(() => onSubmit(newInput), 100);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          Enter the digits {isBackward ? 'in REVERSE order' : 'in the same order'}
        </h3>
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: expectedLength }, (_, i) => (
            <div
              key={i}
              className="w-12 h-12 border-2 border-muted rounded-lg flex items-center justify-center text-xl font-semibold"
            >
              {currentInput[i] || ''}
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {currentInput.length}/{expectedLength} digits entered
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            variant="outline"
            size="lg"
            className="h-16 text-xl font-semibold"
            onClick={() => handleNumberClick(num)}
            disabled={currentInput.length >= expectedLength}
          >
            {num}
          </Button>
        ))}
        <Button
          variant="outline"
          size="lg"
          className="h-16 text-xl font-semibold"
          onClick={() => handleNumberClick(0)}
          disabled={currentInput.length >= expectedLength}
        >
          0
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="h-16 col-span-2"
          onClick={() => {
            onInputChange([]);
            onClear();
          }}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

// Results Display Component
const ResultsDisplay: React.FC<{ results: TestResults; onRestart: () => void }> = ({ results, onRestart }) => {
  const getScoreColor = (level: string) => {
    switch (level) {
      case 'Normal': return 'text-green-500';
      case 'Mild Concern': return 'text-yellow-500';
      case 'High Concern': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getScoreBadge = (level: string) => {
    switch (level) {
      case 'Normal': return 'default';
      case 'Mild Concern': return 'secondary';
      case 'High Concern': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Digit Span Test Results</h2>
        <p className="text-muted-foreground">Memory assessment complete</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Forward Span
            </CardTitle>
            <CardDescription>Digits remembered in correct order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold">{results.forwardSpan}</div>
              <Badge variant={getScoreBadge(results.interpretation.forwardLevel)}>
                {results.interpretation.forwardLevel}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Normal: 7±2 | Concern: &lt;5
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Backward Span
            </CardTitle>
            <CardDescription>Digits remembered in reverse order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold">{results.backwardSpan}</div>
              <Badge variant={getScoreBadge(results.interpretation.backwardLevel)}>
                {results.interpretation.backwardLevel}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Normal: 5±2 | Concern: &lt;3
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Overall Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              {results.interpretation.overallRisk === 'Low' && <CheckCircle className="w-6 h-6 text-green-500" />}
              {results.interpretation.overallRisk === 'Medium' && <AlertTriangle className="w-6 h-6 text-yellow-500" />}
              {results.interpretation.overallRisk === 'High' && <XCircle className="w-6 h-6 text-red-500" />}
              <span className={`text-xl font-semibold ${getScoreColor(
                results.interpretation.overallRisk === 'Low' ? 'Normal' : 
                results.interpretation.overallRisk === 'Medium' ? 'Mild Concern' : 'High Concern'
              )}`}>
                {results.interpretation.overallRisk} Risk
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold">Test Duration</div>
                <div className="text-muted-foreground">{Math.round(results.totalDuration / 1000)}s</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Forward Trials</div>
                <div className="text-muted-foreground">{results.forwardTrials.length}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Backward Trials</div>
                <div className="text-muted-foreground">{results.backwardTrials.length}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={onRestart} className="flex-1">
          <Play className="w-4 h-4 mr-2" />
          Take Test Again
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => {
          const dataStr = JSON.stringify(results, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `digit-span-results-${new Date().toISOString().split('T')[0]}.json`;
          link.click();
          URL.revokeObjectURL(url);
        }}>
          <FileText className="w-4 h-4 mr-2" />
          Export Results
        </Button>
      </div>
    </div>
  );
};

// Main Component
export const DigitSpanTest: React.FC = () => {
  // State management
  const [currentTest, setCurrentTest] = useState<TestType>(null);
  const [testPhase, setTestPhase] = useState<TestPhase>('instructions');
  const [currentLevel, setCurrentLevel] = useState(3);
  const [currentSequence, setCurrentSequence] = useState<number[]>([]);
  const [currentDigitIndex, setCurrentDigitIndex] = useState(0);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [showDigit, setShowDigit] = useState(false);
  const [currentDigit, setCurrentDigit] = useState<number | null>(null);
  
  // Results tracking
  const [forwardTrials, setForwardTrials] = useState<TrialData[]>([]);
  const [backwardTrials, setBackwardTrials] = useState<TrialData[]>([]);
  const [forwardSpan, setForwardSpan] = useState(0);
  const [backwardSpan, setBackwardSpan] = useState(0);
  const [testStartTime, setTestStartTime] = useState<number>(0);
  const [trialStartTime, setTrialStartTime] = useState<number>(0);
  const [testResults, setTestResults] = useState<TestResults | null>(null);

  // Refs
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate random sequence
  const generateSequence = useCallback((length: number): number[] => {
    return Array.from({ length }, () => Math.floor(Math.random() * 10));
  }, []);

  // Start test
  const startTest = (testType: TestType) => {
    if (!testType) return;
    
    setCurrentTest(testType);
    setCurrentLevel(testType === 'forward' ? 3 : 2);
    setTestPhase('practice');
    setForwardTrials([]);
    setBackwardTrials([]);
    setForwardSpan(0);
    setBackwardSpan(0);
    setTestStartTime(Date.now());
    setTestResults(null);
    
    // Start with practice trial (always 2 digits for practice)
    setTimeout(() => {
      startTrial(2, true);
    }, 2000);
  };

  // Start individual trial
  const startTrial = useCallback((level: number, isPractice: boolean = false) => {
    const sequence = generateSequence(level);
    console.log(`Starting trial - Level: ${level}, Sequence: [${sequence.join(', ')}], Length: ${sequence.length}, Practice: ${isPractice}`);
    setCurrentSequence(sequence);
    setCurrentLevel(level); // Ensure level is set correctly
    setCurrentDigitIndex(0);
    setUserInput([]);
    setTrialStartTime(Date.now());
    
    if (!isPractice) {
      setTestPhase('running');
    }
    
    // Start showing digits
    showSequence(sequence);
  }, [generateSequence]);

  // Show digit sequence
  const showSequence = useCallback((sequence: number[]) => {
    let index = 0;
    
    const showNextDigit = () => {
      if (index < sequence.length) {
        setCurrentDigitIndex(index);
        setCurrentDigit(sequence[index]);
        setShowDigit(true);
        
        timeoutRef.current = setTimeout(() => {
          setShowDigit(false);
          setCurrentDigit(null);
          
          timeoutRef.current = setTimeout(() => {
            index++;
            if (index < sequence.length) {
              showNextDigit();
            } else {
              // Sequence complete, show input interface
              setCurrentDigitIndex(sequence.length);
              setTestPhase('input');
            }
          }, 200);
        }, 1000);
      }
    };
    
    showNextDigit();
  }, []);

  // Handle user input submission
  const handleInputSubmit = useCallback((input: number[]) => {
    const responseTime = Date.now() - trialStartTime;
    const expectedSequence = currentTest === 'backward' ? [...currentSequence].reverse() : currentSequence;
    const isCorrect = JSON.stringify(input) === JSON.stringify(expectedSequence);
    const isPractice = testPhase === 'practice';
    
    const trialData: TrialData = {
      level: currentLevel,
      sequence: currentSequence,
      userInput: input,
      correct: isCorrect,
      responseTime,
      timestamp: new Date().toISOString()
    };

    // Only add to trials array if not practice
    if (!isPractice) {
      if (currentTest === 'forward') {
        setForwardTrials(prev => [...prev, trialData]);
      } else {
        setBackwardTrials(prev => [...prev, trialData]);
      }
    }

    setTestPhase('feedback');
    
    // Show feedback
    setTimeout(() => {
      if (isPractice) {
        // After practice, start real test
        setTestPhase('running');
        const realStartLevel = currentTest === 'forward' ? 3 : 2;
        startTrial(realStartLevel);
      } else if (isCorrect) {
        // Correct answer - increase level
        const nextLevel = currentLevel + 1;
        const maxLevel = currentTest === 'forward' ? 9 : 7;
        
        if (nextLevel <= maxLevel) {
          startTrial(nextLevel);
        } else {
          // Reached maximum level
          finishCurrentTest(currentLevel);
        }
      } else {
        // Incorrect answer - finish current test
        finishCurrentTest(currentLevel - 1);
      }
    }, 2000);
  }, [currentTest, currentLevel, currentSequence, trialStartTime, testPhase, startTrial]);

  // Finish current test
  const finishCurrentTest = useCallback((finalSpan: number) => {
    if (currentTest === 'forward') {
      setForwardSpan(finalSpan);
      // Start backward test
      setCurrentTest('backward');
      setTestPhase('practice');
      setTimeout(() => startTrial(2, true), 1000); // Practice trial for backward test
    } else {
      setBackwardSpan(finalSpan);
      // Both tests complete
      completeAllTests(forwardSpan, finalSpan);
    }
  }, [currentTest, forwardSpan, startTrial]);

  // Complete all tests and generate results
  const completeAllTests = useCallback((fSpan: number, bSpan: number) => {
    const totalDuration = Date.now() - testStartTime;
    
    // Interpret results
    const forwardLevel = fSpan >= 5 ? 'Normal' : fSpan >= 4 ? 'Mild Concern' : 'High Concern';
    const backwardLevel = bSpan >= 3 ? 'Normal' : bSpan >= 2 ? 'Mild Concern' : 'High Concern';
    const overallRisk = (forwardLevel === 'High Concern' || backwardLevel === 'High Concern') ? 'High' :
                       (forwardLevel === 'Mild Concern' || backwardLevel === 'Mild Concern') ? 'Medium' : 'Low';

    const results: TestResults = {
      forwardSpan: fSpan,
      backwardSpan: bSpan,
      forwardTrials,
      backwardTrials,
      totalDuration,
      interpretation: {
        forwardLevel,
        backwardLevel,
        overallRisk
      }
    };

    // Store in localStorage
    const existingResults = JSON.parse(localStorage.getItem('digitSpanHistory') || '[]');
    existingResults.push({ ...results, timestamp: new Date().toISOString() });
    localStorage.setItem('digitSpanHistory', JSON.stringify(existingResults));

    setTestResults(results);
    setTestPhase('complete');
  }, [testStartTime, forwardTrials, backwardTrials]);

  // Clear input
  const clearInput = () => {
    setUserInput([]);
  };

  // Handle input change
  const handleInputChange = (input: number[]) => {
    setUserInput(input);
  };

  // Reset test
  const resetTest = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setCurrentTest(null);
    setTestPhase('instructions');
    setCurrentLevel(3);
    setCurrentSequence([]);
    setUserInput([]);
    setShowDigit(false);
    setCurrentDigit(null);
    setTestResults(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pt-24">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Brain className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Digit Span Test</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Assess working memory and cognitive function through digit sequence recall
        </p>
        <Badge variant="secondary" className="w-fit mx-auto flex items-center gap-2">
          <Target className="w-3 h-3" /> Memory Assessment
        </Badge>
      </div>

      {testPhase === 'instructions' && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
            <CardDescription>Please read carefully before starting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">Forward Test:</h4>
                <p className="text-sm text-muted-foreground">
                  You'll see a sequence of digits displayed one at a time. After the sequence ends, 
                  enter the digits in the same order you saw them.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Backward Test:</h4>
                <p className="text-sm text-muted-foreground">
                  Similar to forward test, but you must enter the digits in reverse order.
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Note:</strong> The test will start with a practice trial, then gradually 
                  increase difficulty. The test ends when you make an error or reach the maximum level.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => startTest('forward')} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Start Test
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(testPhase === 'practice' || testPhase === 'running') && (
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-center">
              {testPhase === 'practice' ? 'Practice Trial' : `${currentTest?.toUpperCase()} Test`}
            </CardTitle>
            <CardDescription className="text-center">
              Level {currentLevel} - {currentLevel} digits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Watch the digits carefully...
              </p>
              <DigitDisplay digit={currentDigit} isVisible={showDigit} />
              <Progress value={(currentDigitIndex / currentSequence.length) * 100} />
            </div>
          </CardContent>
        </Card>
      )}

      {testPhase === 'input' && (
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Enter the Digits</CardTitle>
            <CardDescription className="text-center">
              Level {currentLevel} - {currentTest === 'backward' ? 'Reverse Order' : 'Same Order'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InputInterface
              onSubmit={handleInputSubmit}
              onClear={clearInput}
              currentInput={userInput}
              expectedLength={currentLevel}
              isBackward={currentTest === 'backward'}
              onInputChange={handleInputChange}
            />
          </CardContent>
        </Card>
      )}

      {testPhase === 'feedback' && (
        <Card className="max-w-lg mx-auto">
          <CardContent className="text-center py-8">
            <div className="space-y-4">
              {JSON.stringify(userInput) === JSON.stringify(
                currentTest === 'backward' ? [...currentSequence].reverse() : currentSequence
              ) ? (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <h3 className="text-xl font-semibold text-green-500">Correct!</h3>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                  <h3 className="text-xl font-semibold text-red-500">Incorrect</h3>
                  <p className="text-sm text-muted-foreground">
                    Correct sequence: {(currentTest === 'backward' ? [...currentSequence].reverse() : currentSequence).join(' ')}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {testPhase === 'complete' && testResults && (
        <div className="max-w-4xl mx-auto">
          <ResultsDisplay results={testResults} onRestart={resetTest} />
        </div>
      )}

      {currentTest && testPhase !== 'complete' && (
        <div className="text-center">
          <Button variant="outline" onClick={resetTest}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Test
          </Button>
        </div>
      )}
    </div>
  );
};
