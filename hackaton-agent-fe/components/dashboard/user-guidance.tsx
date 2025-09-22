"use client";

import type React from "react";
import ReactMarkdown from "react-markdown";

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
import { useChat } from "ai/react";
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
  const [messages, setMessages] = useState([
    {
      type: "ai",
      content: `Hello! I'm your AI operations assistant. I can help you analyze data, make decisions about production scheduling, inventory management, and supply chain optimization. How can I assist you today?`,
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    },
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const startStream = async () => {
    setText("");
    setLoading(true);

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/stream/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: message,
      }),
    });
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) return;
    let tempText = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      setText((prev) => prev + chunk);
      tempText += chunk;
    }

    setMessages((prev) => [...prev, { type: "ai", content: tempText, timestamp: new Date() }]);
    setText("");
    setLoading(false);
  };

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const sendMessage = async () => {
    if (!message.trim() && uploadedFiles.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: message.trim() || "Uploaded files for analysis",
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
    };

    setMessage("");
    setUploadedFiles([]);
    setIsTyping(true);
    setMessages((prev) => [...prev, userMessage]);
    startStream();
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
  const unreadCount = 3;

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
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-3 ${msg.type === "user" ? "flex-row-reverse" : ""}`}>
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
                    <div className="text-sm">
                      <ReactMarkdown className="prose lg:prose" children={msg.content} />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            ))}
            {text && (
              <div className={`flex gap-3`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted`}>
                  <Bot className="h-4 w-4" />
                </div>
                <div className={`flex-1`}>
                  <div className={`inline-block max-w-[80%] p-3 rounded-lg bg-muted rounded-bl-sm`}>
                    <div className="text-sm">
                      <ReactMarkdown className="prose lg:prose" children={text} />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{formatTime(new Date())}</div>
                </div>
              </div>
            )}

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
