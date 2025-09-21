"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";

const iconBox = {
  optimization: TrendingUp,
  alert: AlertTriangle,
  recommendation: Lightbulb,
};

const staticInsights = [
  {
    type: "optimization",
    title: "Production Reallocation",
    description: "Shift 15% capacity from Line B to Line C to meet Company A urgent deadline",
    confidence: 94,
    impact: "High",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    type: "alert",
    title: "Weather Impact",
    description: "Incoming storm may delay shipments by 2-3 days. Consider expedited logistics",
    confidence: 87,
    impact: "Medium",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    type: "recommendation",
    title: "Market Opportunity",
    description: "Raw material prices dropped 8%. Increase inventory for next quarter",
    confidence: 91,
    impact: "High",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    type: "recommendation",
    title: "Market Opportunity",
    description: "Raw material prices dropped 8%. Increase inventory for next quarter",
    confidence: 91,
    impact: "High",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
];

export function AIInsights() {
  const [insights, setInsights] = useState(staticInsights);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const generateNewInsights = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        // Parse AI insights and update state
        setLastGenerated(data.insights);
        // For demo, we'll keep static insights but show AI-generated text
      }
    } catch (error) {
      console.error("Failed to generate insights:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const makeAIDecision = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const decision = await response.json();
        console.log("AI Decision:", decision);
        // Update UI with decision results
      }
    } catch (error) {
      console.error("Failed to make AI decision:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const makeEnhancedAIDecision = async () => {
    // Added enhanced AI decision function
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/enhanced-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const decision = await response.json();
        console.log("Enhanced AI Decision:", decision);

        // Show user guidance influence in UI
        if (decision.userGuidanceContext?.guidanceCount > 0) {
          setLastGenerated(
            `Enhanced decision incorporating ${decision.userGuidanceContext.guidanceCount} user guidance entries and ${decision.userGuidanceContext.uploadedFilesCount} uploaded files. Confidence: ${decision.confidence}%`
          );
        }
      }
    } catch (error) {
      console.error("Failed to make enhanced AI decision:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffecd2, #fcb69f, #a8edea, #fed6e3, #d299c2, #fef9d3, #dee2ff, #b8cdf8);",

        padding: "4px",
        borderRadius: "16px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
      className="rounded-lg"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image src="/ai.png" alt="AI Icon" width={50} height={50} />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = iconBox[insight.type as keyof typeof iconBox] || Lightbulb;
            return (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${insight.bgColor}`}>
                      <Icon className={`h-4 w-4 ${insight.color}`} />
                    </div>
                    <div>
                      <div className="font-medium">{insight.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{insight.description}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {insight.confidence}% Confidence
                    </Badge>
                    <Badge variant={insight.impact === "High" ? "default" : "secondary"} className="text-xs">
                      {insight.impact} Impact
                    </Badge>
                  </div>
                  <Button size="sm" variant="ghost" className="gap-1" onClick={makeAIDecision}>
                    Apply
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}

          {lastGenerated && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-2">Latest AI Analysis:</div>
              <div className="text-sm text-muted-foreground">{lastGenerated}</div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1 bg-transparent"
              variant="outline"
              onClick={generateNewInsights}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
              Generate New Insights
            </Button>
            <Button variant="default" onClick={makeEnhancedAIDecision} disabled={isGenerating}>
              {" "}
              {/* Updated to use enhanced decision */}
              AI Optimize+
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
