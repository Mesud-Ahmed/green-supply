import { MapPin, Phone, ShoppingBag } from "lucide-react";
import ReviewSection from "./ReviewSection";

export default function ProductCard({ product, reviews, onReviewSubmit }: any) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Image Slider Logic stays here */}
      <div className="relative h-48 bg-gray-100">
        {product.image_url?.length > 0 ? (
          <img src={product.image_url[0]} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300"><ShoppingBag size={48} /></div>
        )}
        <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full font-bold">
          {product.price_per_unit} ETB
        </div>
      </div>

      <div className="p-4">
        <h2 className="font-bold text-gray-800 text-lg">{product.title}</h2>
        <p className="text-xs text-gray-500 line-clamp-2 mt-1">{product.description}</p>
        
        <div className="flex items-center justify-between mt-4 border-t pt-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={12} /> {product.sellers.location}
          </div>
          <a href={`tel:${product.sellers.phone_number}`} className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            <Phone size={14} /> Call
          </a>
        </div>

        <ReviewSection 
          productId={product.id} 
          reviews={reviews.filter((r: any) => r.product_id === product.id)} 
          onSubmit={onReviewSubmit} 
        />
      </div>
    </div>
  );
}