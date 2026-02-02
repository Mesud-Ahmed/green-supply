"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ShieldAlert, PlusCircle, CheckCircle2 } from "lucide-react";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    price_per_unit: "",
    min_order_qty: "100",
    material_type: "Paper",
    seller_id: "1", // You can later fetch and map your sellers here
    images_text: "", // We will split this into an array
  });

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      const user = tg.initDataUnsafe?.user;

      // Check if current user ID matches your Admin ID
      if (user && String(user.id) === process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_ID) {
        setIsAdmin(true);
      }
    }
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Uploading...");

    // Convert comma-separated string to Array for Supabase text[]
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

  if (loading) return <div className="p-10 text-center">Verifying...</div>;

  if (!isAdmin) {
  return (
    <div className="p-10 text-center">
      <h1 className="text-red-500 font-bold">Access Denied</h1>
      <div className="mt-4 p-4 bg-gray-100 rounded text-xs text-left overflow-auto">
        <p><strong>Your Current ID:</strong> {typeof window !== "undefined" ? (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || "Not in Telegram" : "Loading..."}</p>
        <p><strong>Expected ID:</strong> {process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_ID || "Not Set in Env"}</p>
      </div>
    </div>
  );
}

  return (
    <main className="min-h-screen bg-gray-50 p-6 pb-20">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
          <PlusCircle className="text-green-600" /> Add New Product
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
            <input
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="e.g., 2kg Kraft Paper Bag"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (ETB)</label>
              <input
                required
                type="number"
                step="0.01"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                placeholder="5.50"
                value={formData.price_per_unit}
                onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Order</label>
              <input
                required
                type="number"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                value={formData.min_order_qty}
                onChange={(e) => setFormData({ ...formData, min_order_qty: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material Type</label>
            <select
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              value={formData.material_type}
              onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
            >
              <option value="Paper">Paper</option>
              <option value="Cloth">Cloth</option>
              <option value="Non-Woven">Non-Woven</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs (comma separated)</label>
            <textarea
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none h-24 text-xs"
              placeholder="https://url1.jpg, https://url2.jpg"
              value={formData.images_text}
              onChange={(e) => setFormData({ ...formData, images_text: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 active:scale-95 transition-transform"
          >
            List Product
          </button>

          {status && (
            <div className={`mt-4 p-3 rounded-lg text-center text-sm font-medium ${
              status.includes("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
            }`}>
              {status}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}