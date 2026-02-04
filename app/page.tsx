"use client";

import { useState, useEffect } from "react";
import { useMarketplace } from "./hooks/useMarketplace";
import ProductCard from "./components/ProductCard";
import { ArrowUpDown } from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useTelegram } from "./hooks/useTelegram"; // Import your new hook

// 1. Updated Category Structure
const CATEGORIES = [
  { id: "All", label: "All" },
  { id: "Paper", label: "Paper (የወረቀት)" },
  { id: "Cloth", label: "Cloth (የጨርቅ)" },
  { id: "Canvas", label: "Canvas (የሸራ)" },
  { id: "Jute", label: "Jute (የቃጫ)" },
  { id: "Other", label: "Other" },
];

export default function Marketplace() {
  const { products, reviews, loading, submitReview, deleteReview } = useMarketplace();
  const { userId } = useTelegram(); // Use your hook for admin check
  
  const [selectedCategory, setSelectedCategory] = useState("All"); // Stores the 'id'
  const [sortAscending, setSortAscending] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (userId === process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_ID) {
      setIsAdmin(true);
    }
  }, [userId]);

  // 2. Fixed Filtering Logic
  const displayedProducts = products
    .filter(p => selectedCategory === "All" || p.material_type === selectedCategory)
    .sort((a, b) => sortAscending 
      ? a.price_per_unit - b.price_per_unit 
      : b.price_per_unit - a.price_per_unit
    );

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-green-800 text-white p-5 sticky top-0 z-50 shadow-md">
        <Header isAdmin={isAdmin} />

        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.id)} // Set ID, not Label
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id 
                    ? "bg-white text-green-800 shadow-lg" 
                    : "bg-green-700/50 text-green-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setSortAscending(!sortAscending)} 
            className="flex items-center gap-1 text-[10px] bg-black/20 p-2 rounded-lg ml-2 hover:bg-black/30 transition-colors"
          >
            <span className="font-bold">Price</span>
            <ArrowUpDown size={12} /> 
            {sortAscending ? "Low" : "High"}
          </button>
        </div>
      </header>

      <div className="p-4 grid gap-4">
        {loading ? (
          <div className="text-center py-20 text-gray-400 font-bold animate-pulse">Loading Market...</div>
        ) : displayedProducts.length > 0 ? (
          displayedProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              reviews={reviews} 
              onReviewSubmit={submitReview} 
              onReviewDelete={deleteReview}
            />
          ))
        ) : (
          <div className="text-center py-20 text-gray-400 font-medium">
            No products found in this category.
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}