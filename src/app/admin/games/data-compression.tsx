
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GRID_SIZE = 4;

type Grid = (number | null)[][];

const TILE_COLORS: { [key: number]: string } = {
  2: "bg-blue-900/50 text-blue-200",
  4: "bg-cyan-900/50 text-cyan-200",
  8: "bg-teal-900/50 text-teal-200",
  16: "bg-green-900/50 text-green-200",
  32: "bg-lime-900/50 text-lime-200",
  64: "bg-yellow-900/50 text-yellow-200",
  128: "bg-orange-800/50 text-orange-100",
  256: "bg-red-800/50 text-red-100",
  512: "bg-fuchsia-800/50 text-fuchsia-100",
  1024: "bg-purple-800/50 text-purple-100",
  2048: "bg-indigo-700/60 text-indigo-50 shadow-[0_0_20px_hsl(var(--primary))]",
};

const createEmptyGrid = (): Grid => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

const addRandomTile = (grid: Grid): Grid => {
  const newGrid = grid.map(row => [...row]);
  const emptyTiles: { r: number; c: number }[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (newGrid[r][c] === null) {
        emptyTiles.push({ r, c });
      }
    }
  }

  if (emptyTiles.length > 0) {
    const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
  return newGrid;
};

const slide = (row: (number | null)[]): (number | null)[] => {
  const filtered = row.filter(val => val !== null);
  const newRow = Array(GRID_SIZE).fill(null);
  let index = 0;
  for (let i = 0; i < filtered.length; i++) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      newRow[index++] = filtered[i]! * 2;
      i++;
    } else {
      newRow[index++] = filtered[i];
    }
  }
  return newRow;
};

const rotateGrid = (grid: Grid): Grid => {
  const newGrid = createEmptyGrid();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      newGrid[r][c] = grid[GRID_SIZE - 1 - c][r];
    }
  }
  return newGrid;
};

export default function DataCompression() {
  const [grid, setGrid] = useState<Grid>(addRandomTile(addRandomTile(createEmptyGrid())));
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState !== 'playing') return;

    let currentGrid = grid;
    let rotations = 0;
    if (direction === 'up') rotations = 1;
    if (direction === 'right') rotations = 2;
    if (direction === 'down') rotations = 3;

    for (let i = 0; i < rotations; i++) {
      currentGrid = rotateGrid(currentGrid);
    }
    
    let newGrid = currentGrid.map(row => slide(row));

    for (let i = 0; i < rotations; i++) {
      newGrid = rotateGrid(newGrid);
      newGrid = rotateGrid(newGrid);
      newGrid = rotateGrid(newGrid);
    }

    if (JSON.stringify(newGrid) !== JSON.stringify(grid)) {
      setGrid(addRandomTile(newGrid));
    }
  }, [grid, gameState]);

  const resetGame = () => {
    setGrid(addRandomTile(addRandomTile(createEmptyGrid())));
    setGameState('playing');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowUp': move('up'); break;
        case 'ArrowDown': move('down'); break;
        case 'ArrowLeft': move('left'); break;
        case 'ArrowRight': move('right'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);
  
  useEffect(() => {
    // Check for win/loss
    let has2048 = false;
    let canMove = false;
    const flatGrid = grid.flat();
    if(flatGrid.includes(2048)) has2048 = true;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === null) {
          canMove = true;
          break;
        }
        if (r + 1 < GRID_SIZE && grid[r][c] === grid[r+1][c]) canMove = true;
        if (c + 1 < GRID_SIZE && grid[r][c] === grid[r][c+1]) canMove = true;
      }
      if (canMove) break;
    }

    if (has2048) setGameState('won');
    else if (!canMove) setGameState('lost');
  }, [grid]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center font-code">
        {gameState === 'won' && <p className="text-green-400 text-xl font-bold">Compression Complete: 2048 Reached!</p>}
        {gameState === 'lost' && <p className="text-red-400 text-xl font-bold">Buffer Overflow! No more moves.</p>}
      </div>

      <div className="grid grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg w-full max-w-sm aspect-square">
        <AnimatePresence>
        {grid.map((row, r) =>
          row.map((val, c) => (
            <motion.div
              key={`${r}-${c}-${val}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "w-full aspect-square rounded-md flex items-center justify-center font-bold text-3xl",
                val ? TILE_COLORS[val] || 'bg-gray-700' : 'bg-background/30'
              )}
            >
              {val}
            </motion.div>
          ))
        )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
        <div></div>
        <Button onClick={() => move('up')} size="icon" className="w-full h-14" disabled={gameState !== 'playing'}><ArrowUp /></Button>
        <div></div>
        <Button onClick={() => move('left')} size="icon" className="w-full h-14" disabled={gameState !== 'playing'}><ArrowLeft /></Button>
        <Button onClick={() => move('down')} size="icon" className="w-full h-14" disabled={gameState !== 'playing'}><ArrowDown /></Button>
        <Button onClick={() => move('right')} size="icon" className="w-full h-14" disabled={gameState !== 'playing'}><ArrowRight /></Button>
      </div>

      <Button onClick={resetGame} size="lg" className="w-full max-w-sm mt-4">
        <Shuffle className="mr-2" />
        New Compression
      </Button>
    </div>
  );
}
