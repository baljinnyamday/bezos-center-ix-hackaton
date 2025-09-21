import { Handle, Position } from "reactflow";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, TrendingUp } from "lucide-react";
import Image from "next/image";

interface AIDecisionNodeData {
  title: string;
  factors: string[];
  confidence: number;
  status: "processing" | "complete" | "idle";
}

interface AIDecisionNodeProps {
  data: AIDecisionNodeData;
}

export function AIDecisionNode({ data }: AIDecisionNodeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "complete":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Zap className="h-3 w-3 animate-pulse" />;
      case "complete":
        return <TrendingUp className="h-3 w-3" />;
      default:
        return <Brain className="h-3 w-3" />;
    }
  };

  return (
    <Card className="w-64 shadow-lg border-2 border-purple-200 bg-purple-50">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Image src="/ai.png" alt="AI" height={40} width={40} />
          <span className="font-semibold text-sm text-purple-900">{data.title}</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Confidence:</span>
            <span className="font-medium text-sm">{data.confidence}%</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Analyzing:</span>
            <div className="flex flex-wrap gap-1">
              {data.factors.map((factor, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {factor}
                </Badge>
              ))}
            </div>
          </div>

          <Badge className={`text-xs ${getStatusColor(data.status)} flex items-center gap-1`}>
            {getStatusIcon(data.status)}
            {data.status}
          </Badge>
        </div>
      </CardContent>

      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500 border-2 border-white" />
    </Card>
  );
}
