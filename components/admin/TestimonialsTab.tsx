import { Edit, Trash2 } from "lucide-react";

interface TestimonialsTabProps {
  testimonials: any[];
  onEdit: (testimonial: any) => void;
  onDelete: (id: number) => void;
}

export default function TestimonialsTab({ testimonials, onEdit, onDelete }: TestimonialsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {testimonials.map((t) => (
        <div
          key={t.id}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] rounded-full font-semibold">
                {t.type}
              </span>
              <span className="text-[11px] text-slate-500">
                {new Date(t.createdAt).toLocaleDateString("id-ID")}
              </span>
            </div>

            <p className="text-xs text-slate-300 italic mb-4">"{t.review}"</p>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="font-semibold text-white text-xs">{t.name}</div>
              {t.role && <div className="text-[10px] text-slate-400">{t.role}</div>}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(t)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(t.id)}
                className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg cursor-pointer"
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
