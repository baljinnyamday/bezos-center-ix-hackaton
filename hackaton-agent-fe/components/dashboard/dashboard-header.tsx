import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, AlertTriangle, TrendingUp, Zap } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Command Center</h1>
          <p className="text-muted-foreground text-pretty">
            Real-time production optimization powered by artificial intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" />
            Live Data
          </Badge>
          <Button size="sm">
            <Zap className="h-4 w-4 mr-1" />
            AI Optimize
          </Button>
        </div>
      </div>

      {/* System Status Bar */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4 py-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">System Operational</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Overall Efficiency: 94.2%</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>2 Alerts Pending</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
