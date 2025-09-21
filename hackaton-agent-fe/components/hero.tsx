"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission
    console.log("Email submitted:", email);
    setEmail("");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with AI-themed pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url('/abstract-digital-neural-network-pattern-futuristic.jpg')`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 mb-8">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-card-foreground">{"AI Revolution Coming Soon"}</span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-balance mb-6">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {"Unlock the Future"}
          </span>
          <br />
          <span className="text-foreground">{"of AI"}</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-muted-foreground text-balance mb-12 max-w-2xl mx-auto leading-relaxed">
          {"Coming Soon – Be the first to experience innovation that will transform how you work, create, and think."}
        </p>

        {/* Email signup form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
          <Input
            type="email"
            placeholder="Stay informed. Enter your email."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 h-12 text-base bg-card border-border"
            required
          />
          <Button type="submit" className="h-12 px-8 bg-accent hover:bg-accent/90 text-accent-foreground font-medium">
            {"Notify Me"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        {/* Trust indicators */}
        <p className="text-sm text-muted-foreground">{"Join 10,000+ innovators already on the waitlist"}</p>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse delay-1000" />
    </section>
  );
}
