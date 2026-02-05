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
    <main className="min-h-screen bg-gray-50 ">
      <header className="bg-emerald-950/85 backdrop-blur-xl border-b border-white/5 text-white p-4 sticky top-0 z-50 shadow-2xl transition-all duration-300">
        <Header isAdmin={isAdmin} />

        <div className="flex justify-between items-center mt-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mask-linear-fade">
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.id)} 
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 transform ${
                  selectedCategory === cat.id 
                    ? "bg-gradient-to-r from-green-400 to-green-500 text-green-950 shadow-lg shadow-green-500/30 scale-105" 
                    : "bg-white/5 text-green-100/70 hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/20"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setSortAscending(!sortAscending)} 
            className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 p-2.5 rounded-xl ml-3 transition-all border border-white/5 hover:border-white/20 text-green-100/80 hover:text-white shrink-0"
          >
            <span className="font-semibold tracking-wide">Price</span>
            <div className={`transition-transform duration-300 ${sortAscending ? "rotate-0" : "rotate-180"}`}>
               <ArrowUpDown size={14} /> 
            </div>
            {sortAscending ? "Low → High" : "High → Low"}
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