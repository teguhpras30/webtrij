"use client";

import { useState, useEffect } from "react";
import { Truck, Clock, CheckCircle2, Loader2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface TrackingHistoryItem {
  note: string;
  updatedAt: string;
  status: string;
}

interface OrderTrackingTimelineProps {
  waybillNumber: string;
  courierName?: string;
  currentStatus: string;
}

export default function OrderTrackingTimeline({
  waybillNumber,
  courierName = "JNE REG",
  currentStatus,
}: OrderTrackingTimelineProps) {
  const [history, setHistory] = useState<TrackingHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true); // Default visible, toggleable to hide

  useEffect(() => {
    fetchTrackingData();
  }, [waybillNumber]);

  const fetchTrackingData = async () => {
    if (!waybillNumber) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/biteship/tracking?waybill=${encodeURIComponent(waybillNumber)}&courier=${encodeURIComponent(courierName)}`);
      const data = await res.json();

      if (res.ok && data.history && Array.isArray(data.history)) {
        setHistory(data.history);
      }
    } catch (err) {
      console.warn("Failed to load tracking timeline:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRefreshing(true);
    fetchTrackingData();
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
    } catch (e) {
      return "Hari ini";
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    } catch (e) {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="mt-3 p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-center justify-center gap-2 text-xs text-purple-700 font-semibold animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin text-[#774EFC]" />
        <span>Menghubungkan Pelacakan Live Biteship...</span>
      </div>
    );
  }

  const latestStatusNote = history.length > 0 ? history[0].note : "Sedang diproses kurir";

  return (
    <div className="mt-3.5 bg-gradient-to-br from-purple-50/60 to-slate-50 border border-purple-200/80 rounded-2xl overflow-hidden transition-all shadow-2xs font-sans">
      {/* Header Bar (Clickable Toggle to Hide / Expand Timeline) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-purple-100/40 transition-colors select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#774EFC]"></span>
          </span>
          <div className="min-w-0">
            <h5 className="text-xs font-black text-gray-900 flex items-center gap-1.5 truncate">
              <Truck className="w-4 h-4 text-[#774EFC] shrink-0" />
              <span>Progress Tracking Live Biteship</span>
            </h5>
            {!isExpanded && (
              <p className="text-[11px] text-purple-700 font-semibold truncate mt-0.5">
                📍 {latestStatusNote}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-[10px] font-bold text-[#774EFC] hover:underline flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-purple-200 shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{refreshing ? "Updating..." : "Update Live"}</span>
          </button>

          <button
            type="button"
            className="p-1 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 transition"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable / Hideable Timeline Body */}
      {isExpanded && (
        <div className="px-3.5 pb-4 pt-1 sm:px-5 border-t border-purple-100/80 space-y-3">
          <div className="space-y-3 pt-2">
            {history.map((item, idx) => {
              const isLatest = idx === 0;
              const isDelivered = currentStatus === "DELIVERED" || currentStatus === "COMPLETED" || item.status === "delivered";

              return (
                <div key={idx} className="flex items-start gap-3 relative">
                  {/* Connector line between nodes */}
                  {idx < history.length - 1 && (
                    <div className="absolute left-[13px] top-6 bottom-0 w-0.5 bg-purple-200/80 -z-0" />
                  )}

                  {/* Node Icon */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 shadow-2xs transition-all ${
                      isLatest
                        ? isDelivered
                          ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                          : "bg-[#774EFC] text-white ring-4 ring-purple-100"
                        : "bg-white border-2 border-purple-200 text-purple-600"
                    }`}
                  >
                    {isLatest ? (
                      isDelivered ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Truck className="w-3.5 h-3.5" />
                      )
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Event Text Detail */}
                  <div className="flex-1 min-w-0 bg-white p-2.5 sm:p-3 rounded-xl border border-purple-100/90 shadow-2xs text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-bold text-[11px] ${
                          isLatest ? (isDelivered ? "text-emerald-700 font-extrabold" : "text-[#774EFC] font-extrabold") : "text-gray-700"
                        }`}
                      >
                        {item.note}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-gray-400 shrink-0">
                        {formatTime(item.updatedAt)} ({formatDate(item.updatedAt)})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
