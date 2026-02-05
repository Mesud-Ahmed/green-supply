"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useTelegram } from "@/app/hooks/useTelegram";

export default function ReviewSection({ productId, reviews, onSubmit, onDelete }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const { userId, userName } = useTelegram();

  const handleSend = async () => {
    if (!comment.trim()) return;
    // Pass the real userName and userId to the submit function
    const success = await onSubmit(productId, comment, userName, userId);
    if (success) setComment("");
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs font-bold text-gray-500 hover:text-green-700 transition-colors p-2 rounded-lg hover:bg-gray-50 group"
      >
        <span className="flex items-center gap-2">
            <span className="bg-gray-100 p-1 rounded-md text-gray-400 group-hover:text-green-600 transition-colors">💬</span> 
            {reviews?.length || 0} Reviews
        </span>
        <span className={`transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}>›</span>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-300">
          <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1 scrollbar-hide">
            {reviews.length > 0 ? reviews.map((rev: any) => (
              <div key={rev.id} className="bg-gray-50 p-3 rounded-2xl rounded-tl-none ml-1 relative group hover:bg-gray-100 transition-colors border border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[10px] font-black text-gray-800 tracking-wide">{rev.user_name}</p>
                  
                  {String(rev.user_id) === String(userId) && (
                    <button 
                      onClick={() => onDelete(rev.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors bg-white p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 scale-90 hover:scale-105"
                      title="Delete Review"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">{rev.comment}</p>
              </div>
            )) : (
                <div className="text-center py-4 text-xs text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No reviews yet. Be the first!
                </div>
            )}
          </div>

          <div className="flex gap-2 items-end">
            <div className="relative flex-1">
                <input
                placeholder="Write a comment..."
                className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-xl px-4 py-2.5 text-xs outline-none border border-transparent focus:border-green-200 transition-all text-gray-800 placeholder:text-gray-400"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
            </div>
            <button
              onClick={handleSend}
              disabled={!comment.trim()}
              className="bg-green-600 disabled:bg-gray-200 text-white disabled:text-gray-400 w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-95 shadow-lg shadow-green-500/20 disabled:shadow-none"
            >
              <span className="text-lg leading-none mb-0.5">➤</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}