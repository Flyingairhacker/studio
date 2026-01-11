'use client';

import React, { useState, useEffect } from 'react';
import { P5CanvasInstance, ReactP5Wrapper } from '@p5-wrapper/react';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';

const WORDS = [
  'system', 'breach', 'firewall', 'network', 'packet', 'exploit', 'kernel',
  'binary', 'compiler', 'debugger', 'protocol', 'server', 'client', 'crypto',
  'malware', 'rootkit', 'phishing', 'trojan', 'worm', 'zombie', 'botnet',
];

function sketch(p5: P5CanvasInstance) {
  class Asteroid {
    x: number;
    y: number;
    word: string;
    speed: number;

    constructor(word: string) {
      this.x = p5.random(p5.width * 0.1, p5.width * 0.9);
      this.y = 0;
      this.word = word;
      this.speed = p5.random(0.5, 2);
    }

    update() {
      this.y += this.speed;
    }

    draw() {
      p5.fill(255);
      p5.textAlign(p5.CENTER);
      p5.textSize(16);
      p5.text(this.word, this.x, this.y);
    }

    isOffScreen() {
      return this.y > p5.height;
    }
  }

  let asteroids: Asteroid[] = [];
  let score = 0;
  let lives = 3;
  let gameState: 'idle' | 'playing' | 'gameOver' = 'idle';
  let userInput = '';
  let onGameOver: (finalScore: number) => void;

  p5.updateWithProps = (props: any) => {
    if (props.gameState) {
      gameState = props.gameState;
      if (gameState === 'playing') {
        asteroids = [];
        score = 0;
        lives = 3;
        userInput = '';
      }
    }
    if (props.onGameOver) {
      onGameOver = props.onGameOver;
    }
  };

  p5.setup = () => {
    p5.createCanvas(500, 400);
    p5.frameRate(60);
  };

  p5.draw = () => {
    p5.background(10, 10, 20); // Deep space background

    if (gameState === 'idle') {
      p5.fill(255);
      p5.textSize(24);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.text('Press Start to Begin Defense', p5.width / 2, p5.height / 2);
      return;
    }

    if (gameState === 'gameOver') {
      p5.fill(255, 0, 0);
      p5.textSize(32);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.text('GAME OVER', p5.width / 2, p5.height / 2 - 20);
      p5.textSize(20);
      p5.fill(255);
      p5.text(`Final Score: ${score}`, p5.width / 2, p5.height / 2 + 20);
      return;
    }

    // Add new asteroids periodically
    if (p5.frameCount % 90 === 0) {
      const newWord = p5.random(WORDS);
      asteroids.push(new Asteroid(newWord));
    }

    // Update and draw asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
      asteroids[i].update();
      asteroids[i].draw();

      if (asteroids[i].isOffScreen()) {
        asteroids.splice(i, 1);
        lives--;
        if (lives <= 0) {
          gameState = 'gameOver';
          if (onGameOver) onGameOver(score);
        }
      }
    }

    // Draw UI
    p5.fill(255);
    p5.textSize(16);
    p5.textAlign(p5.LEFT);
    p5.text(`Score: ${score}`, 10, 20);
    p5.textAlign(p5.RIGHT);
    p5.text(`Lives: ${lives}`, p5.width - 10, 20);

    // Draw user input
    p5.fill(173, 216, 230);
    p5.textAlign(p5.CENTER);
    p5.text(userInput, p5.width / 2, p5.height - 20);

    // Base line
    p5.stroke(255, 0, 0);
    p5.line(0, p5.height - 5, p5.width, p5.height - 5);
  };
  
  p5.keyTyped = () => {
    if (gameState !== 'playing') return;
    if (p5.key.match(/^[a-z]$/i)) {
      userInput += p5.key;
      checkWord();
    }
  };

  p5.keyPressed = () => {
    if (gameState !== 'playing') return;
     if (p5.keyCode === p5.BACKSPACE) {
       userInput = userInput.substring(0, userInput.length - 1);
     } else if (p5.keyCode === p5.ENTER) {
       checkWord(true); // Force check on enter
     }
  };

  function checkWord(forceCheck = false) {
    let destroyed = false;
    for (let i = asteroids.length - 1; i >= 0; i--) {
      if (asteroids[i].word === userInput) {
        asteroids.splice(i, 1);
        score += userInput.length;
        userInput = '';
        destroyed = true;
        break; // Only destroy one at a time
      }
    }
    if (forceCheck && !destroyed) {
       // Optional: add a penalty or negative feedback sound/visual
    }
  }
}

export default function AsteroidDefense() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
  const [score, setScore] = useState(0);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
  };

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    setGameState('gameOver');
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-[500px] h-[400px] bg-black border border-primary/50 rounded-lg overflow-hidden">
        <ReactP5Wrapper sketch={sketch} gameState={gameState} onGameOver={handleGameOver} />
      </div>
      <Button
        onClick={startGame}
        disabled={gameState === 'playing'}
        size="lg"
        className="w-full max-w-sm"
      >
        <Rocket className="mr-2" />
        {gameState === 'playing' ? 'Defense in Progress...' : 'Start Defense'}
      </Button>
    </div>
  );
}
