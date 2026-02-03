import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useMarketplace() {
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data: prodData } = await supabase
      .from("products")
      .select(`*, sellers(name, phone_number, location, is_verified)`);
    
    const { data: revData } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (prodData) setProducts(prodData);
    if (revData) setReviews(revData);
    setLoading(false);
  };

  const submitReview = async (productId: number, comment: string, userName: string) => {
    const { error } = await supabase.from("reviews").insert([{
      product_id: productId,
      user_name: userName,
      rating: 5,
      comment: comment,
    }]);
    if (!error) await fetchData(); // Refresh data
    return !error;
  };

  useEffect(() => { fetchData(); }, []);

  return { products, reviews, loading, submitReview };
}