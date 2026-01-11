'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Keyboard, ShieldCheck } from 'lucide-react';

const CHAR_SET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const INITIAL_TIME = 5000; // 5 seconds
const INITIAL_LENGTH = 6;
const TIME_DECREMENT = 100; // Decrease time by 100ms each round
const MIN_TIME = 2000; // Minimum time is 2 seconds
const LENGTH_INCREMENT_INTERVAL = 5; // Increase length every 5 successful rounds

export default function FirewallBreach() {
  const [sequence, setSequence] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [timeLimit, setTimeLimit] = useState(INITIAL_TIME);
  const [sequenceLength, setSequenceLength] = useState(INITIAL_LENGTH);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'failed'>('idle');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateSequence = useCallback(() => {
    let result = '';
    for (let i = 0; i < sequenceLength; i++) {
      result += CHAR_SET.charAt(Math.floor(Math.random() * CHAR_SET.length));
    }
    return result;
  }, [sequenceLength]);

  const resetGame = useCallback(() => {
    setGameState('idle');
    setScore(0);
    setTimeLimit(INITIAL_TIME);
    setSequenceLength(INITIAL_LENGTH);
    setSequence('');
    setUserInput('');
    setTimeLeft(INITIAL_TIME);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const nextRound = useCallback(() => {
    const newSequence = generateSequence();
    setSequence(newSequence);
    setUserInput('');
    
    setGameState('playing');
    setTimeLeft(timeLimit);
    inputRef.current?.focus();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 10) {
                setGameState('failed');
                if (timerRef.current) clearInterval(timerRef.current);
                return 0;
            }
            return prev - 10;
        });
    }, 10);
  }, [generateSequence, timeLimit]);

  const startGame = () => {
    resetGame();
    nextRound();
  };
  
  useEffect(() => {
    if (gameState === 'failed') {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [gameState]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'playing') return;
    const typedValue = e.target.value;
    setUserInput(typedValue);

    if (typedValue === sequence) {
      setScore(prev => {
        const newScore = prev + 1;
        if (newScore % LENGTH_INCREMENT_INTERVAL === 0) {
          setSequenceLength(l => l + 1);
        }
        return newScore;
      });
      setTimeLimit(prev => Math.max(MIN_TIME, prev - TIME_DECREMENT));
      setTimeout(nextRound, 200); // Brief pause before next round
    }
  };

  const progress = (timeLeft / timeLimit) * 100;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4 text-center font-code w-full max-w-sm">
        <div className="rounded-md bg-muted px-4 py-2 flex-1">
          <p className="text-sm text-muted-foreground">SCORE</p>
          <p className="text-2xl font-bold text-primary">{score}</p>
        </div>
        <div className="rounded-md bg-muted px-4 py-2 flex-1">
          <p className="text-sm text-muted-foreground">LEVEL</p>
          <p className="text-2xl font-bold text-primary">{Math.floor(score / LENGTH_INCREMENT_INTERVAL) + 1}</p>
        </div>
      </div>
      
       {gameState === 'failed' && (
            <p className="text-lg text-red-500">Firewall Breach Failed! Final Score: {score}</p>
        )}

      <div className="w-full max-w-sm space-y-4">
        <div className="h-16 flex items-center justify-center bg-muted/50 rounded-lg p-4 font-code text-2xl tracking-[0.2em] text-center text-accent-foreground">
          {gameState === 'playing' ? sequence : '******'}
        </div>

        <Input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          disabled={gameState !== 'playing'}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          className={cn(
            "font-code text-2xl tracking-[0.2em] text-center",
            userInput !== sequence.substring(0, userInput.length) && 'text-destructive'
          )}
        />
        
        <div className="h-4">
            {gameState === 'playing' && <Progress value={progress} className="h-2" />}
        </div>
      </div>

      <Button
        onClick={startGame}
        disabled={gameState === 'playing'}
        size="lg"
        className="w-full max-w-sm mt-4"
      >
        <ShieldCheck className="mr-2" />
        {gameState === 'playing' ? 'Breach in Progress...' : 'Start Breach'}
      </Button>
    </div>
  );
}
