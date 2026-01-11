'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bomb, Flag, Shuffle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GRID_SIZE = 10;
const MINE_COUNT = 15;

type Tile = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};

type Grid = Tile[][];

const createEmptyGrid = (): Grid => {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  );
};

const plantMines = (grid: Grid, initialClickR: number, initialClickC: number): Grid => {
  let minesPlaced = 0;
  const newGrid = grid.map(row => row.map(tile => ({...tile})));

  while (minesPlaced < MINE_COUNT) {
    const r = Math.floor(Math.random() * GRID_SIZE);
    const c = Math.floor(Math.random() * GRID_SIZE);

    if (!newGrid[r][c].isMine && !(r === initialClickR && c === initialClickC)) {
      newGrid[r][c].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate adjacent mines
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!newGrid[r][c].isMine) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && newGrid[nr][nc].isMine) {
              count++;
            }
          }
        }
        newGrid[r][c].adjacentMines = count;
      }
    }
  }
  return newGrid;
};


export default function SystemAnomaly() {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [flagsPlaced, setFlagsPlaced] = useState(0);

  const resetGame = () => {
    setGrid(createEmptyGrid());
    setGameState('idle');
    setFlagsPlaced(0);
  };
  
  const revealTile = (r: number, c: number, currentGrid: Grid): Grid => {
    const newGrid = currentGrid.map(row => row.map(tile => ({...tile})));
    const tile = newGrid[r][c];

    if (tile.isRevealed || tile.isFlagged) return newGrid;

    tile.isRevealed = true;
    
    if (tile.isMine) {
      setGameState('lost');
      // Reveal all mines
      return newGrid.map(row => row.map(t => {
        if (t.isMine) t.isRevealed = true;
        return t;
      }));
    }
    
    if (tile.adjacentMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
            revealTile(nr, nc, newGrid);
          }
        }
      }
    }
    return newGrid;
  };

  const handleTileClick = (r: number, c: number) => {
    if (gameState === 'lost' || gameState === 'won') return;

    let currentGrid = grid;
    if (gameState === 'idle') {
      currentGrid = plantMines(grid, r, c);
      setGameState('playing');
    }
    
    const newGrid = revealTile(r, c, currentGrid);
    setGrid(newGrid);
    checkWinCondition(newGrid);
  };

  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameState !== 'playing' || grid[r][c].isRevealed) return;

    const newGrid = grid.map(row => row.map(tile => ({...tile})));
    const tile = newGrid[r][c];
    
    if (tile.isFlagged) {
      tile.isFlagged = false;
      setFlagsPlaced(prev => prev - 1);
    } else if (flagsPlaced < MINE_COUNT) {
      tile.isFlagged = true;
      setFlagsPlaced(prev => prev + 1);
    }
    setGrid(newGrid);
    checkWinCondition(newGrid);
  };
  
  const checkWinCondition = (currentGrid: Grid) => {
    const revealedCount = currentGrid.flat().filter(t => t.isRevealed).length;
    const flaggedMines = currentGrid.flat().filter(t => t.isFlagged && t.isMine).length;

    if (revealedCount === GRID_SIZE * GRID_SIZE - MINE_COUNT || flaggedMines === MINE_COUNT) {
        if (gameState !== 'lost') setGameState('won');
    }
  }
  
  const TILE_COLORS = [
    'text-blue-400', 'text-green-400', 'text-red-400', 
    'text-purple-400', 'text-yellow-400', 'text-cyan-400', 
    'text-orange-400', 'text-pink-400'
  ];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4 text-center font-code w-full max-w-sm">
        <div className="rounded-md bg-muted px-4 py-2 flex-1 flex items-center justify-center gap-2">
            <Flag className="w-5 h-5 text-primary" />
            <p className="text-2xl font-bold text-primary">{MINE_COUNT - flagsPlaced}</p>
        </div>
        <div className={cn("rounded-md px-4 py-2 flex-1 transition-colors", 
            gameState === 'won' && "bg-green-500/20 text-green-400",
            gameState === 'lost' && "bg-red-500/20 text-red-400",
            gameState === 'playing' && "bg-muted text-primary"
        )}>
           <AnimatePresence mode="wait">
            <motion.p 
                key={gameState}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-lg font-bold"
            >
                {gameState === 'won' && 'System Clear'}
                {gameState === 'lost' && 'Anomaly Detected!'}
                {(gameState === 'idle' || gameState === 'playing') && 'Scanning...'}
            </motion.p>
           </AnimatePresence>
        </div>
      </div>

      <div 
        className="grid gap-px p-2 bg-muted/30 rounded-lg" 
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {grid.map((row, r) =>
          row.map((tile, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => handleTileClick(r, c)}
              onContextMenu={(e) => handleRightClick(e, r, c)}
              disabled={gameState === 'lost' || gameState === 'won'}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-sm font-bold text-lg",
                "transition-colors duration-150",
                tile.isRevealed 
                  ? "bg-background/30 border border-muted" 
                  : "bg-muted/50 hover:bg-muted/80",
                tile.isFlagged && !tile.isRevealed && "bg-blue-500/20"
              )}
            >
              {tile.isRevealed ? (
                tile.isMine ? <Bomb className="text-red-500 w-5 h-5" /> : 
                tile.adjacentMines > 0 ? 
                    <span className={cn(TILE_COLORS[tile.adjacentMines - 1])}>
                        {tile.adjacentMines}
                    </span> : null
              ) : (
                tile.isFlagged && <Flag className="text-blue-400 w-5 h-5" />
              )}
            </button>
          ))
        )}
      </div>

       <Button onClick={resetGame} size="lg" className="w-full max-w-sm mt-4">
        <Shuffle className="mr-2" />
        {gameState === 'idle' ? 'Start Scan' : 'New Scan'}
      </Button>
    </div>
  );
}
