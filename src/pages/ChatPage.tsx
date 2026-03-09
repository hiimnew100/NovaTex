import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send, Printer, Copy, RotateCcw, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const SUGGESTED_PROMPTS = [
  "What's the difference between DTF and screen printing?",
  "Best fabric for vibrant sublimation prints?",
  "How do I fix cracking on t-shirt prints?",
  "Color palette ideas for streetwear collection",
  "How to price DTG printing jobs?",
  "Recommended ink brands for DTF printing?",
];

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hey! I'm **FabricPrint AI** — your expert assistant for all things textile printing. 👋\n\nI can help you with:\n- Printing methods (DTF, sublimation, screen printing, DTG)\n- Fabric selection for different techniques\n- Color combinations and design ideas\n- Troubleshooting printing problems\n- Business tips and pricing strategies\n\nWhat would you like to know?",
};

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
  signal,
}: {
  messages: { role: string; content: string }[];
  onDelta: (delta: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
  signal?: AbortSignal;
}) {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/fabric-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({ error: "Request failed" }));
    if (resp.status === 429) {
      onError("Rate limit reached. Please wait a moment and try again.");
    } else if (resp.status === 402) {
      onError("AI usage limit reached. Please add credits to continue.");
    } else {
      onError(data.error || "Something went wrong. Please try again.");
    }
    return;
  }

  if (!resp.body) {
    onError("No response stream received.");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Flush remaining buffer
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw || raw.endsWith("\r")) continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        // ignore
      }
    }
  }

  onDone();
}

function TypingIndicator() {
  return (
    <div className="flex gap-1.5 items-center py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="typing-dot w-2 h-2 rounded-full bg-primary/60"
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg, isLast }: { msg: Message; isLast: boolean }) {
  const isUser = msg.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    toast.success("Copied to clipboard");
  };

  return (
    <div className={`flex gap-3 animate-slide-up ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-purple flex items-center justify-center glow-purple-sm mt-1">
          <Printer className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      <div className={`group max-w-[85%] sm:max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-surface-2 border border-border text-foreground rounded-tl-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_ul]:mb-2 [&_li]:mb-1 [&_strong]:text-foreground [&_code]:bg-surface-3 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-primary [&_code]:text-xs">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Copy button */}
        {!isUser && msg.content && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-1"
          >
            <Copy className="w-3 h-3" />
            Copy
          </button>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-surface-3 border border-border flex items-center justify-center mt-1 text-xs font-semibold text-muted-foreground">
          U
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle initial query from URL
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setInput(q);
      setShowSuggestions(false);
    }
  }, [searchParams]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }
  }, [input]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setShowSuggestions(false);
      const userMsg: Message = { id: Date.now().toString(), role: "user", content: trimmed };
      const historyForApi = messages.filter((m) => m.id !== "welcome").concat(userMsg);

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      abortRef.current = new AbortController();
      let assistantId = `assistant-${Date.now()}`;
      let started = false;

      try {
        await streamChat({
          messages: historyForApi.map((m) => ({ role: m.role, content: m.content })),
          onDelta: (chunk) => {
            if (!started) {
              started = true;
              setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: chunk }]);
            } else {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: m.content + chunk } : m
                )
              );
            }
          },
          onDone: () => {
            setIsLoading(false);
            abortRef.current = null;
          },
          onError: (err) => {
            toast.error(err);
            setIsLoading(false);
            abortRef.current = null;
          },
          signal: abortRef.current.signal,
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          toast.error("Failed to send message. Please try again.");
        }
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleSuggestion = (s: string) => {
    sendMessage(s);
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setShowSuggestions(true);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border/60 backdrop-blur-xl bg-background/90 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="w-8 h-8 rounded-lg border border-border bg-surface-1 flex items-center justify-center hover:bg-surface-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-purple flex items-center justify-center glow-purple-sm">
              <Printer className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="font-display font-bold text-sm leading-tight">FabricPrint AI</p>
              <p className="text-xs text-muted-foreground leading-tight">Textile Expert</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1 rounded-full border border-border bg-surface-1">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "hsl(142 70% 49%)" }} />
            Online
          </div>
          <button
            onClick={handleReset}
            className="w-8 h-8 rounded-lg border border-border bg-surface-1 flex items-center justify-center hover:bg-surface-2 transition-all text-muted-foreground hover:text-foreground"
            title="New conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-6 py-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-5">
          {messages.map((msg, i) => (
            <MessageBubble key={msg.id} msg={msg} isLast={i === messages.length - 1} />
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 animate-slide-up">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-purple flex items-center justify-center glow-purple-sm mt-1">
                <Printer className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-surface-2 border border-border">
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions */}
      {showSuggestions && messages.length <= 1 && (
        <div className="px-4 sm:px-6 pb-3 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Suggested questions
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="px-3 py-1.5 rounded-full text-xs border border-border bg-surface-1 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-surface-2 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 px-4 sm:px-6 pb-4 pt-2 border-t border-border/40">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 p-3 rounded-2xl border border-border bg-surface-1 focus-within:border-primary/50 focus-within:shadow-purple-sm transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about fabric printing, design, colors..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none min-h-[24px] max-h-[160px] leading-relaxed"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed glow-purple-sm disabled:shadow-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Press <kbd className="px-1 py-0.5 rounded border border-border bg-surface-2 font-mono text-[10px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded border border-border bg-surface-2 font-mono text-[10px]">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
}
