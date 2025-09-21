"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Cloud, TrendingUp, Newspaper, DollarSign } from "lucide-react";

const marketData = [
  { time: "00:00", price: 100, sentiment: 0.6 },
  { time: "04:00", price: 102, sentiment: 0.7 },
  { time: "08:00", price: 98, sentiment: 0.4 },
  { time: "12:00", price: 105, sentiment: 0.8 },
  { time: "16:00", price: 103, sentiment: 0.6 },
  { time: "20:00", price: 107, sentiment: 0.9 },
];

const factors = [
  {
    type: "Weather",
    status: "Chilly day, rain expected",
    impact: "Medium",
    value: "+13C 72% chance rain",
    icon: Cloud,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    type: "Market",
    status: "Favorable",
    impact: "High",
    value: "+5.2% today",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    type: "News",
    status: "Positive",
    impact: "Low",
    value: "0.8 sentiment",
    icon: Newspaper,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    type: "Trading",
    status: "Volatile",
    impact: "Medium",
    value: "$107/unit",
    icon: DollarSign,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
];

export function ExternalFactors() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          External Factors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex flex-row gap-x-6">
        {/* Factor Status */}
        <div className="grid gap-3">
          {factors.map((factor) => {
            const Icon = factor.icon;
            return (
              <div key={factor.type} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${factor.bgColor}`}>
                    <Icon className={`h-4 w-4 ${factor.color}`} />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{factor.type}</div>
                    <div className="text-xs text-muted-foreground">{factor.status}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{factor.value}</div>
                  <Badge
                    variant={
                      factor.impact === "High" ? "default" : factor.impact === "Medium" ? "secondary" : "outline"
                    }
                    className="text-xs"
                  >
                    {factor.impact}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Market Trend Chart */}
        <div className="flex-1">
          <div className="text-sm font-medium mb-2">Market Price Trend (24h)</div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marketData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "price" ? `$${value}` : value,
                    name === "price" ? "Price" : "Sentiment",
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
