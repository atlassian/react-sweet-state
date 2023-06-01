import React, {
  StrictMode,
  memo,
  useState,
  useRef,
  useCallback,
  useEffect,
  ComponentType,
} from 'react';
import ReactDOM from 'react-dom/client';
import { defaults } from 'react-sweet-state';

import { cases } from './cases';

defaults.devtools = false;

const MAX = 50;

type CaseResultsProps = { label: string; data: number[]; length?: number };
const CaseResults = ({ label, data, length }: CaseResultsProps) => {
  const sum = data.reduce((a, b) => a + b, 0);

  return (
    <div style={{ color: length ? '#888' : '#000' }}>
      {label}: &nbsp; Avg {Math.round(sum / (length || data.length))}ms | Total{' '}
      {Math.round(sum)}ms
    </div>
  );
};

type CaseRunnerProps = {
  id: string;
  Component: ComponentType<{ onStart: () => void }>;
  expectedTime: number;
  onComplete: () => void;
};
const CaseRunner = memo(
  ({ id, Component, expectedTime, onComplete }: CaseRunnerProps) => {
    const results = useRef<number[]>([]);
    const startTime = useRef(0);
    const onStart = useCallback(() => {
      startTime.current = performance.now();
    }, []);
    const [run, setRun] = useState<boolean | number>(0);

    useEffect(() => {
      if (typeof run === 'number' && run < MAX) {
        results.current.push(performance.now() - startTime.current);
        setTimeout(async () => {
          setRun(false);
          await new Promise((r) => setTimeout(r, 50));
          setRun(run + 1);
        }, 100);
      }
      if (run === MAX) onComplete();
    }, [run, onComplete]);

    return (
      <>
        <h4>Test: {id}</h4>
        <div>
          Runs: {run}
          {typeof run === 'number' && run === MAX && (
            <>
              <CaseResults label="Expected" data={[expectedTime]} length={50} />
              <CaseResults label="Current" data={results.current} />
            </>
          )}
        </div>
        {typeof run === 'number' && <Component key={run} onStart={onStart} />}
      </>
    );
  }
);

/**
 * Main App
 */
const App = () => {
  const [runTest, setRunTest] = useState(0);
  const activeCases = Object.keys(cases).slice(0, runTest);

  const handleComplete = useCallback(() => {
    console.log('COMPLETE');
    setRunTest((n) => n + 1);
  }, []);

  useEffect(() => handleComplete(), [handleComplete]);

  return (
    <>
      {runTest &&
        activeCases.map((k: any) => (
          <CaseRunner
            key={cases[k].id}
            {...cases[k]}
            onComplete={handleComplete}
          />
        ))}
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
