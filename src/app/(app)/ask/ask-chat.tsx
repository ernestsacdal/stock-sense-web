"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { AskResult, type AskResultPayload } from "@/components/ask-result";
import { useAuth } from "@/lib/auth";
import { useAskHistory } from "@/lib/queries";
import { sseStream } from "@/lib/sse";
import type { QueryLog } from "@/lib/types";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "What's running low on stock?",
  "Which items are at risk of expiring before I use them?",
  "Where is most of my money parked?",
  "Top 10 fastest-moving items this month",
];

type Phase = "thinking" | "answering" | "done";

type Message =
  | { id: string; kind: "user"; text: string }
  | {
      id: string;
      kind: "ai";
      phase: Phase;
      answer: string;
      result: AskResultPayload | null;
      error: string | null;
      logId: number | null;
      llm: "openrouter" | "stub" | null;
    };

export function AskChat() {
  const { fetcher } = useAuth();
  const qc = useQueryClient();
  const history = useAskHistory(20);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function ask(text: string) {
    if (!text.trim() || submitting) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      kind: "user",
      text: text.trim(),
    };
    const aiMsg: Message = {
      id: `a-${Date.now()}`,
      kind: "ai",
      phase: "thinking",
      answer: "",
      result: null,
      error: null,
      logId: null,
      llm: null,
    };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
    setSubmitting(true);

    try {
      for await (const ev of sseStream(fetcher, "/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text.trim() }),
      })) {
        const payload = ev.data as Record<string, unknown>;
        if (ev.event === "token" || ev.event === "sql") {
          // SQL stream + final SQL — kept on the wire for audit but
          // not rendered. Server still persists generated_sql.
          continue;
        } else if (ev.event === "result") {
          const cols = (payload.columns as string[]) ?? [];
          const rows = (payload.rows as unknown[][]) ?? [];
          setMessages((prev) =>
            updateAi(prev, aiMsg.id, (m) => ({
              ...m,
              phase: "answering",
              result: { columns: cols, rows },
            }))
          );
        } else if (ev.event === "answer") {
          const t = (payload.text as string) ?? "";
          setMessages((prev) =>
            updateAi(prev, aiMsg.id, (m) => ({
              ...m,
              phase: "answering",
              answer: m.answer + t,
            }))
          );
        } else if (ev.event === "error") {
          const msg = (payload.message as string) ?? "Unknown error";
          const logId = (payload.log_id as number) ?? null;
          setMessages((prev) =>
            updateAi(prev, aiMsg.id, (m) => ({
              ...m,
              phase: "done",
              error: msg,
              logId,
            }))
          );
        } else if (ev.event === "done") {
          const logId = (payload.log_id as number) ?? null;
          const llm = (payload.llm as "openrouter" | "stub") ?? null;
          setMessages((prev) =>
            updateAi(prev, aiMsg.id, (m) => ({ ...m, phase: "done", logId, llm }))
          );
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Stream failed";
      setMessages((prev) =>
        updateAi(prev, aiMsg.id, (m) => ({ ...m, phase: "done", error: msg }))
      );
    } finally {
      setSubmitting(false);
      qc.invalidateQueries({ queryKey: ["ask", "history"] });
    }
  }

  function loadTurn(turn: QueryLog) {
    if (submitting) return;
    const userMsg: Message = {
      id: `u-h-${turn.id}`,
      kind: "user",
      text: turn.question,
    };
    const aiMsg: Message = {
      id: `a-h-${turn.id}`,
      kind: "ai",
      phase: "done",
      answer: turn.answer_text ?? "",
      result: null,
      error: turn.error_message,
      logId: turn.id,
      llm: null,
    };
    setMessages([userMsg, aiMsg]);
  }

  // Close the mobile history drawer whenever a turn is loaded (the
  // user clicked a history row, drawer should dismiss to reveal the
  // chat). Desktop sidebar ignores this since historyOpen only
  // controls the mobile overlay.
  function loadAndCloseDrawer(turn: QueryLog) {
    loadTurn(turn);
    setHistoryOpen(false);
  }

  return (
    <div className="grid h-[calc(100vh-200px)] grid-cols-1 gap-4 md:h-[calc(100vh-160px)] md:grid-cols-[280px_1fr]">
      {/* Desktop history sidebar (md+) */}
      <aside className="hidden flex-col overflow-hidden rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] backdrop-blur-2xl md:flex">
        <div className="border-b border-[color:var(--border)] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-subtle)]">
          History
        </div>
        <HistoryList
          history={history}
          onPick={loadTurn}
        />
      </aside>

      {/* Mobile history drawer (< md) */}
      {historyOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setHistoryOpen(false)}
            aria-hidden
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col overflow-hidden border-r border-[color:var(--border)] bg-[color:var(--bg-2)] shadow-2xl md:hidden">
            <div className="flex items-center justify-between border-b border-[color:var(--border)] px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-subtle)]">
                History
              </span>
              <button
                type="button"
                onClick={() => setHistoryOpen(false)}
                aria-label="Close history"
                className="flex h-7 w-7 items-center justify-center rounded-[var(--r-md)] text-[color:var(--text-muted)] transition-colors hover:bg-white/[0.05] hover:text-[color:var(--text)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <HistoryList
              history={history}
              onPick={loadAndCloseDrawer}
            />
          </aside>
        </>
      )}

      <section className="flex flex-col overflow-hidden rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--bg-2)]">
        <div className="flex items-center gap-3 border-b border-[color:var(--border)] px-4 py-3 md:px-6 md:py-4">
          {/* Mobile history toggle */}
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            aria-label="Open history"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[var(--r-md)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] text-[color:var(--text-muted)] hover:bg-white/[0.05] hover:text-[color:var(--text)] md:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <span
            className="hidden h-2 w-2 rounded-full md:block"
            style={{
              background: "var(--accent)",
              boxShadow: "0 0 0 0 var(--accent-glow)",
              animation: "pulse 2.4s infinite",
            }}
          />
          <h2 className="font-[family-name:var(--font-display)] text-[20px] italic md:text-[24px]">
            Ask StockSense
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-12 md:py-8">
          {messages.length === 0 && <EmptyState onPick={ask} />}
          <div className="flex flex-col gap-6">
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}
          </div>
          <div ref={bottomRef} />
        </div>

        <div
          className="border-t border-[color:var(--border)] px-4 pb-4 pt-4 md:px-12 md:pb-6 md:pt-5"
          style={{ background: "linear-gradient(180deg, transparent, var(--bg-2) 30%)" }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ask(input);
            }}
            className="flex items-center gap-3 rounded-[var(--r-lg)] border border-[color:var(--border-strong)] bg-[color:var(--surface-glass)] px-5 py-3"
            style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 text-[color:var(--accent-bright)]"
            >
              <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
            </svg>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={submitting}
              placeholder="Ask anything about your inventory…"
              className="flex-1 bg-transparent text-[14px] text-[color:var(--text)] outline-none placeholder:text-[color:var(--text-faint)] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={submitting || !input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1a1300] disabled:opacity-50"
              style={{ background: "var(--accent)" }}
              aria-label="Send"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
              </svg>
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={submitting}
                onClick={() => void ask(s)}
                className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-glass)] px-3 py-1 text-[11.5px] text-[color:var(--text-muted)] transition-colors hover:bg-[color:var(--surface-glass-strong)] hover:text-[color:var(--text)] disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 var(--accent-glow);
          }
          50% {
            box-shadow: 0 0 0 8px transparent;
          }
        }
      `}</style>
    </div>
  );
}

// Shared history list rendered in both the desktop sidebar and the
// mobile drawer. `onPick` is the only difference (desktop just loads;
// mobile also closes the drawer).
function HistoryList({
  history,
  onPick,
}: {
  history: ReturnType<typeof useAskHistory>;
  onPick: (turn: QueryLog) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto py-1">
      {history.isLoading && (
        <div className="px-4 py-6 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--text-faint)]">
          Loading…
        </div>
      )}
      {history.data && history.data.length === 0 && (
        <div className="px-4 py-6 text-center text-[12px] text-[color:var(--text-faint)]">
          Your previous questions will appear here.
        </div>
      )}
      {(history.data ?? []).map((turn) => (
        <button
          key={turn.id}
          type="button"
          onClick={() => onPick(turn)}
          className="block w-full border-b border-[color:var(--border)] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-white/[0.03]"
        >
          <div className="line-clamp-2 text-[12.5px]">{turn.question}</div>
          <div className="mt-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[color:var(--text-faint)]">
            <span
              className={cn(
                "rounded px-1.5 py-0.5",
                turn.status === "ok"
                  ? "bg-[color:var(--success-soft)] text-[color:var(--success)]"
                  : "bg-[color:var(--danger-soft)] text-[color:var(--danger)]"
              )}
            >
              {turn.status}
            </span>
            {turn.row_count != null && <span>{turn.row_count} rows</span>}
            <span>{turn.duration_ms}ms</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  if (msg.kind === "user") {
    return (
      <div className="flex flex-col items-end self-end max-w-[720px]">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--text-muted)]">
          You
        </div>
        <div className="rounded-[var(--r-lg)] border border-[color:var(--border-strong)] bg-[color:var(--surface-glass-strong)] px-5 py-4 text-[14px]">
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-start max-w-[820px]">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--accent-bright)]">
        StockSense {msg.llm === "stub" && "· stub mode"}
      </div>
      <div
        className="w-full rounded-[var(--r-lg)] border px-5 py-4 text-[14px] text-[color:var(--text)]"
        style={{
          borderColor: "rgba(245, 158, 11, 0.2)",
          background:
            "linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.02))",
        }}
      >
        {msg.error ? (
          <ErrorBubble error={msg.error} />
        ) : msg.phase === "thinking" ? (
          <ThinkingPill />
        ) : (
          <AnswerBlock msg={msg} />
        )}
      </div>
    </div>
  );
}

function AnswerBlock({ msg }: { msg: Extract<Message, { kind: "ai" }> }) {
  return (
    <>
      {msg.answer && (
        <p className="font-[family-name:var(--font-display)] text-[18px] italic leading-[1.45] text-[color:var(--text)]">
          {msg.answer}
          {msg.phase === "answering" && (
            <span className="ml-1 inline-block h-4 w-1.5 translate-y-0.5 animate-pulse bg-[color:var(--accent)]" />
          )}
        </p>
      )}
      {msg.result && msg.result.rows.length > 0 && (
        <AskResult result={msg.result} />
      )}
    </>
  );
}

function ThinkingPill() {
  return (
    <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--text-faint)]">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: "var(--accent)",
          animation: "pulse 1.2s infinite",
        }}
      />
      Thinking…
    </div>
  );
}

function ErrorBubble({ error }: { error: string }) {
  return (
    <div className="text-[color:var(--danger)]">
      <span className="font-mono text-[10px] uppercase tracking-[0.15em]">Rejected</span>
      <div className="mt-1 text-[13px]">{error}</div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="mx-auto mt-12 max-w-2xl text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--r-md)] bg-[color:var(--accent-soft)]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent-bright)"
          strokeWidth="2"
          className="h-6 w-6"
        >
          <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
        </svg>
      </div>
      <div className="font-[family-name:var(--font-display)] text-[28px] italic">
        Ask anything about your inventory.
      </div>
      <p className="mx-auto mt-3 max-w-md text-[13px] text-[color:var(--text-muted)]">
        Plain English in, plain English out — plus the data table.
        Every question runs through a read-only DB role with safety guards.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-glass)] px-3 py-1.5 text-[12px] text-[color:var(--text-muted)] hover:bg-[color:var(--surface-glass-strong)] hover:text-[color:var(--text)]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function updateAi(
  prev: Message[],
  id: string,
  patch: (m: Extract<Message, { kind: "ai" }>) => Extract<Message, { kind: "ai" }>
): Message[] {
  return prev.map((m) => (m.id === id && m.kind === "ai" ? patch(m) : m));
}
