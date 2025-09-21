"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, Cloud, TrendingUp, Newspaper, MapPin, Thermometer } from "lucide-react";
import toast from "react-hot-toast";
// import { toast } from "@/hooks/use-toast"

interface DataPreference {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: React.ComponentType<{ className?: string }>;
  category: "external" | "internal" | "ai";
}

interface AISettings {
  useWeatherData: boolean;
  useMarketData: boolean;
  useNewsData: boolean;
  useTradingData: boolean;
  customInstructions: string;
  riskTolerance: "low" | "medium" | "high";
  decisionFrequency: number; // minutes
}

export function DataPreferences() {
  const [preferences, setPreferences] = useState<DataPreference[]>([
    {
      id: "weather",
      name: "Weather Data",
      description: "Use weather forecasts to optimize supply chain decisions",
      enabled: true,
      icon: Thermometer,
      category: "external",
    },
    {
      id: "market",
      name: "Market Data",
      description: "Incorporate market trends and commodity prices",
      enabled: true,
      icon: TrendingUp,
      category: "external",
    },
    {
      id: "news",
      name: "News Sentiment",
      description: "Analyze news sentiment for supply chain disruptions",
      enabled: false,
      icon: Newspaper,
      category: "external",
    },
    {
      id: "location",
      name: "Location Data",
      description: "Use company locations for logistics optimization",
      enabled: true,
      icon: MapPin,
      category: "internal",
    },
  ]);

  const [aiSettings, setAiSettings] = useState<AISettings>({
    useWeatherData: true,
    useMarketData: true,
    useNewsData: false,
    useTradingData: true,
    customInstructions: "",
    riskTolerance: "medium",
    decisionFrequency: 30,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch("/api/settings/preferences");
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) setPreferences(data.preferences);
        if (data.aiSettings) setAiSettings(data.aiSettings);
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
  };

  const handlePreferenceToggle = (id: string) => {
    setPreferences((prev) => prev.map((pref) => (pref.id === id ? { ...pref, enabled: !pref.enabled } : pref)));
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/settings/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences, aiSettings }),
      });

      if (response.ok) {
        toast.success("Settings Saved");
      }
    } catch (error) {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const groupedPreferences = preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) acc[pref.category] = [];
    acc[pref.category].push(pref);
    return acc;
  }, {} as Record<string, DataPreference[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Data Sources
          </CardTitle>
          <CardDescription>Configure which data sources the AI can use for decision making</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(groupedPreferences).map(([category, prefs]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {category} Data
                </Badge>
              </div>
              <div className="grid gap-4">
                {prefs.map((pref) => (
                  <div key={pref.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <pref.icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor={pref.id} className="font-medium">
                          {pref.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">{pref.description}</p>
                      </div>
                    </div>
                    <Switch
                      id={pref.id}
                      checked={pref.enabled}
                      onCheckedChange={() => handlePreferenceToggle(pref.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Decision Settings</CardTitle>
          <CardDescription>Configure how the AI makes decisions and processes data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="risk-tolerance">Risk Tolerance</Label>
              <select
                id="risk-tolerance"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                value={aiSettings.riskTolerance}
                onChange={(e) =>
                  setAiSettings((prev) => ({
                    ...prev,
                    riskTolerance: e.target.value as AISettings["riskTolerance"],
                  }))
                }
              >
                <option value="low">Low - Conservative decisions</option>
                <option value="medium">Medium - Balanced approach</option>
                <option value="high">High - Aggressive optimization</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="decision-frequency">Decision Frequency (minutes)</Label>
              <Input
                id="decision-frequency"
                type="number"
                min="5"
                max="1440"
                value={aiSettings.decisionFrequency}
                onChange={(e) =>
                  setAiSettings((prev) => ({
                    ...prev,
                    decisionFrequency: Number.parseInt(e.target.value) || 30,
                  }))
                }
              />
              <p className="text-sm text-muted-foreground">
                How often the AI should make new decisions (5-1440 minutes)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-instructions">Custom AI Instructions</Label>
              <Textarea
                id="custom-instructions"
                placeholder="Provide specific instructions for the AI decision engine..."
                value={aiSettings.customInstructions}
                onChange={(e) =>
                  setAiSettings((prev) => ({
                    ...prev,
                    customInstructions: e.target.value,
                  }))
                }
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Give the AI specific guidance about your business priorities and constraints
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSavePreferences} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
