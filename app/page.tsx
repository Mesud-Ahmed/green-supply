"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Phone, MapPin, ShoppingBag, ArrowUpDown, Filter } from "lucide-react";
import Link from "next/link";
import { Settings } from "lucide-react";

const CATEGORIES = ["All", "Paper", "Cloth", "Canvas", "Jute", "Other"];

export default function Marketplace() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // 2. State for Filters & Sorting
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortAscending, setSortAscending] = useState(true); // true = Low to High
  // 1. State for storing reviews (put this with your other states)
  const [reviews, setReviews] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [activeProductId, setActiveProductId] = useState<number | null>(null);

  // 2. Fetch reviews from Supabase
  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setReviews(data);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // 3. Submit a new review
  const submitReview = async (productId: number) => {
    if (!newComment.trim()) return;

    // Get name from Telegram or use "Customer"
    const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
    const userName = tgUser?.first_name || "Guest User";

    const { error } = await supabase.from("reviews").insert([
      {
        product_id: productId,
        user_name: userName,
        rating: 5, // Defaulting to 5 for now to keep it simple
        comment: newComment,
      },
    ]);

    if (!error) {
      setNewComment("");
      fetchReviews(); // Refresh
    }
  };

  useEffect(() => {
    // Initialize Telegram
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      const user = tg.initDataUnsafe?.user;
      tg.ready();
      tg.expand();

      if (
        user &&
        String(user.id) === process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_ID
      ) {
        setIsAdmin(true);
      }
    }

    // Fetch Data
    async function fetchData() {
      const { data, error } = await supabase
        .from("products")
        .select(`*, sellers(name, phone_number, location, is_verified)`);

      if (!error && data) setProducts(data);
      setLoading(false);
    }

    fetchData();
  }, []);

  // 3. THE LOGIC: Filter -> Then Sort
  const displayedProducts = products
    .filter((product) => {
      // If "All", return everything. Otherwise, match the material_type.
      return (
        selectedCategory === "All" || product.material_type === selectedCategory
      );
    })
    .sort((a, b) => {
      // Sort by Price
      return sortAscending
        ? a.price_per_unit - b.price_per_unit // Low to High
        : b.price_per_unit - a.price_per_unit; // High to Low
    });

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <header className="bg-green-700 text-white p-5 rounded-b-3xl shadow-md sticky top-0 z-50">
        {/* TOP ROW: Logo and Admin Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="text-green-300" /> Ethio Paper Bags
          </h1>

          {isAdmin && (
            <Link
              href="/admin"
              className="p-2 bg-green-800/50 hover:bg-green-800 rounded-full transition-all border border-green-600 shadow-inner"
            >
              <Settings size={20} className="text-green-200" />
            </Link>
          )}
        </div>

        {/* CONTROLS ROW: Filters & Sort */}
        <div className="flex justify-between items-center mt-5">
          {/* A. Category Filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-white text-green-700 shadow-sm"
                    : "bg-green-800/40 text-green-100 border border-green-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* B. Sort Toggle */}
          <button
            onClick={() => setSortAscending(!sortAscending)}
            className="flex items-center gap-1 text-xs font-medium bg-green-900/30 px-3 py-1.5 rounded-lg border border-green-600 ml-2 whitespace-nowrap"
          >
            <h2>price</h2>
            <ArrowUpDown size={12} />
            {sortAscending ? "Lowest first" : "Highest first"}
          </button>
        </div>
      </header>

      {/* PRODUCT GRID */}
      <div className="p-4 grid gap-4">
        {loading ? (
          <div className="text-center py-10 text-gray-400">
            Loading market...
          </div>
        ) : displayedProducts.length > 0 ? (
          displayedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
            >
              <div className="relative group">
                {/* Horizontal Scroll Container */}
                <div className="h-48 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide bg-gray-100">
                  {product.image_url && product.image_url.length > 0 ? (
                    product.image_url.map((url: string, index: number) => (
                      <div
                        key={index}
                        className="min-w-full h-full snap-center flex-shrink-0"
                      >
                        <img
                          src={url}
                          alt={`${product.title} - ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="min-w-full flex items-center justify-center h-full text-gray-300">
                      <ShoppingBag size={48} className="opacity-10" />
                    </div>
                  )}
                </div>

                {/* Price Tag Overlay (Top Right) */}
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-bold z-10">
                  {product.price_per_unit} ETB
                </div>

                {/* SWIPE INDICATORS (The Dots) */}
                {product.image_url?.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
                    {product.image_url.map((_: any, i: number) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-white/60"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* DETAILS SECTION */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="font-bold text-gray-800 text-lg leading-tight">
                      {product.title}
                    </h2>
                    {product.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                  Min Order: {product.min_order_qty} pcs
                </span>

                <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={12} />
                    {product.sellers.location}
                  </div>

                  <a
                    href={`tel:${product.sellers.phone_number}`}
                    className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 active:bg-green-100"
                  >
                    <Phone size={14} /> Call
                  </a>
                </div>
              </div>

              {/* REVIEWS SECTION */}
              <div className="mt-4 pt-4 border-t border-gray-50">
                <button
                  onClick={() =>
                    setActiveProductId(
                      activeProductId === product.id ? null : product.id,
                    )
                  }
                  className="text-xs font-bold text-gray-400 flex items-center gap-1 hover:text-green-600 transition-colors"
                >
                  💬 {reviews.filter((r) => r.product_id === product.id).length}{" "}
                  Reviews
                </button>

                {activeProductId === product.id && (
                  <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2">
                    {/* Existing Reviews */}
                    <div className="max-h-32 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                      {reviews
                        .filter((r) => r.product_id === product.id)
                        .map((rev, i) => (
                          <div key={i} className="bg-gray-50 p-2 rounded-lg">
                            <p className="text-[10px] font-black text-gray-900">
                              {rev.user_name}
                            </p>
                            <p className="text-xs text-gray-600 leading-tight">
                              {rev.comment}
                            </p>
                          </div>
                        ))}
                    </div>

                    {/* Write a Review Input */}
                    <div className="flex gap-2">
                      <input
                        placeholder="Write a comment..."
                        className="flex-1 bg-gray-100 border-none rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-green-500"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button
                        onClick={() => submitReview(product.id)}
                        className="bg-green-600 text-white px-3 py-2 rounded-xl text-xs font-bold active:scale-90 transition-transform"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>No {selectedCategory} bags found.</p>
          </div>
        )}
      </div>
    </main>
  );
}
