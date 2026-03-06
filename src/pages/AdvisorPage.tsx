import { Brain, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const sampleMessages = [
  { role: "assistant" as const, content: "Hello! I'm your AI Business Advisor. I've analyzed your financial data and I'm ready to help. What would you like to know about your business?" },
  { role: "user" as const, content: "Can I afford to hire a new employee?" },
  { role: "assistant" as const, content: "Based on your current financials:\n\n• Monthly profit: R$ 43,220\n• Cash reserves: R$ 185,000\n• Average employee cost: ~R$ 6,500/month\n\n✅ **Yes, you can safely hire another employee.** Your profit margin can absorb the additional cost with a comfortable 36% buffer. I recommend starting with a part-time role to minimize risk." },
];

export default function AdvisorPage() {
  const [messages, setMessages] = useState(sampleMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm analyzing your request. In a production environment, this would connect to the AI Business Agent for personalized insights based on your financial data.",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="flex h-[calc(100vh)] flex-col">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">AI Business Advisor</h1>
            <p className="text-xs text-muted-foreground">Your personal CFO powered by AI</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about your business..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button variant="hero" size="icon" onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
