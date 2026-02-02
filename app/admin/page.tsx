"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ShieldAlert, PlusCircle, CheckCircle2 } from "lucide-react";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    price_per_unit: "",
    min_order_qty: "100",
    material_type: "Paper",
    seller_id: "1",
    images_text: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      const user = tg.initDataUnsafe?.user;
      if (user && String(user.id) === process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_ID) {
        setIsAdmin(true);
      }
    }
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Uploading...");

    const imageUrlArray = formData.images_text
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url !== "");

    const { error } = await supabase.from("products").insert([
      {
        title: formData.title,
        price_per_unit: parseFloat(formData.price_per_unit),
        min_order_qty: parseInt(formData.min_order_qty),
        material_type: formData.material_type,
        seller_id: parseInt(formData.seller_id),
        image_url: imageUrlArray,
      },
    ]);

    if (error) {
      setStatus("Error: " + error.message);
    } else {
      setStatus("Success! Product added.");
      setFormData({ ...formData, title: "", price_per_unit: "", images_text: "" });
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-900 font-bold">Verifying...</div>;

  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
        <ShieldAlert size={64} className="text-red-600 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-600 mt-2">Only the store owner can access this page.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white p-6 pb-20">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2 mb-8">
          <PlusCircle className="text-green-600" size={28} /> Add Product
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Product Title</label>
            <input
              required
              className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-900 font-medium focus:border-green-600 focus:ring-0 outline-none transition-colors"
              placeholder="e.g., 2kg Kraft Paper Bag"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Price (ETB)</label>
              <input
                required
                type="number"
                step="0.01"
                className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-900 font-medium outline-none focus:border-green-600"
                placeholder="5.50"
                value={formData.price_per_unit}
                onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Min Order</label>
              <input
                required
                type="number"
                className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-900 font-medium outline-none focus:border-green-600"
                value={formData.min_order_qty}
                onChange={(e) => setFormData({ ...formData, min_order_qty: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Material Type</label>
            <select
              className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-900 font-bold outline-none focus:border-green-600 appearance-none"
              value={formData.material_type}
              onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
            >
              <option value="Paper">Paper</option>
              <option value="Cloth">Cloth</option>
              <option value="Non-Woven">Non-Woven</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Image URLs</label>
            <textarea
              className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-900 font-medium outline-none h-32 text-sm focus:border-green-600"
              placeholder="Paste image links here, separated by commas..."
              value={formData.images_text}
              onChange={(e) => setFormData({ ...formData, images_text: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-green-100 active:scale-95 transition-all text-lg"
          >
            {status === "Uploading..." ? "Listing..." : "List Product Now"}
          </button>

          {status && (
            <div className={`mt-6 p-4 rounded-2xl text-center font-bold border-2 ${
              status.includes("Error") 
              ? "bg-red-50 border-red-200 text-red-700" 
              : "bg-green-50 border-green-200 text-green-700"
            }`}>
              {status}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}