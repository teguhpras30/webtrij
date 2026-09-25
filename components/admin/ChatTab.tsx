"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  User,
  Search,
  RefreshCw,
  Phone,
  Mail,
  CheckCheck,
  Sparkles,
  Smile,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ChatRoom {
  id: number;
  userId: number | null;
  guestToken?: string | null;
  guestName?: string | null;
  unreadAdmin: number;
  unreadUser: number;
  lastMessage: string | null;
  lastSender: string | null;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  } | null;
}

interface ChatMessage {
  id: number;
  senderType: "USER" | "ADMIN";
  senderName: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function ChatTab() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showWaSettings, setShowWaSettings] = useState(false);
  const [waForwardNumbers, setWaForwardNumbers] = useState("");
  const [savingWaSettings, setSavingWaSettings] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/admin/chat");
      if (!res.ok) return;
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (e) {
      console.error("Gagal mengambil daftar room chat:", e);
    }
  };

  const fetchRoomMessages = async (roomId: number) => {
    try {
      const res = await fetch(`/api/admin/chat?roomId=${roomId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.room) {
        setMessages(data.room.messages || []);
      }
    } catch (e) {
      console.error("Gagal mengambil pesan room chat:", e);
    }
  };

  const fetchWaSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings && data.settings.LIVECHAT_FORWARD_WA_NUMBERS) {
          setWaForwardNumbers(data.settings.LIVECHAT_FORWARD_WA_NUMBERS);
        }
      }
    } catch (e) {}
  };

  const handleSaveWaSettings = async () => {
    setSavingWaSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          LIVECHAT_FORWARD_WA_NUMBERS: waForwardNumbers,
        }),
      });
      if (res.ok) {
        alert("Nomor WA CS berhasil disimpan!");
        setShowWaSettings(false);
      } else {
        alert("Gagal menyimpan nomor WA CS.");
      }
    } catch (e) {
      console.error("Gagal menyimpan nomor WA CS:", e);
      alert("Terjadi kesalahan saat menyimpan.");
    } finally {
      setSavingWaSettings(false);
    }
  };

  // Initial fetch and polling interval (every 4 seconds)
  useEffect(() => {
    fetchRooms();
    fetchWaSettings();
    const interval = setInterval(fetchRooms, 4000);
    return () => clearInterval(interval);
  }, []);

  // Poll current active room messages every 3 seconds
  useEffect(() => {
    if (!selectedRoom) return;
    fetchRoomMessages(selectedRoom.id);
    const interval = setInterval(() => {
      fetchRoomMessages(selectedRoom.id);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedRoom?.id]);

  // Scroll to bottom when messages change or room selected
  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedRoom]);

  const handleSelectRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
    setMessages([]);
    fetchRoomMessages(room.id);
    // Mark room unreadAdmin as 0 locally
    setRooms((prev) =>
      prev.map((r) => (r.id === room.id ? { ...r, unreadAdmin: 0 } : r))
    );
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMsg;
    if (!selectedRoom || !textToSend || !textToSend.trim() || sending) return;

    const clean = textToSend.trim();
    setInputMsg("");
    setSending(true);

    // Optimistic UI update
    const tempMsg: ChatMessage = {
      id: Date.now(),
      senderType: "ADMIN",
      senderName: "Customer Service TRI J",
      message: clean,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: selectedRoom.id, message: clean }),
      });
      if (res.ok) {
        fetchRoomMessages(selectedRoom.id);
        fetchRooms();
      }
    } catch (e) {
      console.error("Gagal mengirim balasan chat:", e);
    } finally {
      setSending(false);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const name = r.user?.name || r.guestName || `Tamu #${r.id}`;
    const email = r.user?.email || "";
    const phone = r.user?.phone || "";
    const query = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      phone.includes(query) ||
      String(r.id).includes(query)
    );
  });

  const CANNED_REPLIES = [
    "Halo kak! Produk ini ready stok dan siap dikirim hari ini. Silakan langsung diorder ya kak! 😊",
    "Terima kasih sudah menghubungi TRI J! Ada yang bisa kami bantu kembali kak? 🙏",
    "Pesanan Anda sedang kami siapkan & dipacking aman berlapis kardus tebal. Ditunggu ya kak! 📦",
    "Ongkir otomatis terhitung saat checkout sesuai kota/kecamatan tujuan kakak ya. 👍",
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xs h-[720px] w-full flex overflow-hidden font-sans">
      {/* Sidebar Customer Rooms List (Always visible side-by-side) */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-slate-50/50 shrink-0">
        {/* Search & Title Bar */}
        <div className="p-4 border-b border-gray-200 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <span>Live Chat Pelanggan</span>
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowWaSettings(!showWaSettings)}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                title="Pengaturan Forward Chat ke WA CS"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Forward WA</span>
              </button>
              <button
                onClick={fetchRooms}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
                title="Refresh Chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, atau HP..."
              className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-purple-600 font-sans"
            />
          </div>

          {/* WA CS Forwarder Modal Settings Box */}
          {showWaSettings && (
            <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-2.5 shadow-sm text-xs">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-1.5">
                <span className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Forward Pesan ke WA CS</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowWaSettings(false)}
                  className="text-emerald-700 font-bold hover:text-emerald-950 text-[11px]"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-emerald-950 block">
                  Nomor WhatsApp CS (Pisahkan dengan koma jika &gt;1):
                </label>
                <input
                  type="text"
                  value={waForwardNumbers}
                  onChange={(e) => setWaForwardNumbers(e.target.value)}
                  placeholder="Contoh: 08123456789, 08987654321"
                  className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>

              <div className="bg-white/80 p-2 rounded-xl text-[10px] text-emerald-900 leading-relaxed border border-emerald-200/60 font-medium space-y-1">
                <p className="font-bold text-emerald-950">💡 CARA BALAS DARI WA CS:</p>
                <p>Setiap ada pesan dari website, WA CS akan menerima format: <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-bold">#ROOM_ID [pesan]</code>.</p>
                <p>CS cukup membalas via WA: <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-bold">#15 Halo kak, produk ready!</code></p>
              </div>

              <button
                type="button"
                onClick={handleSaveWaSettings}
                disabled={savingWaSettings}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {savingWaSettings ? "Menyimpan..." : "Simpan Nomor WA CS"}
              </button>
            </div>
          )}
        </div>

        {/* Room Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filteredRooms.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Belum ada pesan chat dari pembeli.</p>
            </div>
          ) : (
            filteredRooms.map((r) => {
              const isSelected = selectedRoom?.id === r.id;
              const hasUnread = (r.unreadAdmin || 0) > 0;
              const isGuest = !r.user;
              const displayName = r.user?.name || r.guestName || `Tamu #${r.id}`;

              return (
                <div
                  key={r.id}
                  onClick={() => handleSelectRoom(r)}
                  className={`p-3.5 transition cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? "bg-purple-50/80 border-l-4 border-purple-600"
                      : "hover:bg-slate-100/80 bg-white"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-full ${isGuest ? "bg-amber-100 text-amber-800" : "bg-purple-100 text-purple-700"} font-bold flex items-center justify-center border border-purple-200 text-sm uppercase`}>
                      {r.user?.avatar ? (
                        <img
                          src={r.user.avatar}
                          alt={r.user.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        isGuest ? "TM" : (r.user?.name?.substring(0, 2) || "US")
                      )}
                    </div>
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                        {r.unreadAdmin}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <h4
                          className={`text-xs font-bold truncate ${
                            hasUnread
                              ? "text-purple-950 font-extrabold"
                              : "text-slate-800"
                          }`}
                        >
                          {displayName}
                        </h4>
                        {isGuest && (
                          <span className="text-[9px] bg-amber-100 text-amber-900 font-black px-1.5 py-0.2 rounded shrink-0">
                            GUEST
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {r.updatedAt
                          ? new Date(r.updatedAt).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>

                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        hasUnread ? "text-purple-700 font-bold" : "text-slate-500"
                      }`}
                    >
                      {r.lastSender === "ADMIN" ? "Saya: " : ""}
                      {r.lastMessage || "Mulai chat..."}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Thread Area (Always visible on the right side) */}
      <div className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
        {!selectedRoom ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/40 text-slate-400 space-y-3">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center border border-purple-100 shadow-2xs">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">
              Pilih Percakapan Pelanggan
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Klik nama pelanggan pada daftar di sebelah kiri untuk melihat
              pesan dan memberikan balasan cepat secara real-time di area ini.
            </p>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-full ${selectedRoom.user ? "bg-purple-600 text-white" : "bg-amber-500 text-white"} font-bold flex items-center justify-center text-sm shadow-xs uppercase shrink-0`}>
                  {selectedRoom.user?.name?.substring(0, 2) || "TM"}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 flex-wrap">
                    <span className="truncate">{selectedRoom.user?.name || selectedRoom.guestName || `Tamu #${selectedRoom.id}`}</span>
                    {selectedRoom.user ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        Pelanggan Terdaftar
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                        Guest (Tanpa Login)
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                    {selectedRoom.user ? (
                      <>
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 text-purple-600 shrink-0" />
                          {selectedRoom.user.email}
                        </span>
                        {selectedRoom.user.phone && (
                          <span className="flex items-center gap-1 shrink-0">
                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                            {selectedRoom.user.phone}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-amber-800 font-medium">
                        Room Chat Guest #{selectedRoom.id} • Sesi Pengunjung Web
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Thread Message History (Smooth vertical scroll only) */}
            <div
              ref={messagesContainerRef}
              className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-slate-50/40 min-w-0"
            >
              {messages.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-12">
                  Belum ada pesan di ruang chat ini.
                </div>
              ) : (
                messages.map((m) => {
                  const isAdmin = m.senderType === "ADMIN";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        isAdmin ? "items-end" : "items-start"
                      } space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[10px] font-bold text-slate-400">
                          {isAdmin
                            ? "Admin CS TRI J"
                            : m.senderName || selectedRoom.user?.name || selectedRoom.guestName || "Tamu"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {m.createdAt
                            ? new Date(m.createdAt).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl text-xs leading-relaxed font-sans shadow-2xs break-words ${
                          isAdmin
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
            </div>

            {/* Cannned Quick Replies Drawer Toggle */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowQuickReplies(!showQuickReplies)}
                className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Template Balasan Cepat</span>
                {showQuickReplies ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Quick Replies Panel */}
            {showQuickReplies && (
              <div className="p-3 bg-slate-100 border-t border-slate-200 gap-2 grid grid-cols-1 sm:grid-cols-2 text-xs">
                {CANNED_REPLIES.map((reply, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      handleSendMessage(reply);
                      setShowQuickReplies(false);
                    }}
                    className="p-2 bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-900 border border-slate-200 rounded-xl text-[11px] text-left transition shadow-2xs font-medium cursor-pointer"
                  >
                    "{reply}"
                  </button>
                ))}
              </div>
            )}

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-4 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder={`Tulis balasan untuk ${selectedRoom.user?.name || selectedRoom.guestName || "Tamu"}...`}
                className="flex-1 bg-slate-100 border border-slate-200 focus:bg-white focus:border-purple-600 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none transition font-sans"
              />
              <button
                type="submit"
                disabled={!inputMsg.trim() || sending}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Kirim</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
