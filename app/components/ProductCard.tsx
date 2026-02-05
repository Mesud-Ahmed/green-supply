"use client";

import { useState } from "react";
import { MapPin, Phone, ShoppingBag, X } from "lucide-react";
import ReviewSection from "./ReviewSection";

export default function ProductCard({ product, reviews, onReviewSubmit, onReviewDelete }: any) {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group/card">
      {/* 1. IMAGE SECTION */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden cursor-zoom-in">
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full">
          {product.image_url?.length > 0 ? (
            product.image_url.map((url: string, index: number) => (
              <img
                key={index}
                src={url}
                alt={`${product.title} - ${index}`}
                className="min-w-full h-full object-cover snap-center transition-transform duration-500 group-hover/card:scale-105"
                onClick={() => setFullscreenImage(url)}
              />
            ))
          ) : (
            <div className="min-w-full flex items-center justify-center h-full text-gray-300 bg-gray-50">
              <ShoppingBag size={48} className="opacity-20" />
            </div>
          )}
        </div>

        {/* Price Tag Overlay - Glassmorphic */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 text-white px-3 py-1.5 rounded-full z-10 shadow-lg">
          <span className="text-xs font-medium opacity-80 mr-1">ETB</span>
          <span className="text-sm font-bold tracking-wide">{product.price_per_unit}</span>
        </div>

        {/* Swipe Indicators */}
        {product.image_url?.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10">
            {product.image_url.map((_: any, i: number) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-sm" />
            ))}
          </div>
        )}
      </div>

      {/* 2. DETAILS SECTION */}
      <div className="p-5">
        <div className="mb-3">
            <h2 className="font-bold text-gray-900 text-lg leading-tight tracking-tight group-hover/card:text-green-700 transition-colors">
            {product.title}
            </h2>
            <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">
            {product.description}
            </p>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
            <MapPin size={12} className="text-gray-400" /> 
            {product.sellers?.location || "Addis Ababa"}
          </div>
          <a 
            href={`tel:${product.sellers?.phone_number}`} 
            className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 active:scale-95 hover:shadow-lg hover:shadow-green-500/20 transition-all"
          >
            <Phone size={14} className="fill-current" /> 
            <span>Call</span>
          </a>
        </div>

        <ReviewSection 
          productId={product.id} 
          reviews={reviews.filter((r: any) => r.product_id === product.id)} 
          onSubmit={onReviewSubmit} 
          onDelete={onReviewDelete}
        />
      </div>

      {/* 3. LIGHTBOX MODAL */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setFullscreenImage(null)}
        >
          <button className="absolute top-6 right-6 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md">
            <X size={24} />
          </button>
          <img 
            src={fullscreenImage} 
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain ring-1 ring-white/10"
            alt="Product preview"
          />
        </div>
      )}
    </div>
  );
}