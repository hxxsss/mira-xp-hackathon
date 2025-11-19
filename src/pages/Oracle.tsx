import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, Send, ArrowLeft, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  verdict?: {
    verdict: "approved" | "warning" | "denied";
    delay_months: number;
    reasoning: string;
    advice?: string;
    summary: string;
  };
}

interface UserContext {
  name: string;
  goalTitle: string;
  goalAmount: string;
  currentAmount: string;
  incomeType: string;
  monthlySavings: string;
}

const Oracle = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserContext();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const loadUserContext = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }

      // Load profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // Load active goal
      const { data: goal } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (profile && goal) {
        setUserContext({
          name: profile.name,
          goalTitle: goal.title,
          goalAmount: goal.total_amount.toString(),
          currentAmount: goal.current_amount.toString(),
          incomeType: profile.income_type,
          monthlySavings: "100", // This could be calculated from transaction history
        });

        // Add welcome message
        setMessages([
          {
            role: "assistant",
            content: `Hey ${profile.name}! 👋 I'm The Oracle, your financial buddy. I'm here to help you make smart money decisions while you save for your ${goal.title}!\n\nWhat are you thinking about buying today?`,
          },
        ]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim() || !userContext) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oracle-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            userContext,
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response from Oracle");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim() || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg?.role === "assistant") {
                  lastMsg.content = assistantMessage;
                } else {
                  newMessages.push({
                    role: "assistant",
                    content: assistantMessage,
                  });
                }
                return newMessages;
              });
            }
          } catch (e) {
            console.error("Failed to parse chunk:", e);
          }
        }
      }

      // Try to extract verdict from the response
      try {
        const verdictMatch = assistantMessage.match(/\{[\s\S]*"verdict"[\s\S]*\}/);
        if (verdictMatch) {
          const verdict = JSON.parse(verdictMatch[0]);
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg?.role === "assistant") {
              lastMsg.verdict = verdict;
            }
            return newMessages;
          });
        }
      } catch (e) {
        console.log("No verdict found in response");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="rounded-2xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">The Oracle</h1>
                <p className="text-sm text-muted-foreground">Your AI Financial Buddy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto container mx-auto px-4 py-6"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "glass-card"
                  } rounded-3xl px-6 py-4`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.verdict && <VerdictCard verdict={message.verdict} />}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="glass-card rounded-3xl px-6 py-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 glass-card border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 rounded-3xl px-6 py-6 text-base"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="lg"
              className="rounded-3xl px-6 gradient-primary hover:opacity-90 transition-opacity"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const VerdictCard = ({
  verdict,
}: {
  verdict: {
    verdict: "approved" | "warning" | "denied";
    delay_months: number;
    reasoning: string;
    advice?: string;
    summary: string;
  };
}) => {
  const getVerdictStyle = () => {
    switch (verdict.verdict) {
      case "approved":
        return {
          bg: "bg-success/10",
          border: "border-success",
          icon: <CheckCircle className="w-6 h-6 text-success" />,
          title: "✅ Approved",
        };
      case "warning":
        return {
          bg: "bg-accent/10",
          border: "border-accent",
          icon: <AlertTriangle className="w-6 h-6 text-accent" />,
          title: "⚠️ Warning",
        };
      case "denied":
        return {
          bg: "bg-destructive/10",
          border: "border-destructive",
          icon: <XCircle className="w-6 h-6 text-destructive" />,
          title: "🚫 Not Recommended",
        };
    }
  };

  const style = getVerdictStyle();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`mt-4 p-4 rounded-2xl border-2 ${style.bg} ${style.border}`}
    >
      <div className="flex items-start gap-3 mb-3">
        {style.icon}
        <div>
          <h3 className="font-bold text-lg">{style.title}</h3>
          {verdict.delay_months > 0 && (
            <p className="text-sm text-muted-foreground">
              Delays goal by ~{verdict.delay_months} month{verdict.delay_months !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
      <p className="text-sm mb-2">{verdict.reasoning}</p>
      {verdict.advice && (
        <p className="text-sm font-medium mt-2">💡 {verdict.advice}</p>
      )}
      <p className="text-sm font-semibold mt-3 pt-3 border-t border-border">
        {verdict.summary}
      </p>
    </motion.div>
  );
};

export default Oracle;
