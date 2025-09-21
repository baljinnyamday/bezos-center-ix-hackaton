import { Handle, Position } from "reactflow";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Clock, AlertTriangle } from "lucide-react";

interface CompanyNodeData {
  name: string;
  demand: number;
  priority: "high" | "medium" | "low";
  status: "active" | "pending" | "completed";
  urgency: "urgent" | "normal" | "low";
}

interface CompanyNodeProps {
  data: CompanyNodeData;
}

export function CompanyNode({ data }: CompanyNodeProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    return urgency === "urgent" ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />;
  };

  return (
    <Card className="w-48 shadow-lg border-2 border-blue-200 bg-blue-50">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-4 w-4 text-blue-600" />
          <span className="font-semibold text-sm text-blue-900">{data.name}</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Demand:</span>
            <span className="font-medium text-sm">{data.demand} units</span>
          </div>

          <div className="flex justify-between items-center">
            <Badge className={`text-xs ${getPriorityColor(data.priority)}`}>{data.priority}</Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getUrgencyIcon(data.urgency)}
              {data.urgency}
            </div>
          </div>
        </div>
      </CardContent>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500 border-2 border-white" />
    </Card>
  );
}
