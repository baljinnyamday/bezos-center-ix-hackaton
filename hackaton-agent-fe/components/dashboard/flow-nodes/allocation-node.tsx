import { Handle, Position } from "reactflow";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Package, Target } from "lucide-react";

interface AllocationNodeData {
  company: string;
  allocated: number;
  requested: number;
  percentage: number;
  priority: number;
}

interface AllocationNodeProps {
  data: AllocationNodeData;
}

export function AllocationNode({ data }: AllocationNodeProps) {
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return "default";
    if (percentage >= 70) return "secondary";
    return "destructive";
  };

  return (
    <Card className="w-48 shadow-lg border-2 border-orange-200 bg-orange-50">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Package className="h-4 w-4 text-orange-600" />
          <span className="font-semibold text-sm text-orange-900">{data.company}</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Allocated:</span>
            <span className="font-medium text-sm">
              {data.allocated}/{data.requested}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Fulfillment:</span>
              <span className={`font-medium text-sm ${getPercentageColor(data.percentage)}`}>{data.percentage}%</span>
            </div>
            <Progress value={data.percentage} className="h-2" />
          </div>

          <div className="flex justify-between items-center">
            <Badge variant={getBadgeVariant(data.percentage)} className="text-xs">
              Priority {data.priority}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              Allocated
            </div>
          </div>
        </div>
      </CardContent>

      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-orange-500 border-2 border-white" />
    </Card>
  );
}
