import { Info } from "lucide-react";

interface SlidesTabProps {
  slides: any[];
  onEdit: (slide: any) => void;
  onDelete: (id: number) => void;
}

export default function SlidesTab({ slides, onEdit, onDelete }: SlidesTabProps) {
  return (
    <div className="space-y-6">
      {/* Banner Specification Info Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">Syarat Wajib Ukuran & Resolusi Hero Banner</div>
            <div className="text-slate-400 mt-1">
              Resolusi Gambar Wajib: <span className="text-amber-400 font-semibold font-mono">1920 x 1080 px</span> • Ukuran File Maksimal: <span className="text-amber-400 font-semibold font-mono">1MB</span>. <span className="text-red-400 font-medium font-mono">(File yang tidak memenuhi syarat otomatis ditolak)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slides.map((s) => (
          <div
            key={s.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg"
          >
            <div className="h-40 relative bg-slate-950">
              <img
                src={s.desktopImage}
                alt={s.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/600x300?text=Desktop+Banner";
                }}
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] rounded-full text-slate-300 font-mono">
                Urutan: #{s.sortOrder}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-white text-base">{s.title}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{s.description}</p>

              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span
                  className={`px-2.5 py-0.5 rounded-full font-medium ${
                    s.isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {s.isActive ? "Aktif" : "Non-Aktif"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(s)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(s.id)}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
