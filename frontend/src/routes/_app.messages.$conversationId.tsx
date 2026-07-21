import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesService, userService } from "@/services";
import { Card, Avatar } from "@/components/shared/primitives";
import { LoadingButton } from "@/components/shared/LoadingButton";
import { ArrowLeft, Send, Paperclip } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { builders, conversations } from "@/mocks/seed";
import { cn } from "@/lib/utils";
import { ws, WsEvent } from "@/api/ws";
import { API_BASE_URL } from "@/api/client";

export const Route = createFileRoute("/_app/messages/$conversationId")({
  head: () => ({ meta: [{ title: "Chat — DevLink" }] }),
  component: Thread,
});

function Thread() {
  const { conversationId } = Route.useParams();
  const existingConversation = conversations.find((c) => c.id === conversationId);
  const contact =
    existingConversation?.with ?? builders.find((builder) => builder.id === conversationId);
  const conv =
    existingConversation ?? (contact ? { id: conversationId, with: contact } : conversations[0]);
  const queryClient = useQueryClient();
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => userService.me(),
  });
  const { data = [] } = useQuery({
    queryKey: ["thread", conversationId],
    queryFn: () => messagesService.thread(conversationId),
  });
  
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data, typing]);

  useEffect(() => {
    // Mark as read
    messagesService.markRead(conversationId).catch(() => {});
    
    const unsubscribe = ws.on((ev: WsEvent) => {
      if (ev.type === "message.new" && ev.data.conversation_id === conversationId) {
        queryClient.invalidateQueries({ queryKey: ["thread", conversationId] });
        messagesService.markRead(conversationId).catch(() => {});
      } else if (ev.type === "typing" && ev.data.conversation_id === conversationId) {
        setTyping(ev.data.is_typing);
      }
    });
    return unsubscribe;
  }, [conversationId, queryClient]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    ws.send({ type: "typing", data: { conversation_id: conversationId, is_typing: true } });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      ws.send({ type: "typing", data: { conversation_id: conversationId, is_typing: false } });
    }, 2000);
  };

  const sendMutation = useMutation({
    mutationFn: (args: { text: string; attachment?: string }) =>
      messagesService.send({
        conversation_id: conversationId,
        message: args.text,
        attachment: args.attachment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thread", conversationId] });
      ws.send({ type: "typing", data: { conversation_id: conversationId, is_typing: false } });
      setText("");
    },
  });

  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!text.trim() && !fileInputRef.current?.files?.length) return;
      setSubmitting(true);
      try {
        let attachmentUrl = undefined;
        const file = fileInputRef.current?.files?.[0];
        if (file) {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch(`${API_BASE_URL}/api/messages/upload`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("devlink.access") || sessionStorage.getItem("devlink.access")}`,
            },
            body: formData,
          });
          const data = await res.json();
          attachmentUrl = data.url;
        }
        await sendMutation.mutateAsync({ text, attachment: attachmentUrl });
        if (fileInputRef.current) fileInputRef.current.value = "";
      } finally {
        setSubmitting(false);
      }
    },
    [text, conversationId, sendMutation],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="hidden lg:block lg:h-[calc(100vh-8rem)] lg:overflow-y-auto">
        <div className="border-b border-border px-4 py-3">
          <p className="text-[14px] font-semibold text-foreground">Conversations</p>
        </div>
        <ul className="divide-y divide-border">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                to="/messages/$conversationId"
                params={{ conversationId: c.id }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 hover:bg-muted/50",
                  c.id === conversationId && "bg-muted/50",
                )}
              >
                <Avatar src={c.with.avatar} alt={c.with.name} size={36} online={c.with.online} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-foreground">
                    {c.with.name}
                  </p>
                  <p className="truncate text-[12px] text-muted-foreground">{c.preview}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="flex flex-col lg:h-[calc(100vh-8rem)]">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Link to="/messages" className="lg:hidden">
            <ArrowLeft size={16} className="text-muted-foreground" />
          </Link>
          <Avatar src={conv.with.avatar} alt={conv.with.name} size={36} online={conv.with.online} />
          <div>
            <p className="text-[13px] font-semibold text-foreground">{conv.with.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {conv.with.online ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {data.length === 0 && (
            <p className="text-center text-[12px] text-muted-foreground">
              No messages yet — say hello 👋
            </p>
          )}
          {data.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-md px-3 py-2 text-[13px]",
                  m.from === "me"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-surface text-foreground",
                )}
              >
                <p>{m.text || m.content}</p>
                {(m.attachment || m.attachment_url) && (
                  <img src={m.attachment || m.attachment_url} className="mt-2 rounded-md max-w-[200px]" alt="attachment" />
                )}
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    m.from === "me" || (m.sender_id && m.sender_id === me?.id) ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {m.at || new Date(m.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-muted-foreground">
                <p className="animate-pulse">Typing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
          <label className="cursor-pointer text-muted-foreground hover:text-foreground">
            <Paperclip size={18} />
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf,.doc,.docx" />
          </label>
          <input
            value={text}
            onChange={handleTyping}
            placeholder="Type a message…"
            className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <LoadingButton
            type="submit"
            loading={submitting}
            loadingText=""
            disabled={!text.trim() && !fileInputRef.current?.files?.length}
            className="inline-flex items-center gap-1"
          >
            <Send size={14} /> Send
          </LoadingButton>
        </form>
      </Card>
    </div>
  );
}
