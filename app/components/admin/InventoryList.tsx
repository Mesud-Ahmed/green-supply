import { X, ShieldAlert } from "lucide-react";

export default function InventoryList({ products, onDelete }: any) {
  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-xl font-black mb-6 flex items-center gap-2">
        <ShieldAlert className="text-orange-500" size={20} /> Manage Inventory
      </h2>
      <div className="space-y-4">
        {products.map((p: any) => (
          <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                {p.image_url?.[0] && <img src={p.image_url[0]} className="w-full h-full object-cover" />}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{p.title}</p>
                <p className="text-xs text-gray-500">{p.price_per_unit} ETB</p>
              </div>
            </div>
            <button onClick={() => onDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
              <X size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}