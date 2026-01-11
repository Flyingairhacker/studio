'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Network, RotateCcw, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TileType = 'empty' | 'corner' | 'straight' | 't-junction' | 'cross';
type Tile = {
  type: TileType;
  rotation: number; // 0, 90, 180, 270
  isSource?: boolean;
  isDestination?: boolean;
};
type Grid = Tile[][];

const GRID_SIZE = 5;
const TILE_TYPES: TileType[] = ['corner', 'straight', 't-junction'];

const getConnections = (tile: Tile): { top: boolean; right: boolean; bottom: boolean; left: boolean } => {
  const connections = { top: false, right: false, bottom: false, left: false };
  const rotated = tile.rotation % 360;

  switch (tile.type) {
    case 'corner':
      if (rotated === 0) { connections.top = true; connections.right = true; }
      if (rotated === 90) { connections.right = true; connections.bottom = true; }
      if (rotated === 180) { connections.bottom = true; connections.left = true; }
      if (rotated === 270) { connections.left = true; connections.top = true; }
      break;
    case 'straight':
      if (rotated === 0 || rotated === 180) { connections.left = true; connections.right = true; }
      if (rotated === 90 || rotated === 270) { connections.top = true; connections.bottom = true; }
      break;
    case 't-junction':
      if (rotated === 0) { connections.left = true; connections.top = true; connections.right = true; }
      if (rotated === 90) { connections.top = true; connections.right = true; connections.bottom = true; }
      if (rotated === 180) { connections.right = true; connections.bottom = true; connections.left = true; }
      if (rotated === 270) { connections.bottom = true; connections.left = true; connections.top = true; }
      break;
    case 'cross':
      return { top: true, right: true, bottom: true, left: true };
  }
  return connections;
};

const generateLevel = (): Grid => {
  const grid: Grid = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      type: TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)],
      rotation: [0, 90, 180, 270][Math.floor(Math.random() * 4)],
    }))
  );

  grid[0][0] = { type: 'cross', rotation: 0, isSource: true };
  grid[GRID_SIZE - 1][GRID_SIZE - 1] = { type: 'cross', rotation: 0, isDestination: true };
  
  return grid;
};


export default function DataFlow() {
  const [grid, setGrid] = useState<Grid>(generateLevel());
  const [isSolved, setIsSolved] = useState(false);

  const checkSolution = useCallback((currentGrid: Grid) => {
    const visited = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
    const queue: [number, number][] = [[0, 0]];
    visited[0][0] = true;

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      if (r === GRID_SIZE - 1 && c === GRID_SIZE - 1) return true;

      const currentConnections = getConnections(currentGrid[r][c]);

      // Check top
      if (r > 0 && !visited[r - 1][c] && currentConnections.top && getConnections(currentGrid[r - 1][c]).bottom) {
        visited[r - 1][c] = true;
        queue.push([r - 1, c]);
      }
      // Check right
      if (c < GRID_SIZE - 1 && !visited[r][c + 1] && currentConnections.right && getConnections(currentGrid[r][c + 1]).left) {
        visited[r][c + 1] = true;
        queue.push([r, c + 1]);
      }
      // Check bottom
      if (r < GRID_SIZE - 1 && !visited[r + 1][c] && currentConnections.bottom && getConnections(currentGrid[r + 1][c]).top) {
        visited[r + 1][c] = true;
        queue.push([r + 1, c]);
      }
      // Check left
      if (c > 0 && !visited[r][c - 1] && currentConnections.left && getConnections(currentGrid[r][c - 1]).right) {
        visited[r][c - 1] = true;
        queue.push([r, c - 1]);
      }
    }

    return false;
  }, []);

  useEffect(() => {
    setIsSolved(checkSolution(grid));
  }, [grid, checkSolution]);

  const handleTileClick = (r: number, c: number) => {
    if (grid[r][c].isSource || grid[r][c].isDestination || isSolved) return;

    const newGrid = grid.map(row => row.map(tile => ({ ...tile })));
    newGrid[r][c].rotation = (newGrid[r][c].rotation + 90) % 360;
    setGrid(newGrid);
  };
  
  const resetLevel = () => {
    setGrid(generateLevel());
    setIsSolved(false);
  }

  const path = useMemo(() => {
    const visited = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
    const queue: [number, number][] = [[0, 0]];
    visited[0][0] = true;

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      const currentConnections = getConnections(grid[r][c]);

      if (r > 0 && !visited[r - 1][c] && currentConnections.top && getConnections(grid[r - 1][c]).bottom) {
        visited[r - 1][c] = true;
        queue.push([r - 1, c]);
      }
      if (c < GRID_SIZE - 1 && !visited[r][c + 1] && currentConnections.right && getConnections(grid[r][c + 1]).left) {
        visited[r][c + 1] = true;
        queue.push([r, c + 1]);
      }
      if (r < GRID_SIZE - 1 && !visited[r + 1][c] && currentConnections.bottom && getConnections(grid[r + 1][c]).top) {
        visited[r + 1][c] = true;
        queue.push([r + 1, c]);
      }
      if (c > 0 && !visited[r][c - 1] && currentConnections.left && getConnections(grid[r][c - 1]).right) {
        visited[r][c - 1] = true;
        queue.push([r, c - 1]);
      }
    }
    return visited;
  }, [grid]);

  return (
    <div className="flex flex-col items-center gap-6">
       <div className="flex items-center gap-4 text-center font-code w-full max-w-sm">
        <div className={cn("rounded-md bg-muted px-4 py-2 flex-1 transition-colors", isSolved && "bg-green-500/20")}>
          <p className="text-sm text-muted-foreground">STATUS</p>
          <p className={cn("text-2xl font-bold", isSolved ? "text-green-400" : "text-primary")}>
            {isSolved ? "Connected" : "Disconnected"}
          </p>
        </div>
      </div>

      <div className="grid gap-1 p-2 bg-muted/30 rounded-lg" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
        {grid.map((row, r) =>
          row.map((tile, c) => {
            const connections = getConnections(tile);
            const isConnected = path[r][c];
            
            return (
              <motion.button
                key={`${r}-${c}`}
                onClick={() => handleTileClick(r, c)}
                className="relative w-14 h-14 bg-background/50 rounded-sm flex items-center justify-center disabled:cursor-not-allowed"
                disabled={tile.isSource || tile.isDestination || isSolved}
                whileHover={{ scale: (tile.isSource || tile.isDestination) ? 1 : 1.1 }}
                whileTap={{ scale: (tile.isSource || tile.isDestination) ? 1 : 0.95 }}
              >
                <div className="absolute w-full h-full" style={{ transform: `rotate(${tile.rotation}deg)`}}>
                  {tile.type === 'corner' && <div className={cn("absolute w-1/2 h-1/2 top-0 right-0 border-t-2 border-r-2 rounded-tr-md", isConnected ? "border-primary" : "border-muted-foreground")}></div>}
                  {tile.type === 'straight' && <div className={cn("absolute w-full h-px top-1/2 left-0 bg-muted-foreground", isConnected && "bg-primary")}></div>}
                  {tile.type === 't-junction' && <>
                    <div className={cn("absolute w-full h-px top-1/2 left-0", isConnected ? "bg-primary" : "bg-muted-foreground")}></div>
                    <div className={cn("absolute h-1/2 w-px top-0 left-1/2", isConnected ? "bg-primary" : "bg-muted-foreground")}></div>
                  </>}
                  {tile.type === 'cross' && <>
                    <div className={cn("absolute w-full h-px top-1/2 left-0", isConnected ? "bg-primary" : "bg-muted-foreground")}></div>
                    <div className={cn("absolute h-full w-px top-0 left-1/2", isConnected ? "bg-primary" : "bg-muted-foreground")}></div>
                  </>}
                </div>
                 {(tile.isSource || tile.isDestination) && 
                    <div className={cn(
                        "absolute inset-0 flex items-center justify-center rounded-sm text-foreground",
                        tile.isSource && (isSolved ? "bg-green-500/50" : "bg-primary/50"),
                        tile.isDestination && (isSolved ? "bg-green-500/50" : "bg-accent/50")
                    )}>
                        <Network className="w-6 h-6" />
                    </div>
                }
              </motion.button>
            )
          })
        )}
      </div>

      <Button
        onClick={resetLevel}
        size="lg"
        className="w-full max-w-sm mt-4"
      >
        <Shuffle className="mr-2" />
        New Puzzle
      </Button>
    </div>
  );
}
