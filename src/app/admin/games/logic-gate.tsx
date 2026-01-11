
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Cpu, Shuffle, Lightbulb, LightbulbOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type GateType = 'AND' | 'OR' | 'NOT' | 'XOR';
type Node = {
  type: 'INPUT' | 'GATE';
  id: string;
  value: boolean;
  gateType?: GateType;
  inputs?: string[];
};

type Level = {
  nodes: Record<string, Node>;
  outputNodeId: string;
};

const evaluateCircuit = (nodes: Record<string, Node>, nodeId: string): boolean => {
  const node = nodes[nodeId];
  if (node.type === 'INPUT') {
    return node.value;
  }

  if (node.type === 'GATE' && node.inputs) {
    const inputValues = node.inputs.map(inputId => evaluateCircuit(nodes, inputId));
    switch (node.gateType) {
      case 'AND':
        return inputValues.every(v => v);
      case 'OR':
        return inputValues.some(v => v);
      case 'NOT':
        return !inputValues[0];
      case 'XOR':
        return inputValues.reduce((a, b) => a !== b);
      default:
        return false;
    }
  }
  return false;
};

const generateLevel = (): Level => {
  const inputA: Node = { type: 'INPUT', id: 'A', value: false };
  const inputB: Node = { type: 'INPUT', id: 'B', value: false };
  const inputC: Node = { type: 'INPUT', id: 'C', value: false };

  const gate1: Node = { type: 'GATE', id: 'G1', value: false, gateType: 'AND', inputs: ['A', 'B'] };
  const gate2: Node = { type: 'GATE', id: 'G2', value: false, gateType: 'NOT', inputs: ['C'] };
  const gate3: Node = { type: 'GATE', id: 'G3', value: false, gateType: 'OR', inputs: ['G1', 'G2'] };

  return {
    nodes: { A: inputA, B: inputB, C: inputC, G1: gate1, G2: gate2, G3: gate3 },
    outputNodeId: 'G3',
  };
};


const Gate = ({ type, isPowered }: { type: GateType, isPowered: boolean }) => (
    <div className={cn(
        "w-20 h-14 rounded-md border-2 flex items-center justify-center font-code text-sm font-bold transition-all",
        isPowered ? "bg-primary/20 border-primary text-primary" : "bg-muted/30 border-muted text-muted-foreground"
    )}>
        {type}
    </div>
);


export default function LogicGateGame() {
  const [level, setLevel] = useState<Level>(generateLevel());
  const [isSolved, setIsSolved] = useState(false);

  const handleInputChange = (inputId: string, value: boolean) => {
    const newNodes = {
      ...level.nodes,
      [inputId]: { ...level.nodes[inputId], value },
    };
    setLevel({ ...level, nodes: newNodes });
  };
  
  const resetLevel = useCallback(() => {
    setLevel(generateLevel());
    setIsSolved(false);
  }, []);

  const evaluatedNodes = useMemo(() => {
    const newEvaluated: Record<string, boolean> = {};
    Object.keys(level.nodes).forEach(nodeId => {
      newEvaluated[nodeId] = evaluateCircuit(level.nodes, nodeId);
    });
     if (newEvaluated[level.outputNodeId]) {
        setIsSolved(true);
    } else {
        setIsSolved(false);
    }
    return newEvaluated;
  }, [level]);


  return (
    <div className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-4 text-center font-code w-full max-w-md">
            <AnimatePresence mode="wait">
            <motion.div
                key={isSolved ? "solved" : "unsolved"}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={cn("rounded-md px-4 py-2 flex-1 flex items-center justify-center gap-3 transition-colors", isSolved ? "bg-green-500/20" : "bg-muted/30")}>
                {isSolved ? <Lightbulb className="text-green-400" /> : <LightbulbOff className="text-muted-foreground" />}
                <p className={cn("text-2xl font-bold", isSolved ? "text-green-400" : "text-primary")}>
                    {isSolved ? "Circuit Complete" : "Output: OFF"}
                </p>
            </motion.div>
            </AnimatePresence>
      </div>

      <div className="w-full max-w-md space-y-8 p-4 bg-muted/20 rounded-lg">
        {/* Inputs */}
        <div className="flex justify-around">
          {Object.values(level.nodes).filter(n => n.type === 'INPUT').map(input => (
            <div key={input.id} className="flex flex-col items-center gap-2">
              <label htmlFor={input.id} className="font-code text-muted-foreground">INPUT {input.id}</label>
              <Switch
                id={input.id}
                checked={input.value}
                onCheckedChange={(checked) => handleInputChange(input.id, checked)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          ))}
        </div>

        {/* Circuit Diagram (simplified) */}
        <div className="relative h-48 flex flex-col justify-around items-center">
            {/* Wires */}
            <div className="absolute top-8 left-1/4 w-1/2 h-px bg-muted-foreground" />
            <div className="absolute top-8 left-1/4 w-px h-10 bg-muted-foreground" />
            <div className="absolute top-8 right-1/4 w-px h-10 bg-muted-foreground" />

            <div className="absolute top-1/2 left-1/4 w-1/4 h-px bg-muted-foreground" />
            <div className="absolute top-1/2 right-1/4 w-1/4 h-px bg-muted-foreground" />

            <div className="absolute top-1/2 left-1/2 w-px h-12 bg-muted-foreground" />

            {/* Gates */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2">
                <Gate type="AND" isPowered={evaluatedNodes['G1']} />
            </div>
             <div className="absolute top-20 right-8">
                <Gate type="NOT" isPowered={evaluatedNodes['G2']} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                <Gate type="OR" isPowered={evaluatedNodes['G3']} />
            </div>
        </div>
      </div>

      <Button onClick={resetLevel} size="lg" className="w-full max-w-md">
        <Shuffle className="mr-2" />
        New Circuit
      </Button>
    </div>
  );
}
