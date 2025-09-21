"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  MessageSquare,
  FileText,
  Database,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Bot,
  User,
} from "lucide-react";
import Image from "next/image";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  status: "uploading" | "processed" | "error";
  data?: any;
}

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  files?: UploadedFile[];
}

export function UserGuidance() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hello! I'm your AI operations assistant. I can help you analyze data, make decisions about production scheduling, inventory management, and supply chain optimization. How can I assist you today?",
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    },
  ]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mockAIResponses = [
    "Based on the data you've provided, I can see some interesting patterns in your operations. Let me analyze the key metrics and provide recommendations.",
    "I've processed your files and identified several optimization opportunities. Would you like me to focus on production efficiency or inventory management first?",
    "The demand forecast shows a 15% increase next quarter. I recommend adjusting your production schedule accordingly. Here are my specific suggestions:",
    "I notice some supply chain bottlenecks in your data. Let me break down the critical path issues and propose solutions.",
    "Your inventory turnover rates suggest we could optimize stock levels for items A, B, and C. Shall I create a detailed rebalancing plan?",
    "The production data indicates Line 2 has 8% higher efficiency than Line 1. We could redistribute workloads to maximize output.",
    "Weather patterns and seasonal trends suggest increasing raw material orders by 12% for next month to avoid potential shortages.",
    "I've identified cost-saving opportunities totaling approximately $47K monthly through better supplier negotiations and timing.",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];

    for (const file of Array.from(files)) {
      const newFile: UploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading",
      };

      newFiles.push(newFile);
      setUploadedFiles((prev) => [...prev, newFile]);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 15, 90));
      }, 150);

      // Simulate upload completion
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);

        setUploadedFiles((prev) => prev.map((f) => (f.name === file.name ? { ...f, status: "processed" } : f)));

        setTimeout(() => {
          setUploadProgress(0);
        }, 1000);
      }, 2000);
    }
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const generateAIResponse = (userMessage: string, hasFiles: boolean): string => {
    if (hasFiles) {
      return (
        "I've analyzed your uploaded files. " + mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)]
      );
    }

    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("production") || lowerMessage.includes("manufacturing")) {
      return "For production optimization, I recommend analyzing your current capacity utilization and identifying bottlenecks. Based on typical patterns, you could potentially increase efficiency by 12-18% through better scheduling.";
    }

    if (lowerMessage.includes("inventory") || lowerMessage.includes("stock")) {
      return "I can help optimize your inventory levels. The ideal approach is to balance carrying costs with stockout risks. Would you like me to analyze your current turnover rates and suggest reorder points?";
    }

    if (lowerMessage.includes("forecast") || lowerMessage.includes("demand")) {
      return "Demand forecasting is crucial for planning. I use machine learning models that consider historical patterns, seasonality, and external factors. Upload your historical sales data and I'll create accurate forecasts for the next 3-6 months.";
    }

    if (lowerMessage.includes("cost") || lowerMessage.includes("saving")) {
      return "I've identified several cost optimization opportunities: 1) Supplier negotiation timing, 2) Energy usage patterns, 3) Waste reduction strategies. Which area would you like to explore first?";
    }

    return mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
  };

  const sendMessage = async () => {
    if (!message.trim() && uploadedFiles.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: message.trim() || "Uploaded files for analysis",
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setUploadedFiles([]);
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateAIResponse(userMessage.content, !!userMessage.files?.length),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes("csv")) return <Database className="h-4 w-4" />;
    if (type.includes("json")) return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Calculate summary info for collapsed state
  const hasActiveFiles = uploadedFiles.length > 0;
  const hasMessage = message.trim().length > 0;
  const hasActivity = hasActiveFiles || hasMessage || isTyping;
  const unreadCount = messages.filter((m) => m.type === "ai").length > 1 ? 1 : 0;

  return (
    <Card
      className={`fixed top-0 right-0 shadow-lg transition-all duration-300 ease-in-out bg-background/95 backdrop-blur-sm z-[999] ${
        isCollapsed ? "w-full md:w-80 lg:w-96 h-16" : "w-full md:w-96 lg:w-[600px] h-full"
      }`}
    >
      <CardHeader
        className="cursor-pointer select-none hover:bg-muted/50 transition-colors duration-200 pb-3"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Image height={40} width={40} src={"/ai.png"} alt="ai" />

              {isTyping && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>

            <div>
              <div className="font-medium text-base">AI Operations Assistant</div>
              {!isCollapsed && (
                <div className="text-xs text-muted-foreground">{isTyping ? "Thinking..." : "Online"}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCollapsed && hasActivity && (
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Badge variant="default" className="text-xs h-5 w-5 p-0 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
                {hasActiveFiles && (
                  <Badge variant="secondary" className="text-xs">
                    {uploadedFiles.length} files
                  </Badge>
                )}
                {isTyping && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
              </div>
            )}
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
        }`}
      >
        <CardContent className="space-y-4 h-[calc(100vh-5rem)] flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pb-4 pt-24">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.type === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.type === "user" ? "bg-blue-500 text-white" : "bg-muted"
                  }`}
                >
                  {msg.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`flex-1 ${msg.type === "user" ? "text-right" : ""}`}>
                  <div
                    className={`inline-block max-w-[80%] p-3 rounded-lg ${
                      msg.type === "user" ? "bg-blue-500 text-white rounded-br-sm" : "bg-muted rounded-bl-sm"
                    }`}
                  >
                    <div className="text-sm">{msg.content}</div>
                    {msg.files && msg.files.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.files.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs opacity-90">
                            {getFileIcon(file.type)}
                            <span>{file.name}</span>
                            {getStatusIcon(file.status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-lg rounded-bl-sm p-3 max-w-[80%]">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* File Upload Section */}
          {uploadedFiles.length > 0 && (
            <div className="border-t pt-4 space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <div>
                      <div className="text-sm font-medium">{file.name}</div>
                      <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(file.status)}
                    <Button size="sm" variant="ghost" onClick={() => removeFile(file.name)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Input Area */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".csv,.json,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about production schedules, inventory optimization, demand forecasting..."
                  className="w-full resize-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                  rows={2}
                />
              </div>
              <Button
                onClick={sendMessage}
                disabled={(!message.trim() && uploadedFiles.length === 0) || isTyping}
                size="sm"
                className="flex-shrink-0"
              >
                {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">Press Enter to send • Shift+Enter for new line</div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
