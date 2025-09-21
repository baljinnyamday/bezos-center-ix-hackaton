import { Handle, Position } from "reactflow";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Factory, Activity, Wrench } from "lucide-react";

interface ProductionNodeData {
  line: string;
  currentRate: number;
  targetRate: number;
  efficiency: number;
  status: "active" | "maintenance" | "offline";
}

interface ProductionNodeProps {
  data: ProductionNodeData;
}

export function ProductionNode({ data }: ProductionNodeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Activity className="h-3 w-3" />;
      case "maintenance":
        return <Wrench className="h-3 w-3" />;
      default:
        return <Factory className="h-3 w-3" />;
    }
  };

  return (
    <Card className="w-52 shadow-lg border-2 border-green-200 bg-green-50">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Factory className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-sm text-green-900">{data.line}</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Rate:</span>
            <span className="font-medium text-sm">
              {data.currentRate}/{data.targetRate} u/h
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Efficiency:</span>
              <span className="font-medium text-sm">{data.efficiency}%</span>
            </div>
            <Progress value={data.efficiency} className="h-2" />
          </div>

          <Badge className={`text-xs ${getStatusColor(data.status)} flex items-center gap-1`}>
            {getStatusIcon(data.status)}
            {data.status}
          </Badge>
        </div>
      </CardContent>

      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-green-500 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-500 border-2 border-white" />
    </Card>
  );
}
