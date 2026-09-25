'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  RotateCcw,
  Maximize2,
  ZoomIn,
  ZoomOut,
  X,
  Check,
  Search,
  Crosshair,
  Compass,
  Move
} from 'lucide-react';

interface InteractiveMapPinpointProps {
  addressText?: string;
  initialLat?: number;
  initialLng?: number;
  onPinChange?: (lat: number, lng: number) => void;
}

export const InteractiveMapPinpoint: React.FC<InteractiveMapPinpointProps> = ({
  addressText = "Perumahan Graha Tanjung, CIKARANG PUSAT, KABUPATEN BEKASI, JAWA BARAT, 17530",
  initialLat = -6.3639,
  initialLng = 107.1724,
  onPinChange,
}) => {
  const [isManualSet, setIsManualSet] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(16);
  const [pinPos, setPinPos] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const zoomContainerRef = useRef<HTMLDivElement>(null);

  // Encoded address for Map query
  const searchAddress = addressText.trim()
    ? addressText
    : "Cikarang Pusat, Kabupaten Bekasi, Jawa Barat";
  const encodedAddress = encodeURIComponent(searchAddress);

  // Map Embed URL (iwloc=near suppresses redundant iframe pin)
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=m&z=${zoomLevel}&ie=UTF8&iwloc=near&output=embed`;

  // Computed Lat/Lng display
  const computedLat = (initialLat + (50 - pinPos.y) * 0.0004).toFixed(4);
  const computedLng = (initialLng + (pinPos.x - 50) * 0.0004).toFixed(4);

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsManualSet(false);
    setPinPos({ x: 50, y: 50 });
    setZoomLevel(16);
  };

  const handleConfirmLocation = () => {
    setIsZoomModalOpen(false);
  };

  // Move Pin position based on click/drag coordinates
  const updatePinPosition = (clientX: number, clientY: number, targetEl: HTMLDivElement) => {
    const rect = targetEl.getBoundingClientRect();
    const clickX = ((clientX - rect.left) / rect.width) * 100;
    const clickY = ((clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(5, Math.min(95, clickX));
    const clampedY = Math.max(5, Math.min(95, clickY));

    setPinPos({ x: clampedX, y: clampedY });
    setIsManualSet(true);

    if (onPinChange) {
      const newLat = parseFloat((initialLat + (50 - clampedY) * 0.0004).toFixed(4));
      const newLng = parseFloat((initialLng + (clampedX - 50) * 0.0004).toFixed(4));
      onPinChange(newLat, newLng);
    }
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updatePinPosition(e.clientX, e.clientY, e.currentTarget);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      updatePinPosition(e.clientX, e.clientY, e.currentTarget);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle Touch Drag for Mobile Screens
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      updatePinPosition(touch.clientX, touch.clientY, e.currentTarget);
    }
  };

  const displayLandmark = addressText.trim()
    ? addressText.length > 45
      ? addressText.substring(0, 45) + '...'
      : addressText
    : 'Pinpoint Alamat Pengiriman';

  return (
    <div className="space-y-1 font-sans">
      <div className="flex items-center justify-between text-[11px] text-gray-500 px-0.5">
        <span className="font-semibold text-gray-700 flex items-center gap-1 truncate max-w-[70%]">
          <Compass className="w-3.5 h-3.5 text-[#EE4D2D] shrink-0" />
          <span className="truncate">{displayLandmark}</span>
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {isManualSet && (
            <button
              type="button"
              onClick={handleReset}
              className="text-gray-500 hover:text-gray-800 flex items-center gap-1 font-bold text-[10px] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Pin</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsZoomModalOpen(true)}
            className="text-[#EE4D2D] hover:underline flex items-center gap-1 font-extrabold text-[10px] cursor-pointer"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Perbesar Peta & Geser Pin</span>
          </button>
        </div>
      </div>

      {/* MAP PREVIEW BOX (WITH INTERACTIVE OVERLAY FOR DRAGGING PIN) */}
      <div
        ref={containerRef}
        onClick={() => setIsZoomModalOpen(true)}
        className="rounded-lg border border-gray-300 overflow-hidden bg-slate-100 relative h-36 cursor-pointer select-none group shadow-inner transition-all hover:border-[#EE4D2D] hover:ring-2 hover:ring-orange-100"
      >
        {/* Live Map Iframe Embed */}
        <iframe
          title="Map Location Preview"
          width="100%"
          height="100%"
          src={mapEmbedUrl}
          className="w-full h-full border-0 pointer-events-none filter contrast-[1.05]"
          loading="lazy"
        />

        {/* Dynamic Red Map Pin Marker */}
        <div
          className="absolute z-30 transform -translate-x-1/2 -translate-y-full transition-all duration-75 pointer-events-none"
          style={{ left: `${pinPos.x}%`, top: `${pinPos.y}%` }}
        >
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#EE4D2D] text-white flex items-center justify-center shadow-2xl ring-2 ring-white animate-bounce">
              <MapPin className="w-5 h-5 fill-white/20" />
            </div>
            <div className="w-3.5 h-1.5 bg-black/40 rounded-full blur-[1px] mt-0.5" />
          </div>
        </div>

        {/* Floating Location Badge */}
        <div className="absolute top-2 left-2 z-20 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md shadow text-[10px] font-bold text-gray-800 flex items-center gap-1.5 max-w-[85%] truncate border border-gray-200">
          <span className={`w-2 h-2 rounded-full ${isManualSet ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          <span className="truncate">
            {isManualSet ? '📍 Pin Disesuaikan Manual' : `📍 ${displayLandmark}`}
          </span>
        </div>

        {/* Hover Click to Expand Banner */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-30">
          <span className="bg-white/95 text-gray-900 text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-lg border border-orange-200 flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-[#EE4D2D]" />
            <span>Klik untuk Perbesar & Geser Pin Manual</span>
          </span>
        </div>

        {/* Clean Footer Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between text-[9px] text-gray-700 bg-white/90 px-2.5 py-1 border-t border-gray-200">
          <span className="font-extrabold text-gray-800">Pinpoint Alamat Pengiriman</span>
          <span>GPS: {computedLat}, {computedLng}</span>
        </div>
      </div>

      {/* FULLSCREEN ZOOMED MAP MODAL (SUPPORT DIRECT CLICK & DRAG OVERLAY) */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 font-sans animate-in fade-in duration-150">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[88vh] max-h-[720px] border border-gray-200 relative">
            {/* Modal Header */}
            <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-orange-100 text-[#EE4D2D] flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                    <span>Penataan Titik Pinpoint Presisi Alamat</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1">
                    <span>Klik atau tahan & geser pin di area peta untuk penyesuaian manual</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsZoomModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Map Controls & Search Bar */}
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs z-10">
              <div className="relative w-full sm:w-96">
                <input
                  type="text"
                  readOnly
                  value={searchAddress}
                  className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 font-bold focus:outline-none shadow-xs truncate"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>

              {/* Zoom Controls & Reset Button */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="flex items-center bg-white border border-gray-300 rounded-xl overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(19, z + 1))}
                    className="p-2 hover:bg-gray-100 text-gray-700 font-bold border-r border-gray-200 cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <span className="px-3 font-mono text-[10px] text-gray-700 font-bold">Zoom {zoomLevel}x</span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(10, z - 1))}
                    className="p-2 hover:bg-gray-100 text-gray-700 font-bold border-l border-gray-200 cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Crosshair className="w-3.5 h-3.5 text-gray-500" />
                  <span>Reset Pin</span>
                </button>
              </div>
            </div>

            {/* MAP INTERACTIVE CANVAS BODY WITH TRANSPARENT INTERACTION OVERLAY */}
            <div
              ref={zoomContainerRef}
              className="flex-1 relative bg-slate-200 overflow-hidden select-none cursor-crosshair"
            >
              {/* Map Live Iframe Embed */}
              <iframe
                title="Map Interactive Zoomed View"
                width="100%"
                height="100%"
                src={mapEmbedUrl}
                className="w-full h-full border-0 filter contrast-[1.05] pointer-events-none"
              />

              {/* TRANSPARENT CLICK & DRAG OVERLAY LAYER */}
              <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={(e) => {
                  setIsDragging(true);
                  if (e.touches.length > 0) updatePinPosition(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget);
                }}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => setIsDragging(false)}
                className="absolute inset-0 z-20 bg-transparent cursor-crosshair"
              />

              {/* RED MAP PIN MARKER (SMOOTH ANIMATED DRAG & POSITIONING) */}
              <div
                className="absolute z-30 transform -translate-x-1/2 -translate-y-full pointer-events-none transition-all duration-75 ease-out"
                style={{ left: `${pinPos.x}%`, top: `${pinPos.y}%` }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#EE4D2D] text-white flex items-center justify-center shadow-2xl ring-4 ring-white animate-bounce">
                    <MapPin className="w-7 h-7 fill-white/20" />
                  </div>
                  <div className="w-6 h-2 bg-black/40 rounded-full blur-[2px] mt-1 animate-pulse" />
                </div>
              </div>

              {/* Floating Address Info Bubble */}
              <div
                className="absolute z-40 transform -translate-x-1/2 -translate-y-28 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-xl shadow-2xl border border-orange-200 text-xs font-extrabold text-gray-900 flex items-center gap-2 pointer-events-none max-w-md truncate"
                style={{ left: `${pinPos.x}%`, top: `${pinPos.y}%` }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#EE4D2D] animate-ping shrink-0" />
                <span className="truncate">
                  {isManualSet ? '📍 Titik Disesuaikan Manual' : `📍 Titik Pengiriman: ${searchAddress}`}
                </span>
              </div>

              {/* Top Control Instruction Banner */}
              <div className="absolute top-3 left-3 z-30 bg-gray-900/80 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl shadow text-xs font-semibold flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-[#EE4D2D]" />
                <span>Klik atau geser mouse di mana saja untuk memindahkan pin merah</span>
              </div>
            </div>

            {/* MODAL FOOTER CONFIRMATION BAR */}
            <div className="p-4 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
              <div className="text-xs text-gray-700 max-w-md truncate">
                <div className="font-extrabold text-gray-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#EE4D2D] shrink-0" />
                  <span>Kordinat GPS: Lat {computedLat}, Lng {computedLng}</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                  Alamat: {searchAddress}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsZoomModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLocation}
                  className="px-6 py-2.5 bg-[#EE4D2D] hover:bg-[#d73f21] text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Konfirmasi Lokasi Ini</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
