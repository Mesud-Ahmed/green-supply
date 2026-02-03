"use client";

import { useState, useEffect } from "react";
import { useMarketplace } from "./hooks/useMarketplace";
import ProductCard from "./components/ProductCard";
import { ArrowUpDown } from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";

const CATEGORIES = ["All", "Paper(የወረቀት)", "Cloth(የጨርቅ)", "Canvas(የሸራ)", "Jute(የቃጫ )", "Other"];

export default function Marketplace() {
  const { products, reviews, loading, submitReview } = useMarketplace();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortAscending, setSortAscending] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      if (String(tg.initDataUnsafe?.user?.id) === process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_ID) {
        setIsAdmin(true);
      }
    }
  }, []);

  const displayedProducts = products
    .filter(p => selectedCategory === "All" || p.material_type === selectedCategory)
    .sort((a, b) => sortAscending ? a.price_per_unit - b.price_per_unit : b.price_per_unit - a.price_per_unit);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-green-800 text-white p-5  sticky top-0 z-50 shadow-md">
        <Header isAdmin={isAdmin} />

        <div className="flex justify-between items-center">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} 
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${selectedCategory === cat ? "bg-white text-green-800" : "bg-green-700/50 text-green-100"}`}>
                {cat}
              </button>
            ))}
          </div>
          <button onClick={() => setSortAscending(!sortAscending)} className="flex items-center gap-1 text-[10px] bg-black/20 p-2 rounded-lg ml-2">
            <h2>price</h2>
            <ArrowUpDown size={12} /> {sortAscending ? "Lowest First" : "Highest First"}
          </button>
        </div>
      </header>

      <div className="p-4 grid gap-4">
        {loading ? (
          <div className="text-center py-20 text-gray-400 font-bold animate-pulse">Loading Market...</div>
        ) : (
          displayedProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              reviews={reviews} 
              onReviewSubmit={submitReview} 
            />
          ))
        )}
      </div>
      <Footer />
    </main>
  );
}