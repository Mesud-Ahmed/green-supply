"use client";

import { useState } from "react";
import { MapPin, Phone, ShoppingBag, X } from "lucide-react";
import ReviewSection from "./ReviewSection";

export default function ProductCard({ product, reviews, onReviewSubmit,onReviewDelete }: any) {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* 1. IMAGE SECTION WITH SCROLL & CLICK-TO-ZOOM */}
      <div className="relative h-48 bg-gray-100 group cursor-zoom-in">
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full">
          {product.image_url?.length > 0 ? (
            product.image_url.map((url: string, index: number) => (
              <img
                key={index}
                src={url}
                alt={`${product.title} - ${index}`}
                className="min-w-full h-full object-cover snap-center"
                onClick={() => setFullscreenImage(url)}
              />
            ))
          ) : (
            <div className="min-w-full flex items-center justify-center h-full text-gray-300">
              <ShoppingBag size={48} />
            </div>
          )}
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-bold z-10">
          {product.price_per_unit} ETB
        </div>

        {/* Swipe Indicators */}
        {product.image_url?.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20 px-2 py-1 rounded-full">
            {product.image_url.map((_: any, i: number) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/60" />
            ))}
          </div>
        )}
      </div>

      {/* 2. DETAILS SECTION */}
      <div className="p-4">
        <h2 className="font-bold text-gray-800 text-lg">{product.title}</h2>
        <p className="text-xs text-gray-500 line-clamp-2 mt-1">{product.description}</p>
        
        <div className="flex items-center justify-between mt-4 border-t pt-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={12} /> {product.sellers?.location || "Addis Ababa"}
          </div>
          <a 
            href={`tel:${product.sellers?.phone_number}`} 
            className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 active:scale-95 transition-transform"
          >
            <Phone size={14} /> Call
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
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setFullscreenImage(null)}
        >
          <button className="absolute top-6 right-6 text-white p-2 bg-white/10 rounded-full">
            <X size={24} />
          </button>
          <img 
            src={fullscreenImage} 
            className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain"
            alt="Product preview"
          />
        </div>
      )}
    </div>
  );
}