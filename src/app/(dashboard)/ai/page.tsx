"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Bot,
  Send,
  Loader2,
  User,
  RefreshCw,
  PackageSearch,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [restockSuggestions, setRestockSuggestions] = useState("");
  const [restockLoading, setRestockLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      } else {
        toast.error(data.error || "Failed to get response");
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const fetchRestockSuggestions = async () => {
    setRestockLoading(true);
    try {
      const res = await fetch("/api/ai/restock");
      const data = await res.json();
      setRestockSuggestions(data.suggestions);
    } catch {
      toast.error("Failed to get suggestions");
    } finally {
      setRestockLoading(false);
    }
  };

  const quickQuestions = [
    "What items are running low on stock?",
    "Give me a summary of the inventory",
    "Which categories have the most items?",
    "What's the total inventory value?",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Assistant</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Chat with AI about your inventory or get smart suggestions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Panel */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col h-[600px]">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <CardTitle>Inventory Chat</CardTitle>
              </div>
              <CardDescription>
                Ask questions about your inventory in natural language
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col p-0">
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Bot className="h-16 w-16 mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">
                      How can I help you?
                    </p>
                    <p className="text-sm text-center mb-6">
                      Ask me anything about your inventory
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                      {quickQuestions.map((q) => (
                        <button
                          key={q}
                          onClick={() => setInput(q)}
                          className="rounded-lg border border-gray-200 p-3 text-left text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        {msg.content}
                      </div>
                      {msg.role === "user" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="rounded-xl bg-gray-100 px-4 py-3 dark:bg-gray-800">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your inventory..."
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={loading || !input.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Restock Suggestions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PackageSearch className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-base">Restock Suggestions</CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchRestockSuggestions}
                  disabled={restockLoading}
                >
                  {restockLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {restockSuggestions ? (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                  {restockSuggestions}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Click refresh to get AI-powered restock suggestions based on
                  your current inventory levels.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-base">Try asking...</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "What items need restocking?",
                "Compare Electronics vs Office Supplies",
                "Which supplier has the most items?",
                "What's my profit margin by category?",
                "Summarize inventory health",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="flex w-full items-center gap-2 rounded-lg border border-gray-200 p-2 text-left text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                >
                  <Bot className="h-3 w-3 text-gray-400 shrink-0" />
                  {q}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
