'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { KeyRound, Target, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';

const CODE_LENGTH = 4;
const MAX_ATTEMPTS = 10;
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

type Guess = {
  code: string;
  hits: number;
  blows: number;
};

export default function CodeCracker() {
  const [secretCode, setSecretCode] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [error, setError] = useState<string | null>(null);

  const generateSecretCode = useCallback(() => {
    const shuffled = [...DIGITS].sort(() => 0.5 - Math.random());
    setSecretCode(shuffled.slice(0, CODE_LENGTH));
    setGuesses([]);
    setCurrentGuess('');
    setGameState('playing');
    setError(null);
  }, []);

  useEffect(() => {
    generateSecretCode();
  }, [generateSecretCode]);

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameState !== 'playing' || !currentGuess) return;

    if (currentGuess.length !== CODE_LENGTH || new Set(currentGuess).size !== CODE_LENGTH) {
      setError(`Guess must be ${CODE_LENGTH} unique digits.`);
      return;
    }
    if (!/^\d+$/.test(currentGuess)) {
      setError("Guess must only contain digits.");
      return;
    }
    setError(null);

    let hits = 0;
    let blows = 0;
    const guessArray = currentGuess.split('');
    const secretCopy = [...secretCode];

    // First pass for hits
    for (let i = 0; i < CODE_LENGTH; i++) {
      if (guessArray[i] === secretCopy[i]) {
        hits++;
        guessArray[i] = 'H'; // Mark as checked
        secretCopy[i] = 'H';
      }
    }

    // Second pass for blows
    for (let i = 0; i < CODE_LENGTH; i++) {
        if(guessArray[i] === 'H') continue;
        const blowIndex = secretCopy.indexOf(guessArray[i]);
        if(blowIndex !== -1) {
            blows++;
            secretCopy[blowIndex] = 'B'; // Mark as checked
        }
    }
    
    const newGuesses = [...guesses, { code: currentGuess, hits, blows }];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (hits === CODE_LENGTH) {
      setGameState('won');
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setGameState('lost');
    }
  };

  const attemptsLeft = MAX_ATTEMPTS - guesses.length;

  return (
    <div className="flex flex-col items-center gap-6">
        <div className="w-full max-w-sm space-y-4">
            {gameState === 'won' && (
                <Alert variant="default" className="border-green-500 bg-green-500/10 text-green-300">
                    <AlertTitle className="text-green-400">Code Cracked!</AlertTitle>
                    <AlertDescription>You guessed the secret code: {secretCode.join('')}</AlertDescription>
                </Alert>
            )}
            {gameState === 'lost' && (
                <Alert variant="destructive">
                    <AlertTitle>System Lockout!</AlertTitle>
                    <AlertDescription>You ran out of attempts. The code was: {secretCode.join('')}</AlertDescription>
                </Alert>
            )}
            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg font-code">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Attempts Left</p>
                    <p className="text-2xl font-bold text-primary">{attemptsLeft}</p>
                </div>
                 <div className="text-center">
                    <p className="text-sm text-muted-foreground">Code Length</p>
                    <p className="text-2xl font-bold text-primary">{CODE_LENGTH}</p>
                </div>
            </div>

            <form onSubmit={handleGuessSubmit} className="flex gap-2">
                <Input
                    type="text"
                    value={currentGuess}
                    onChange={(e) => setCurrentGuess(e.target.value)}
                    maxLength={CODE_LENGTH}
                    placeholder="Enter 4 digits"
                    disabled={gameState !== 'playing'}
                    className="font-code text-lg tracking-widest text-center"
                />
                <Button type="submit" disabled={gameState !== 'playing'}>Guess</Button>
            </form>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}

        </div>

        <div className="w-full max-w-sm space-y-2">
             <div className="h-64 overflow-y-auto pr-2 flex flex-col-reverse">
                <div className="space-y-2">
                    {guesses.slice().reverse().map((guess, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-md bg-muted/30 font-code">
                            <p className="text-lg tracking-widest">{guess.code}</p>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5" title="Hits">
                                    <Target className="h-4 w-4 text-green-400" />
                                    <span className="font-bold">{guess.hits}</span>
                                </div>
                                <div className="flex items-center gap-1.5" title="Blows">
                                    <Shuffle className="h-4 w-4 text-yellow-400" />
                                    <span className="font-bold">{guess.blows}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>

        <Button
            onClick={generateSecretCode}
            size="lg"
            className="w-full max-w-sm mt-4"
        >
            <KeyRound className="mr-2" />
            New Game
        </Button>
    </div>
  );
}
