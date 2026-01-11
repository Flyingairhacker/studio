'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BrainCircuit } from 'lucide-react';

const GameButton = ({
  active,
  onClick,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  disabled: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'aspect-square rounded-lg border-2 border-primary/20 bg-primary/10 transition-all duration-100 ease-in-out',
      'hover:bg-primary/30 disabled:pointer-events-none disabled:opacity-50',
      active
        ? 'scale-105 bg-primary shadow-[0_0_20px_hsl(var(--primary))]'
        : ''
    )}
  />
);

export default function SequenceBreaker() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [gameState, setGameState] = useState<
    'idle' | 'playingSequence' | 'playerTurn' | 'gameOver'
  >('idle');
  const [score, setScore] = useState(0);

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  const startGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setScore(0);
    setGameState('playingSequence');
  };

  useEffect(() => {
    if (gameState === 'playingSequence' && sequence.length === score) {
      addNewToSequence();
    }
  }, [gameState, sequence, score]);

  const addNewToSequence = () => {
    const nextInSequence = Math.floor(Math.random() * 9);
    const newSequence = [...sequence, nextInSequence];
    setSequence(newSequence);
    playSequence(newSequence);
  };

  const playSequence = async (seq: number[]) => {
    await sleep(700);
    for (const buttonIndex of seq) {
      setActiveButton(buttonIndex);
      await sleep(400);
      setActiveButton(null);
      await sleep(200);
    }
    setGameState('playerTurn');
  };

  const handlePlayerClick = (index: number) => {
    if (gameState !== 'playerTurn') return;

    const newPlayerSequence = [...playerSequence, index];
    setPlayerSequence(newPlayerSequence);

    // Check if the current click is correct
    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      setGameState('gameOver');
      return;
    }

    // Check if the player has completed the sequence
    if (newPlayerSequence.length === sequence.length) {
      setScore(score + 1);
      setPlayerSequence([]);
      setGameState('playingSequence');
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4 text-center font-code">
        <div className="rounded-md bg-muted px-4 py-2">
          <p className="text-sm text-muted-foreground">SCORE</p>
          <p className="text-2xl font-bold text-primary">{score}</p>
        </div>
        <div className="flex-grow">
          {gameState === 'idle' && (
            <p className="text-lg">Press Start to begin.</p>
          )}
          {gameState === 'playingSequence' && (
            <p className="text-lg text-yellow-400 animate-pulse">Watch...</p>
          )}
          {gameState === 'playerTurn' && (
            <p className="text-lg text-green-400">Your turn!</p>
          )}
          {gameState === 'gameOver' && (
            <p className="text-lg text-red-500">Game Over! Final Score: {score}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-xs aspect-square">
        {[...Array(9)].map((_, i) => (
          <GameButton
            key={i}
            active={activeButton === i}
            onClick={() => handlePlayerClick(i)}
            disabled={gameState !== 'playerTurn'}
          />
        ))}
      </div>

      <Button
        onClick={startGame}
        disabled={gameState === 'playingSequence' || gameState === 'playerTurn'}
        size="lg"
        className="w-full max-w-xs"
      >
        <BrainCircuit className="mr-2" />
        {gameState === 'gameOver' || gameState === 'idle'
          ? 'Start New Game'
          : 'Game in Progress'}
      </Button>
    </div>
  );
}
