import { Tag, Edit, Trash2 } from "lucide-react";

interface CategoriesTabProps {
  categories: any[];
  onEdit: (category: any) => void;
  onDelete: (id: number) => void;
}

export default function CategoriesTab({ categories, onEdit, onDelete }: CategoriesTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((c) => (
        <div
          key={c.id}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700 transition-all shadow-md"
        >
          <div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-red-500" />
              <h3 className="font-semibold text-white text-sm">{c.name}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Slug: <code className="text-slate-300">{c.slug}</code> • {c._count?.products || 0} Produk
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(c)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(c.id)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
