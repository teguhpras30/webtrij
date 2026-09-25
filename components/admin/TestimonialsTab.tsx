import { Edit, Trash2, User } from "lucide-react";

interface TestimonialsTabProps {
  testimonials: any[];
  onEdit: (testimonial: any) => void;
  onDelete: (id: number) => void;
}

export default function TestimonialsTab({ testimonials, onEdit, onDelete }: TestimonialsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
      {testimonials.map((t) => (
        <div
          key={t.id}
          className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-200 text-[10px] rounded-full font-semibold">
                {t.type}
              </span>
              <span className="text-[11px] text-gray-400 font-mono">
                {new Date(t.createdAt).toLocaleDateString("id-ID")}
              </span>
            </div>

            <p className="text-xs text-gray-700 italic mb-4">"{t.review}"</p>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              {t.avatar ? (
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 font-bold text-xs shrink-0">
                  {t.name?.[0] || <User className="w-4 h-4 text-gray-500" />}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="font-bold text-gray-900 text-xs truncate">{t.name}</div>
                {t.role && <div className="text-[10px] text-gray-500 truncate">{t.role}</div>}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEdit(t)}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Edit Testimoni"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(t.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Hapus Testimoni"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
