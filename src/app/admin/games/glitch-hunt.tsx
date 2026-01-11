'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Target } from 'lucide-react';

const GRID_SIZE = 16; // 4x4 grid
const GAME_DURATION = 30; // seconds
const GLITCH_INTERVAL = 800; // ms

export default function GlitchHunt() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [activeGlitches, setActiveGlitches] = useState<Set<number>>(new Set());

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const stopGame = useCallback(() => {
    setGameState('finished');
    if (timerRef.current) clearInterval(timerRef.current);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    setActiveGlitches(new Set());
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
    setActiveGlitches(new Set());

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    gameLoopRef.current = setInterval(() => {
      const newActiveGlitches = new Set<number>();
      const glitchCount = 1 + Math.floor(Math.random() * 3); // 1 to 3 glitches at a time
      for (let i = 0; i < glitchCount; i++) {
        const randomIndex = Math.floor(Math.random() * GRID_SIZE);
        newActiveGlitches.add(randomIndex);
      }
      setActiveGlitches(newActiveGlitches);
    }, GLITCH_INTERVAL);
  };
  
  useEffect(() => {
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
  }, []);

  const handleGlitchClick = (index: number) => {
    if (gameState !== 'playing' || !activeGlitches.has(index)) {
      return;
    }
    
    setScore(prev => prev + 1);
    const newGlitches = new Set(activeGlitches);
    newGlitches.delete(index);
    setActiveGlitches(newGlitches);
  };
  
  return (
     <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4 text-center font-code w-full max-w-sm">
        <div className="rounded-md bg-muted px-4 py-2 flex-1">
          <p className="text-sm text-muted-foreground">SCORE</p>
          <p className="text-2xl font-bold text-primary">{score}</p>
        </div>
         <div className="rounded-md bg-muted px-4 py-2 flex-1">
          <p className="text-sm text-muted-foreground">TIME LEFT</p>
          <p className="text-2xl font-bold text-primary">{timeLeft}</p>
        </div>
      </div>
      
       {gameState === 'finished' && (
            <p className="text-lg text-yellow-400">Game Over! Final Score: {score}</p>
        )}

      <div className="grid grid-cols-4 gap-3 w-full max-w-sm aspect-square">
        {[...Array(GRID_SIZE)].map((_, i) => (
          <button
            key={i}
            onClick={() => handleGlitchClick(i)}
            disabled={gameState !== 'playing'}
            className={cn(
                'aspect-square rounded-lg border-2 border-primary/20 bg-primary/10 transition-all duration-100 ease-in-out',
                'disabled:pointer-events-none disabled:opacity-50',
                activeGlitches.has(i)
                ? 'scale-105 bg-accent shadow-[0_0_20px_hsl(var(--accent))] animate-pulse'
                : ''
            )}
            aria-label={`Glitch tile ${i + 1}`}
          />
        ))}
      </div>

      <Button
        onClick={startGame}
        disabled={gameState === 'playing'}
        size="lg"
        className="w-full max-w-sm"
      >
        <Target className="mr-2" />
        {gameState === 'playing' ? 'Game in Progress' : 'Start Hunt'}
      </Button>
    </div>
  );
}
