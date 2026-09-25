"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Sparkles, UserCheck, Headphones, RefreshCw, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface ChatMessage {
  id: number;
  senderType: "USER" | "ADMIN";
  senderName: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function UserChatWidget() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Do NOT render floating user chat widget on admin pages or login
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/secret-login")) {
    return null;
  }

  const getOrCreateGuestToken = () => {
    if (typeof window === "undefined") return "";
    let token = localStorage.getItem("webtrij_chat_guest_token");
    if (!token) {
      token = "guest_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);
      localStorage.setItem("webtrij_chat_guest_token", token);
    }
    return token;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChat = async () => {
    try {
      let url = "/api/chat";
      if (!user) {
        const guestToken = getOrCreateGuestToken();
        if (!guestToken) return;
        url += `?guestToken=${encodeURIComponent(guestToken)}`;
      }
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (data.room) {
        setMessages(data.room.messages || []);
        setUnreadCount(data.room.unreadUser || 0);
      }
    } catch (e) {
      console.error("Gagal polling chat:", e);
    }
  };

  // Initial fetch and 3-second polling interval
  useEffect(() => {
    if (!pathname?.startsWith("/admin")) {
      fetchChat();
      const interval = setInterval(fetchChat, 3000);
      return () => clearInterval(interval);
    }
  }, [user, pathname]);

  // Scroll to bottom when opening or getting new messages
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMsg;
    if (!textToSend || !textToSend.trim() || sending) return;

    const clean = textToSend.trim();
    setInputMsg("");
    setSending(true);

    const guestToken = !user ? getOrCreateGuestToken() : undefined;

    // Optimistic UI update
    const tempMsg: ChatMessage = {
      id: Date.now(),
      senderType: "USER",
      senderName: user?.name || "Saya",
      message: clean,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          guestToken,
        }),
      });
      if (res.ok) {
        fetchChat();
      }
    } catch (e) {
      console.error("Gagal mengirim pesan chat:", e);
    } finally {
      setSending(false);
    }
  };

  const QUICK_CHIPS = [
    "Halo kak, stok ready?",
    "Tanya Info Ongkir Ekspedisi",
    "Bisa Minta Rekomendasi Produk?",
    "Status Pesanan Saya Kapan Dikirim?",
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-purple-400/30"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6 animate-pulse" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-xs font-black tracking-wide hidden sm:inline">Live Chat Admin</span>

          {/* Pulse Glow Background */}
          <span className="absolute -inset-0.5 rounded-full bg-purple-600 opacity-30 blur-md group-hover:opacity-60 transition duration-300 -z-10 animate-ping"></span>
        </button>
      )}

      {/* Expandable Chat Popup Modal Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Top Bar Header */}
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-black text-white text-sm">
                  <Headphones className="w-5 h-5 text-amber-300" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-tight flex items-center gap-1.5">
                  <span>CS TRI J Perabotan</span>
                  <span className="text-[10px] bg-amber-400 text-purple-950 font-black px-1.5 py-0.5 rounded-full">
                    Respon Cepat
                  </span>
                </h3>
                <p className="text-[11px] text-purple-100 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                  <span>Online Siap Membantu</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={fetchChat}
                className="p-1.5 hover:bg-white/20 rounded-full transition text-white cursor-pointer"
                title="Refresh Pesan"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition text-white cursor-pointer"
                title="Tutup Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Guest Mode Banner */}
          {!user && (
            <div className="bg-amber-50 border-b border-amber-200 px-3.5 py-2 flex items-center justify-between text-[11px] text-amber-900 shadow-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                <span>Mode Chat: <strong>Tamu (Tanpa Login)</strong></span>
              </span>
              <Link
                href="/secret-login"
                className="text-purple-700 font-extrabold hover:underline flex items-center gap-1"
              >
                <UserCheck className="w-3 h-3" />
                <span>Login</span>
              </Link>
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/70">
            {messages.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-8 space-y-2">
                <Sparkles className="w-8 h-8 text-purple-400 mx-auto animate-bounce" />
                <p className="font-semibold text-slate-600">Belum ada percakapan.</p>
                <p className="text-[11px] text-slate-400">Ketik pesan pertama Anda untuk menghubungi Admin CS TRI J!</p>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderType === "USER";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
                  >
                    <div className="flex items-center gap-1.5 px-1">
                      <span className="text-[10px] font-bold text-slate-400">
                        {isMe ? (user?.name || "Saya") : m.senderName || "Admin CS TRI J"}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                    </div>
                    <div
                      className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed font-sans shadow-2xs ${
                        isMe
                          ? "bg-purple-600 text-white rounded-br-xs"
                          : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs font-medium"
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Chips */}
          <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 rounded-full text-[10px] font-extrabold whitespace-nowrap transition cursor-pointer shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ketik pesan Anda untuk CS TRI J..."
              className="flex-1 bg-slate-100 border border-slate-200 focus:bg-white focus:border-purple-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none transition font-sans"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || sending}
              className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Kirim Pesan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
