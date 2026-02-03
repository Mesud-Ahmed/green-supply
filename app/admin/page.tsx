"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ShieldAlert, PlusCircle, Upload, X, Loader2 } from "lucide-react";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // New state for upload status
  const [status, setStatus] = useState("");

  // New State for Files
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    price_per_unit: "",
    min_order_qty: "100",
    material_type: "Paper",
    seller_id: "1", // Assuming you are Seller #1 for now
  });

  // 1. TELEGRAM AUTH CHECK
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      const user = tg.initDataUnsafe?.user;
      // Replace with your ID if needed, or keep using env var
      if (user && String(user.id) === process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_ID) {
        setIsAdmin(true);
      }
    }
    setLoading(false);
  }, []);

  // 2. HANDLE FILE SELECTION
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Update Files State
      setSelectedFiles((prev) => [...prev, ...newFiles]);

      // Create Previews for UI
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  // 3. REMOVE SELECTED IMAGE
  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // 4. MAIN SUBMIT LOGIC (The Magic Part)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setStatus("Uploading images...");

    try {
      const uploadedImageUrls: string[] = [];

      // A. LOOP AND UPLOAD TO STORAGE
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          // Create a unique name: timestamp-random.jpg
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${fileName}`; // Uploading to root of bucket

          const { error: uploadError } = await supabase.storage
            .from('bag-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Get the Public URL
          const { data } = supabase.storage
            .from('bag-images')
            .getPublicUrl(filePath);
          
          uploadedImageUrls.push(data.publicUrl);
        }
      }

      // B. INSERT INTO DATABASE
      const { error: dbError } = await supabase.from("products").insert([
        {
          title: formData.title,
          price_per_unit: parseFloat(formData.price_per_unit),
          min_order_qty: parseInt(formData.min_order_qty),
          material_type: formData.material_type,
          seller_id: parseInt(formData.seller_id),
          image_url: uploadedImageUrls, // The array of Supabase links
        },
      ]);

      if (dbError) throw dbError;

      // C. SUCCESS & RESET
      setStatus("Success! Product is live.");
      setFormData({ ...formData, title: "", price_per_unit: "" });
      setSelectedFiles([]);
      setPreviewUrls([]);
      
    } catch (error: any) {
      setStatus("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // --- RENDER ---

  if (loading) return <div className="p-10 text-center font-bold">Verifying...</div>;

  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert size={64} className="text-red-600 mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>This page is for the admin only.</p>
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
          
          {/* IMAGE UPLOAD UI */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
              Product Photos
            </label>
            
            {/* The Hidden Input + Big Button */}
            <input 
              type="file" 
              multiple 
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload"
              className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-green-500 transition-all cursor-pointer"
            >
              <Upload size={32} className="mb-2" />
              <span className="font-bold text-sm">Tap to Select Photos</span>
            </label>

            {/* Preview Grid */}
            {previewUrls.length > 0 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 flex-shrink-0">
                    <img src={url} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                    <button 
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Title</label>
            <input
              required
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-green-600 outline-none"
              placeholder="e.g., 2kg Kraft Paper Bag"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Price</label>
              <input
                required
                type="number"
                step="0.01"
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-green-600 outline-none"
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
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-green-600 outline-none"
                value={formData.min_order_qty}
                onChange={(e) => setFormData({ ...formData, min_order_qty: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Material</label>
            <select
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold focus:border-green-600 outline-none"
              value={formData.material_type}
              onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
            >
              <option value="Paper">Paper</option>
              <option value="Cloth">Cloth</option>
              <option value="Non-Woven">Non-Woven</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className={`w-full text-white font-black py-5 rounded-2xl shadow-xl transition-all text-lg flex justify-center items-center gap-2 ${
              uploading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 shadow-green-200 active:scale-95"
            }`}
          >
            {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
            {uploading ? "Uploading..." : "List Product"}
          </button>

          {status && (
            <div className={`p-4 rounded-xl text-center font-bold text-sm ${
              status.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}>
              {status}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}