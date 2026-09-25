import { Info } from "lucide-react";

interface SlidesTabProps {
  slides: any[];
  onEdit: (slide: any) => void;
  onDelete: (id: number) => void;
}

export default function SlidesTab({ slides, onEdit, onDelete }: SlidesTabProps) {
  return (
    <div className="space-y-6 font-sans">
      {/* Banner Specification Info Box */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-red-600 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm">Syarat Wajib Ukuran & Resolusi Hero Banner</div>
            <div className="text-gray-600 mt-1">
              Resolusi Gambar Wajib: <span className="text-amber-700 font-semibold font-mono">1920 x 1080 px</span> • Ukuran File Maksimal: <span className="text-amber-700 font-semibold font-mono">1MB</span>. <span className="text-red-600 font-medium font-mono">(File yang tidak memenuhi syarat otomatis ditolak)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slides.map((s) => (
          <div
            key={s.id}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs"
          >
            <div className="h-40 relative bg-gray-100">
              <img
                src={s.desktopImage}
                alt={s.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/600x300?text=Desktop+Banner";
                }}
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-md border border-gray-200 text-[11px] rounded-full text-gray-800 font-mono font-semibold shadow-xs">
                Urutan: #{s.sortOrder}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-gray-900 text-base">{s.title}</h3>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{s.description}</p>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span
                  className={`px-2.5 py-0.5 rounded-full font-medium ${
                    s.isActive
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {s.isActive ? "Aktif" : "Non-Aktif"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(s)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors cursor-pointer font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(s.id)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer font-medium"
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
