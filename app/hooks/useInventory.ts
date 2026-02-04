import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useInventory(isAdmin: boolean) {
  const [products, setProducts] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]); // New state for sellers
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  // 1. Fetch both Products and Sellers
  const fetchData = async () => {
    if (!isAdmin) return;

    // Fetch Products
    const { data: prodData } = await supabase
      .from("products")
      .select("*, sellers(name)") // Get seller name for the inventory list
      .order("created_at", { ascending: false });
    
    // Fetch Sellers
    const { data: sellData } = await supabase
      .from("sellers")
      .select("*")
      .order("name", { ascending: true });

    if (prodData) setProducts(prodData);
    if (sellData) setSellers(sellData);
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  // 2. New Logic: Create a Seller
  const createSeller = async (sellerData: { name: string; phone_number: string; location: string }) => {
    setStatus("Creating seller...");
    const { data, error } = await supabase
      .from("sellers")
      .insert([sellerData])
      .select();

    if (error) {
      setStatus("Error: " + error.message);
      return { data: null, error };
    }

    await fetchData(); // Refresh the seller dropdown list
    setStatus("Seller added successfully!");
    return { data: data[0], error: null };
  };

  // 3. Updated Upload Logic (handles dynamic seller_id)
  const createProduct = async (formData: any, files: File[]) => {
    if (!formData.seller_id) {
      setStatus("Error: Please select a seller.");
      return false;
    }

    setUploading(true);
    setStatus("Uploading images...");

    try {
      const imageUrls: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: upErr } = await supabase.storage
          .from("bag-images")
          .upload(fileName, file);
        if (upErr) throw upErr;

        const { data } = supabase.storage
          .from("bag-images")
          .getPublicUrl(fileName);
        imageUrls.push(data.publicUrl);
      }

      const { error: dbErr } = await supabase.from("products").insert([
        {
          ...formData,
          price_per_unit: parseFloat(formData.price_per_unit),
          min_order_qty: parseInt(formData.min_order_qty),
          seller_id: parseInt(formData.seller_id), // Now dynamic from your form
          image_url: imageUrls,
        },
      ]);

      if (dbErr) throw dbErr;

      setStatus("Success! Product is live.");
      fetchData(); // Refresh everything
      return true;
    } catch (error: any) {
      setStatus("Error: " + error.message);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    if (confirm("Delete this product?")) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) fetchData();
    }
  };

  return {
    products,
    sellers,      // Exported for your dropdown
    uploading,
    status,
    createProduct,
    createSeller, // Exported for your "New Seller" modal
    deleteProduct,
    setStatus,
  };
}