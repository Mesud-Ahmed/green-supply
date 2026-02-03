import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useInventory(isAdmin: boolean) {
  const [products, setProducts] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  // Fetch Inventory
  const fetchProducts = async () => {
    if (!isAdmin) return;
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data);
  };

  useEffect(() => { fetchProducts(); }, [isAdmin]);

  // Upload Logic
  const createProduct = async (formData: any, files: File[]) => {
    setUploading(true);
    setStatus("Uploading images...");

    try {
      const imageUrls: string[] = [];

      // 1. Upload Images
      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: upErr } = await supabase.storage.from("bag-images").upload(fileName, file);
        if (upErr) throw upErr;
        
        const { data } = supabase.storage.from("bag-images").getPublicUrl(fileName);
        imageUrls.push(data.publicUrl);
      }

      // 2. Insert into DB
      const { error: dbErr } = await supabase.from("products").insert([{
        ...formData,
        price_per_unit: parseFloat(formData.price_per_unit),
        min_order_qty: parseInt(formData.min_order_qty),
        seller_id: parseInt(formData.seller_id),
        image_url: imageUrls,
      }]);

      if (dbErr) throw dbErr;

      setStatus("Success! Product is live.");
      fetchProducts(); // Refresh list
      return true; // Success signal
    } catch (error: any) {
      setStatus("Error: " + error.message);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    if (confirm("Delete this product?")) {
      await supabase.from("products").delete().eq("id", id);
      fetchProducts();
    }
  };

  return { products, uploading, status, createProduct, deleteProduct, setStatus };
}