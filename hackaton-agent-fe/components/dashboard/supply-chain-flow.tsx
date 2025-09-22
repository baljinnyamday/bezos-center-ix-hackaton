"use client";

import { useCallback, useState } from "react";
import ReactFlow, {
  type Node,
  type Edge,
  addEdge,
  type Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, Play, Pause, RotateCcw } from "lucide-react";

// Custom node components
import { CompanyNode } from "./flow-nodes/company-node";
import { ProductionNode } from "./flow-nodes/production-node";
import { AllocationNode } from "./flow-nodes/allocation-node";
import { AIDecisionNode } from "./flow-nodes/ai-decision-node";

const nodeTypes: NodeTypes = {
  company: CompanyNode,
  production: ProductionNode,
  allocation: AllocationNode,
  aiDecision: AIDecisionNode,
};

const initialNodes: Node[] = [
  // Brewery demand nodes
  {
    id: "company-riverside",
    type: "company",
    position: { x: 50, y: 40 },
    data: {
      name: "Barley & Hops Co.",
      demand: 520,
      priority: "SUPPLIER",
      status: "active",
      urgency: "urgent",
    },
  },
  {
    id: "company-goldenhop",
    type: "company",
    position: { x: 0, y: 250 },
    data: {
      name: "Barley master Ltd.",
      demand: 780,
      priority: "SUPPLIER",
      status: "active",
      urgency: "normal",
    },
  },
  {
    id: "company-ambervale",
    type: "company",
    position: { x: 50, y: 450 },
    data: {
      name: "Wheat & Malt Inc.",
      demand: 310,
      priority: "SUPPLIER",
      status: "active",
      urgency: "urgent",
    },
  },

  // AI Decision Engine
  {
    id: "ai-engine",
    type: "aiDecision",
    position: { x: 350, y: 250 },
    data: {
      title: "Beer Factory / AI engine",
      factors: ["Weather", "Market", "Grain Stocks", "Demand Trends"],
      confidence: 94,
      status: "processing",
    },
  },

  // Production lines
  {
    id: "production-a",
    type: "production",
    position: { x: 650, y: 40 },
    data: {
      line: "Line A - Premium",
      currentRate: 46.5,
      targetRate: 50.0,
      efficiency: 92.0,
      status: "active",
    },
  },
  {
    id: "production-b",
    type: "production",
    position: { x: 720, y: 250 },
    data: {
      line: "Line B - Standard",
      currentRate: 79.0,
      targetRate: 80.0,
      efficiency: 98.0,
      status: "active",
    },
  },
  {
    id: "production-c",
    type: "production",
    position: { x: 650, y: 450 },
    data: {
      line: "Line C - Craft",
      currentRate: 26.0,
      targetRate: 30.0,
      efficiency: 87.0,
      status: "maintenance",
    },
  },

  // Allocation nodes
  {
    id: "allocation-riverside",
    type: "allocation",
    position: { x: 1050, y: 70 },
    data: {
      company: "RiverSide Brewers",
      allocated: 500,
      requested: 520,
      percentage: 96,
      priority: 1,
    },
  },
  {
    id: "allocation-goldenhop",
    type: "allocation",
    position: { x: 1100, y: 300 },
    data: {
      company: "NISKUS LLC",
      allocated: 650,
      requested: 780,
      percentage: 83,
      priority: 1,
    },
  },
  {
    id: "allocation-ambervale",
    type: "allocation",
    position: { x: 1050, y: 520 },
    data: {
      company: "Happy Cow Farms",
      allocated: 250,
      requested: 310,
      percentage: 81,
      priority: 4,
    },
  },
];

const initialEdges: Edge[] = [
  // Company demands to AI engine
  { id: "e1", source: "company-riverside", target: "ai-engine", animated: true, style: { stroke: "#3b82f6" } },
  { id: "e2", source: "company-goldenhop", target: "ai-engine", animated: true, style: { stroke: "#10b981" } },
  { id: "e3", source: "company-ambervale", target: "ai-engine", animated: true, style: { stroke: "#f59e0b" } },

  // AI engine to production lines
  { id: "e4", source: "ai-engine", target: "production-a", animated: true, style: { stroke: "#8b5cf6" } },
  { id: "e5", source: "ai-engine", target: "production-b", animated: true, style: { stroke: "#8b5cf6" } },
  { id: "e6", source: "ai-engine", target: "production-c", animated: true, style: { stroke: "#8b5cf6" } },

  // Production to allocations
  { id: "e7", source: "production-a", target: "allocation-riverside", animated: true, style: { stroke: "#06b6d4" } },
  { id: "e8", source: "production-b", target: "allocation-goldenhop", animated: true, style: { stroke: "#06b6d4" } },
  { id: "e9", source: "production-c", target: "allocation-ambervale", animated: true, style: { stroke: "#06b6d4" } },

  // Cross-allocations (AI optimizations)
  {
    id: "e10",
    source: "production-b",
    target: "allocation-riverside",
    animated: true,
    style: { stroke: "#ef4444", strokeDasharray: "5,5" },
  },
  {
    id: "e11",
    source: "production-a",
    target: "allocation-ambervale",
    animated: true,
    style: { stroke: "#ef4444", strokeDasharray: "5,5" },
  },
];

export function SupplyChainFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isAnimated, setIsAnimated] = useState(true);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const toggleAnimation = () => {
    setIsAnimated(!isAnimated);
    setEdges((eds) => eds.map((edge) => ({ ...edge, animated: !isAnimated })));
  };

  const resetFlow = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setIsAnimated(true);
  };

  return (
    <Card className="h-[750px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Real time supply chain monitoring
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              Real-time AI
            </Badge>
            <Button size="sm" variant="outline" onClick={toggleAnimation}>
              {isAnimated ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={resetFlow}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
        >
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case "company":
                  return "#3b82f6";
                case "production":
                  return "#10b981";
                case "allocation":
                  return "#f59e0b";
                case "aiDecision":
                  return "#8b5cf6";
                default:
                  return "#6b7280";
              }
            }}
            className="bg-background border border-border"
          />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </CardContent>
    </Card>
  );
}
