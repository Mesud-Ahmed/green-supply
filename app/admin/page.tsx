"use client";

import { useState } from "react";
import {
  ShieldAlert,
  PlusCircle,
  Upload,
  Loader2,
  UserPlus,
  X,
} from "lucide-react";
import { useAdminAuth } from "@/app/hooks/useAdminAuth";
import { useInventory } from "@/app/hooks/useInventory";
import ImageUploader from "@/app/components/admin/ImageUploader";
import InventoryList from "@/app/components/admin/InventoryList";

const INITIAL_FORM = {
  title: "",
  description: "",
  price_per_unit: "",
  min_order_qty: "100",
  material_type: "Paper",
  seller_id: "",
};

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const {
    products,
    sellers,
    uploading,
    status,
    createProduct,
    createSeller,
    deleteProduct,
  } = useInventory(isAdmin);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [files, setFiles] = useState<File[]>([]);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [newSeller, setNewSeller] = useState({
    name: "",
    phone_number: "",
    location: "",
  });

  const handleAddSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await createSeller(newSeller);
    if (!error) {
      setFormData({ ...formData, seller_id: data.id });
      setShowSellerModal(false);
      setNewSeller({ name: "", phone_number: "", location: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.seller_id)
      return alert("Please select or add a seller first!");
    const success = await createProduct(formData, files);
    if (success) {
      setFormData(INITIAL_FORM);
      setFiles([]);
    }
  };

  // --- RENDERING ---
  if (authLoading)
    return <div className="p-10 text-center font-bold">Verifying...</div>;
  if (!isAdmin)
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <ShieldAlert size={64} className="text-red-600 mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
      </div>
    );

  return (
    <main className="min-h-screen bg-white p-6 pb-20 max-w-md mx-auto">
      <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2 mb-8">
        <PlusCircle className="text-green-600" size={28} /> Add Product
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2 uppercase flex justify-between">
            Seller 
            <button type="button" onClick={() => setShowSellerModal(true)} className="text-green-600 flex items-center gap-1 normal-case text-xs">
              <UserPlus size={14}/> New Seller
            </button>
          </label>
          <select 
            required
            className="w-full text-black p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-green-600"
            value={formData.seller_id} 
            onChange={e => setFormData({...formData, seller_id: e.target.value})}
          >
            <option value="">Select a Seller</option>
            {sellers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.location})</option>)}
          </select>
        </div>
        
        <ImageUploader
          onFilesSelected={(newFiles) =>
            setFiles((prev) => [...prev, ...newFiles])
          }
          onClear={() => setFiles([])}
        />

        {/* 2. Text Inputs */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2 uppercase">
            Title
          </label>
          <input
            required
            className="w-full text-black p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-green-600"
            placeholder="e.g. 2kg Kraft Bag"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2 uppercase">
            Description
          </label>
          <textarea
            className="w-full text-black p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-medium outline-none focus:border-green-600 h-24 resize-none"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase">
              Price
            </label>
            <input
              required
              type="number"
              step="0.01"
              className="w-full text-black p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-green-600"
              value={formData.price_per_unit}
              onChange={(e) =>
                setFormData({ ...formData, price_per_unit: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase">
              Min Order
            </label>
            <input
              required
              type="number"
              className="w-full text-black p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-green-600"
              value={formData.min_order_qty}
              onChange={(e) =>
                setFormData({ ...formData, min_order_qty: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2 uppercase">
            Material
          </label>
          <select
            className="w-full text-black p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-green-600"
            value={formData.material_type}
            onChange={(e) =>
              setFormData({ ...formData, material_type: e.target.value })
            }
          >
            {["Paper", "Cloth", "Canvas", "Jute", "Other"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Submit Button & Status */}
        <button
          type="submit"
          disabled={uploading}
          className={`w-full text-white font-black py-5 rounded-2xl shadow-xl transition-all text-lg flex justify-center items-center gap-2 ${uploading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700 active:scale-95"}`}
        >
          {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
          {uploading ? "Uploading..." : "List Product"}
        </button>

        {status && (
          <div
            className={`p-4 rounded-xl text-center font-bold text-sm ${status.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
          >
            {status}
          </div>
        )}
      </form>
      {/* NEW SELLER MODAL */}
      {showSellerModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm relative">
            <button onClick={() => setShowSellerModal(false)} className="absolute top-4 right-4 text-gray-400"><X /></button>
            <h2 className="text-xl font-black mb-4">Add New Seller</h2>
            <form onSubmit={handleAddSeller} className="space-y-4">
              <input required placeholder="Seller Name" className="w-full p-4 bg-gray-50 rounded-xl text-black" value={newSeller.name} onChange={e => setNewSeller({...newSeller, name: e.target.value})} />
              <input required placeholder="Phone Number" className="w-full p-4 bg-gray-50 rounded-xl text-black" value={newSeller.phone_number} onChange={e => setNewSeller({...newSeller, phone_number: e.target.value})} />
              <input required placeholder="Location (e.g. Merkato)" className="w-full p-4 bg-gray-50 rounded-xl text-black" value={newSeller.location} onChange={e => setNewSeller({...newSeller, location: e.target.value})} />
              <button className="w-full bg-green-600 text-white py-4 rounded-xl font-bold">Create Seller</button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Inventory List Component */}
      <InventoryList products={products} onDelete={deleteProduct} />
    </main>
  );
}
