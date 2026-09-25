import { Tag, Edit, Trash2 } from "lucide-react";

interface CategoriesTabProps {
  categories: any[];
  onEdit: (category: any) => void;
  onDelete: (id: number) => void;
}

export default function CategoriesTab({ categories, onEdit, onDelete }: CategoriesTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
      {categories.map((c) => (
        <div
          key={c.id}
          className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between hover:border-gray-300 transition-all shadow-xs"
        >
          <div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-red-600" />
              <h3 className="font-bold text-gray-900 text-sm">{c.name}</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Slug: <code className="text-gray-700 bg-gray-100 px-1 py-0.5 rounded font-mono">{c.slug}</code> • {c._count?.products || 0} Produk
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(c)}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(c.id)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                (c._count?.products || 0) > 0
                  ? "text-gray-300 hover:text-red-400 hover:bg-red-50/50"
                  : "text-gray-400 hover:text-red-600 hover:bg-red-50"
              }`}
              title={
                (c._count?.products || 0) > 0
                  ? `Kategori sedang digunakan oleh ${c._count?.products} produk dan tidak dapat dihapus.`
                  : "Hapus Kategori"
              }
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
