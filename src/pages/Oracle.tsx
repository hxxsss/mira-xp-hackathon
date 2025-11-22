import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, ArrowLeft, CheckCircle, AlertTriangle, XCircle, History, Clock, TrendingDown, Brain, DollarSign } from "lucide-react";
import oracleBallImage from "@/assets/oracle-ball.png";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
interface Message {
  role: "user" | "assistant";
  content: string;
  isAnalysis?: boolean;
  verdict?: {
    verdict: "approved" | "warning" | "denied";
    delay_months: number;
    reasoning: string;
    advice?: string;
    summary: string;
    math_summary?: string;
  };
  servitude?: {
    item_name: string;
    item_price: number;
    hours: number;
    impact_message: string;
  };
  marketing_triggers?: {
    triggers: string[];
    warning: string;
  };
  rule72h?: {
    is_survival_item: boolean;
    should_wait: boolean;
    reasoning: string;
  };
  stranger_test?: {
    item_name: string;
    item_price: number;
    test_question: string;
  };
  crisis_protocol?: {
    priority_list: string[];
    debt_strategy: string;
    tactical_advice: string;
  };
  halt_assessment?: {
    halt_status: {
      hungry: boolean;
      angry: boolean;
      lonely: boolean;
      tired: boolean;
    };
    recommendation: string;
  };
}
interface UserContext {
  name: string;
  goalTitle: string;
  goalAmount: string;
  currentAmount: string;
  incomeType: string;
  monthlySavings: string;
  goalId: string;
  targetDate?: string;
}
const Oracle = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string;
    created_at: string;
    history: Message[];
  }>>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    loadUserContext();
    loadChatHistory();
    createNewSession();
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  useEffect(() => {
    if (currentSessionId && messages.length > 1) {
      saveCurrentSession();
    }
  }, [messages, currentSessionId]);
  const loadUserContext = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }

      // Load profile
      const {
        data: profile
      } = await supabase.from("profiles").select("*").eq("id", user.id).single();

      // Load active goal
      const {
        data: goal
      } = await supabase.from("goals").select("*").eq("user_id", user.id).eq("is_active", true).order("created_at", {
        ascending: false
      }).limit(1).single();
      if (profile && goal) {
        setUserContext({
          name: profile.name,
          goalTitle: goal.title,
          goalAmount: goal.total_amount.toString(),
          currentAmount: goal.current_amount.toString(),
          incomeType: profile.income_type,
          monthlySavings: "100",
          // This could be calculated from transaction history
          goalId: goal.id,
          targetDate: goal.target_date
        });

        // Add welcome message
        setMessages([{
          role: "assistant",
          content: `Oi ${profile.name}! 👋 Eu sou O Oráculo, seu amigo financeiro. Estou aqui para ajudar você a tomar decisões inteligentes de dinheiro enquanto economiza para seu ${goal.title}!\n\nO que você está pensando em comprar hoje?`
        }]);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };
  const createNewSession = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const {
        data,
        error
      } = await supabase.from("chat_sessions").insert({
        user_id: user.id,
        history: [] as any
      }).select().single();
      if (error) throw error;
      setCurrentSessionId(data.id);
    } catch (error: any) {
      console.error("Error creating session:", error);
    }
  };
  const saveCurrentSession = async () => {
    if (!currentSessionId) return;
    try {
      await supabase.from("chat_sessions").update({
        history: messages as any,
        updated_at: new Date().toISOString()
      }).eq("id", currentSessionId);
    } catch (error: any) {
      console.error("Error saving session:", error);
    }
  };
  const loadChatHistory = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const {
        data,
        error
      } = await supabase.from("chat_sessions").select("*").eq("user_id", user.id).order("created_at", {
        ascending: false
      }).limit(20);
      if (error) throw error;
      setChatHistory((data || []).map(session => ({
        ...session,
        history: session.history as any as Message[]
      })));
    } catch (error: any) {
      console.error("Error loading history:", error);
    }
  };
  const loadHistoricalSession = (session: any) => {
    setMessages(session.history || []);
    setCurrentSessionId(session.id);
    setIsHistoryOpen(false);
  };
  const startNewChat = () => {
    setMessages([{
      role: "assistant",
      content: `Oi ${userContext?.name}! 👋 Eu sou O Oráculo, seu amigo financeiro. Estou aqui para ajudar você a tomar decisões inteligentes de dinheiro enquanto economiza para seu ${userContext?.goalTitle}!\n\nO que você está pensando em comprar hoje?`
    }]);
    createNewSession();
    setIsHistoryOpen(false);
  };
  const sendMessage = async () => {
    if (!input.trim() || !userContext) return;
    const userMessage: Message = {
      role: "user",
      content: input.trim()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsTyping(true);

    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      setIsLoading(false);
      setIsTyping(false);
      toast({
        title: "Timeout",
        description: "A resposta demorou muito. Tente novamente.",
        variant: "destructive"
      });
    }, 30000);

    try {
      // Get current session token
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oracle-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });
      if (!response.ok || !response.body) {
        throw new Error("Failed to get response from Oracle");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let buffer = "";
      let toolCallBuffer = "";
      let isCollectingToolCall = false;
      let hasToolCall = false;
      let currentToolName = "";  // Track tool name from the start

      // Add initial 1.5s delay before first message appears
      await new Promise(resolve => setTimeout(resolve, 1500));
      while (true) {
        const {
          done,
          value
        } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, {
          stream: true
        });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim() || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);

            // Handle tool calls first to detect if we should stop content streaming
            const toolCalls = parsed.choices?.[0]?.delta?.tool_calls;
            if (toolCalls && toolCalls[0]) {
              hasToolCall = true;

              // Capture tool name when first detected
              if (toolCalls[0].function?.name && !currentToolName) {
                currentToolName = toolCalls[0].function.name;
              }

              // Remove any previously streamed assistant message to prevent duplication
              if (!isCollectingToolCall) {
                setMessages(prev => {
                  const lastMsg = prev[prev.length - 1];
                  if (lastMsg?.role === "assistant" && !lastMsg.isAnalysis && !lastMsg.verdict) {
                    return prev.slice(0, -1);
                  }
                  return prev;
                });
              }
              const toolCall = toolCalls[0];
              if (toolCall.function?.arguments) {
                isCollectingToolCall = true;
                toolCallBuffer += toolCall.function.arguments;
              }
            }

            // Handle regular content - but only if no tool call is being processed
            const content = parsed.choices?.[0]?.delta?.content;
            if (content && !hasToolCall) {
              assistantMessage += content;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg?.role === "assistant" && !lastMsg.isAnalysis) {
                  lastMsg.content = assistantMessage;
                } else if (!lastMsg?.isAnalysis) {
                  newMessages.push({
                    role: "assistant",
                    content: assistantMessage
                  });
                }
                return newMessages;
              });
            }

            // Check if tool call is complete
            if (parsed.choices?.[0]?.finish_reason === "tool_calls" && isCollectingToolCall) {
              try {
                const verdictData = JSON.parse(toolCallBuffer);

                // Use the captured tool name
                const toolName = currentToolName || 'provide_verdict';
                
                if (toolName === 'calculate_servitude') {
                  setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "",
                    servitude: {
                      item_name: verdictData.item_name,
                      item_price: verdictData.item_price,
                      hours: verdictData.servitude_hours,
                      impact_message: verdictData.impact_message
                    }
                  }]);
                } else if (toolName === 'detect_marketing_triggers') {
                  setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "",
                    marketing_triggers: {
                      triggers: verdictData.triggers_found,
                      warning: verdictData.warning_message
                    }
                  }]);
                } else if (toolName === 'apply_72h_rule') {
                  setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "",
                    rule72h: {
                      is_survival_item: verdictData.is_survival_item,
                      should_wait: verdictData.should_wait,
                      reasoning: verdictData.reasoning
                    }
                  }]);
                } else if (toolName === 'stranger_test') {
                  setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "",
                    stranger_test: {
                      item_name: verdictData.item_name,
                      item_price: verdictData.item_price,
                      test_question: verdictData.test_question
                    }
                  }]);
                } else if (toolName === 'crisis_protocol') {
                  setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "",
                    crisis_protocol: {
                      priority_list: verdictData.priority_list,
                      debt_strategy: verdictData.debt_strategy,
                      tactical_advice: verdictData.tactical_advice
                    }
                  }]);
                } else if (toolName === 'halt_assessment') {
                  setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "",
                    halt_assessment: {
                      halt_status: verdictData.halt_status,
                      recommendation: verdictData.recommendation
                    }
                  }]);
                } else if (toolName === 'provide_verdict' || verdictData.empathy_message) {
                  // Add empathy message first
                  setMessages(prev => [...prev, {
                    role: "assistant",
                    content: verdictData.empathy_message
                  }]);

                  // Add 1.5s delay and then analysis message
                  setTimeout(() => {
                    setMessages(prev => [...prev, {
                      role: "assistant",
                      content: "",
                      isAnalysis: true,
                      verdict: {
                        verdict: verdictData.verdict_status,
                        delay_months: verdictData.delay_months,
                        reasoning: verdictData.verdict_reasoning,
                        advice: verdictData.suggestion,
                        summary: verdictData.verdict_title,
                        math_summary: verdictData.math_summary
                      }
                    }]);
                    setIsTyping(false);
                    setIsLoading(false);
                  }, 1500);
                } else if (toolName === 'update_goal_deadline' || verdictData.additional_months !== undefined) {
                  // Handle update_goal_deadline tool call
                  const updateDeadline = async () => {
                    try {
                      const {
                        data: {
                          session
                        }
                      } = await supabase.auth.getSession();
                      if (!session) return;
                      const {
                        error: updateError
                      } = await supabase.functions.invoke('update-goal-deadline', {
                        body: {
                          goalId: userContext?.goalId,
                          additionalMonths: verdictData.additional_months
                        },
                        headers: {
                          Authorization: `Bearer ${session.access_token}`
                        }
                      });
                      if (updateError) {
                        console.error('Failed to update goal deadline:', updateError);
                      }
                    } catch (e) {
                      console.error('Failed to call update-goal-deadline:', e);
                    }
                  };
                  updateDeadline();
                }
                
                // Reset tool call tracking variables
                isCollectingToolCall = false;
                toolCallBuffer = "";
                currentToolName = "";
                hasToolCall = false;
              } catch (e) {
                console.error("Failed to parse tool call:", e);
                setIsTyping(false);
                setIsLoading(false);
              }
            }
          } catch (e) {
            console.error("Failed to parse chunk:", e);
          }
        }
      }

      // Always disable loading when streaming ends (with safety delay)
      setTimeout(() => {
        setIsLoading(false);
        setIsTyping(false);
      }, 500);
      
      clearTimeout(safetyTimeout);
    } catch (error: any) {
      clearTimeout(safetyTimeout);
      toast({
        title: "Erro",
        description: error.message || "Falha ao enviar mensagem",
        variant: "destructive"
      });
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
  return <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-card border-b border-border">
        <div className="container mx-auto px-4 py-4 bg-white">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")} className="rounded-2xl bg-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden">
                  <img src={oracleBallImage} alt="Oráculo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Oráculo</h1>
                  <p className="text-sm text-muted-foreground">Seu Amigo Financeiro de IA</p>
                </div>
              </div>
            </div>
            
            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-2xl bg-card">
                  <History className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>Histórico de Conversas</SheetTitle>
                  <SheetDescription>
                    Suas consultas anteriores com o Oráculo
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-200px)] mt-6">
                  <div className="space-y-3">
                    <Button onClick={startNewChat} className="w-full justify-start gradient-primary" size="lg">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Nova Conversa
                    </Button>
                    
                    {chatHistory.map(session => {
                    const firstUserMessage = session.history.find(m => m.role === "user");
                    const preview = firstUserMessage?.content.slice(0, 60) || "Conversa sem mensagens";
                    return <Card key={session.id} className={`p-4 cursor-pointer transition-colors hover:bg-accent/50 ${session.id === currentSessionId ? "border-primary" : ""}`} onClick={() => loadHistoricalSession(session)}>
                          <p className="text-sm font-medium line-clamp-2 mb-2">
                            {preview}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(session.created_at), "d 'de' MMMM 'às' HH:mm", {
                          locale: ptBR
                        })}
                          </p>
                        </Card>;
                  })}
                    
                    {chatHistory.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhuma conversa anterior encontrada
                      </p>}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto container mx-auto px-4 py-6 bg-slate-50">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -10
          }} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${message.role === "user" ? "bg-primary text-primary-foreground" : "glass-card"} rounded-3xl px-6 py-4`}>
                  {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                  
                  {message.servitude && (
                    <Card className="p-4 mt-3 bg-red-500/10 border-2 border-red-500/50">
                      <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-red-500 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-red-500 text-lg">{message.servitude.hours.toFixed(1)} horas da sua vida</p>
                          <p className="text-sm text-muted-foreground">{message.servitude.item_name} - R${message.servitude.item_price.toFixed(2)}</p>
                          <p className="text-sm mt-1">{message.servitude.impact_message}</p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {message.marketing_triggers && message.marketing_triggers.triggers.length > 0 && (
                    <Card className="p-4 mt-3 bg-yellow-500/10 border-2 border-yellow-500/50">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-yellow-500">🚨 Gatilhos Detectados</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {message.marketing_triggers.triggers.map((trigger, idx) => (
                              <Badge key={idx} variant="outline" className="border-yellow-500/50 text-yellow-500">{trigger}</Badge>
                            ))}
                          </div>
                          <p className="text-sm mt-2">{message.marketing_triggers.warning}</p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {message.rule72h && (
                    <Card className="p-4 mt-3 bg-blue-500/10 border-2 border-blue-500/50">
                      <div className="flex items-start gap-3">
                        <History className="w-6 h-6 text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-blue-500">
                            {message.rule72h.is_survival_item ? "✅ Item Essencial" : "⏳ Regra das 72 Horas"}
                          </p>
                          {message.rule72h.should_wait && (
                            <p className="text-sm font-medium mt-1">Espere 3 dias antes de comprar</p>
                          )}
                          <p className="text-sm mt-1">{message.rule72h.reasoning}</p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {message.stranger_test && (
                    <Card className="p-4 mt-3 bg-purple-500/10 border-2 border-purple-500/50">
                      <div className="flex items-start gap-3">
                        <DollarSign className="w-6 h-6 text-purple-500 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-purple-500">💰 Teste do Estranho</p>
                          <p className="text-sm mt-1">{message.stranger_test.test_question}</p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {message.crisis_protocol && (
                    <Card className="p-4 mt-3 bg-orange-500/10 border-2 border-orange-500/50">
                      <div className="flex items-start gap-3">
                        <TrendingDown className="w-6 h-6 text-orange-500 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-orange-500">🆘 Protocolo de Crise</p>
                          <div className="mt-2">
                            <p className="text-sm font-semibold mb-1">Hierarquia das 4 Paredes:</p>
                            <ol className="space-y-1">
                              {message.crisis_protocol.priority_list.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="font-bold text-orange-500 min-w-[20px]">{idx + 1}.</span>
                                  <span className="text-sm">{item}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                          <div className="mt-3 bg-background/50 rounded p-2">
                            <p className="text-xs font-semibold mb-1">Estratégia:</p>
                            <p className="text-xs">{message.crisis_protocol.debt_strategy}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {message.halt_assessment && (
                    <Card className="p-4 mt-3 bg-indigo-500/10 border-2 border-indigo-500/50">
                      <div className="flex items-start gap-3">
                        <Brain className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-indigo-500">🧠 Avaliação HALT</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {message.halt_assessment.halt_status.hungry && <Badge variant="outline">Com Fome</Badge>}
                            {message.halt_assessment.halt_status.angry && <Badge variant="outline">Com Raiva</Badge>}
                            {message.halt_assessment.halt_status.lonely && <Badge variant="outline">Solitário</Badge>}
                            {message.halt_assessment.halt_status.tired && <Badge variant="outline">Cansado</Badge>}
                          </div>
                          <p className="text-sm mt-2">{message.halt_assessment.recommendation}</p>
                        </div>
                      </div>
                    </Card>
                  )}
                  
                  {message.verdict && <>
                      {message.verdict.math_summary && <p className="font-semibold text-sm mt-3 mb-2">
                          📊 {message.verdict.math_summary}
                        </p>}
                      <VerdictCard verdict={message.verdict} />
                    </>}
                </div>
              </motion.div>)}
          </AnimatePresence>

          {isTyping && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} className="flex justify-start">
              <div className="glass-card rounded-3xl px-6 py-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 glass-card border-t border-border">
        <div className="container mx-auto px-4 py-4 bg-purple-50">
          <div className="max-w-3xl mx-auto flex gap-3">
            <Input value={input} onChange={e => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Digite sua mensagem..." disabled={isLoading} className="flex-1 rounded-3xl px-6 py-6 text-base" />
            <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="lg" className="rounded-3xl px-6 gradient-primary hover:opacity-90 transition-opacity">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
const VerdictCard = ({
  verdict
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
          title: "✅ Aprovado"
        };
      case "warning":
        return {
          bg: "bg-accent/10",
          border: "border-accent",
          icon: <AlertTriangle className="w-6 h-6 text-accent" />,
          title: "⚠️ Atenção"
        };
      case "denied":
        return {
          bg: "bg-destructive/10",
          border: "border-destructive",
          icon: <XCircle className="w-6 h-6 text-destructive" />,
          title: "🚫 Não Recomendado"
        };
    }
  };
  const style = getVerdictStyle();
  return <motion.div initial={{
    opacity: 0,
    scale: 0.95
  }} animate={{
    opacity: 1,
    scale: 1
  }} className={`mt-4 p-4 rounded-2xl border-2 ${style.bg} ${style.border}`}>
      <div className="flex items-start gap-3 mb-3">
        {style.icon}
        <div>
          <h3 className="font-bold text-lg">{style.title}</h3>
          {verdict.delay_months > 0 && <p className="text-sm text-muted-foreground">
              Atrasa meta em ~{verdict.delay_months} {verdict.delay_months !== 1 ? "meses" : "mês"}
            </p>}
        </div>
      </div>
      <p className="text-sm mb-2">{verdict.reasoning}</p>
      {verdict.advice && <p className="text-sm font-medium mt-2">💡 {verdict.advice}</p>}
      <p className="text-sm font-semibold mt-3 pt-3 border-t border-border">
        {verdict.summary}
      </p>
    </motion.div>;
};
export default Oracle;