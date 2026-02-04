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

  // UPDATED: Added userId to the submission
  const submitReview = async (
    productId: number,
    comment: string,
    userName: string,
    userId: string,
  ) => {
    const { error } = await supabase.from("reviews").insert([
      {
        product_id: productId,
        user_name: userName,
        user_id: userId, // Critical for knowing who can delete it
        rating: 5,
        comment: comment,
      },
    ]);

    if (error) {
      console.error("Review Submit Error:", error.message); // This will tell us the exact issue
      return false;
    }

    await fetchData();
    return true;
  };

  // NEW: Delete function
  const deleteReview = async (reviewId: number) => {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (!error) {
      // Optimistic UI update: remove from local state immediately
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } else {
      console.error("Error deleting review:", error.message);
    }
    return !error;
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { products, reviews, loading, submitReview, deleteReview };
}
