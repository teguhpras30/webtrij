"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, CheckCircle2, Loader2, Sparkles } from "lucide-react";

interface BiteshipArea {
  id: string;
  name: string;
  postalCode: number;
  province: string;
  city: string;
  district: string;
}

interface BiteshipLocationPickerProps {
  onSelect: (selected: { addressText: string; postalCode: number; areaId: string; fullAreaName: string }) => void;
  currentAddress?: string;
  currentPostalCode?: number;
}

export default function BiteshipLocationPicker({
  onSelect,
  currentAddress = "",
  currentPostalCode,
}: BiteshipLocationPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BiteshipArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<BiteshipArea | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search via Biteship API (/api/location/wilayah?q=...)
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/location/wilayah?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.areas && Array.isArray(data.areas)) {
            setResults(data.areas);
            setIsOpen(true);
          } else {
            setResults([]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch Biteship location search:", err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectArea = (area: BiteshipArea) => {
    setSelectedArea(area);
    setIsOpen(false);
    setQuery("");

    // Format standardized location text for Biteship API compatibility
    const district = area.district || "";
    const city = area.city || "";
    const province = area.province || "";

    const parts = [district, city, province].filter(Boolean);
    const locationText = parts.join(", ");

    onSelect({
      addressText: locationText,
      postalCode: area.postalCode || 64315,
      areaId: area.id,
      fullAreaName: area.name,
    });
  };

  return (
    <div className="relative font-sans" ref={containerRef}>
      <div className="mb-2">
        <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#774EFC]" />
          <span>Cari Lokasi Wilayah Penjemputan Biteship (Auto-Fill Alamat & Kode Pos):</span>
        </label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            placeholder="Contoh ketik: Kertosono, Nganjuk, atau 64315..."
            className="w-full pl-10 pr-10 py-2 bg-purple-50/50 border border-purple-200 rounded-xl text-xs font-semibold text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#774EFC] transition"
          />
          {loading && (
            <div className="absolute right-3.5 top-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-[#774EFC]" />
            </div>
          )}
        </div>
      </div>

      {/* Selected Verified Area Badge */}
      {selectedArea ? (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <span className="font-extrabold text-emerald-900">Lokasi Terverifikasi Biteship: </span>
            <span className="font-semibold text-emerald-800">{selectedArea.name}</span>
            <span className="ml-2 font-mono font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded text-[10px]">
              Kode Pos: {selectedArea.postalCode}
            </span>
          </div>
        </div>
      ) : currentPostalCode ? (
        <div className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-[11px] text-gray-600 flex items-center gap-1.5 mb-3">
          <MapPin className="w-3.5 h-3.5 text-[#774EFC] shrink-0" />
          <span>Lokasi Aktif Saat Ini: <strong className="text-gray-900 font-mono">{currentPostalCode}</strong></span>
        </div>
      ) : null}

      {/* Dropdown Results List */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-purple-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-100 text-xs animate-in fade-in duration-150">
          {results.length > 0 ? (
            results.map((area) => (
              <div
                key={area.id}
                onClick={() => handleSelectArea(area)}
                className="p-3 hover:bg-purple-50 transition cursor-pointer flex items-start gap-2.5 group"
              >
                <MapPin className="w-4 h-4 text-purple-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div className="flex-1">
                  <p className="font-bold text-gray-900 group-hover:text-purple-700">{area.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 font-mono">
                    <span>Kode Pos: <strong>{area.postalCode || 64315}</strong></span>
                    <span>•</span>
                    <span>ID: {area.id}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-400">
              Tidak ada lokasi Biteship ditemukan untuk "{query}".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
