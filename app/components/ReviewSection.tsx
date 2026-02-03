"use client";

import { useState } from "react";

export default function ReviewSection({ productId, reviews, onSubmit }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");

  const handleSend = async () => {
    if (!comment.trim()) return;
    const success = await onSubmit(productId, comment, "Customer");
    if (success) setComment("");
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-bold text-gray-400 flex items-center gap-1 hover:text-green-600"
      >
        💬 {reviews?.length || 0} Reviews
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          <div className="max-h-32 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
            {reviews.map((rev: any, i: number) => (
              <div key={i} className="bg-gray-50 p-2 rounded-lg">
                <p className="text-[10px] font-black text-gray-900">{rev.user_name}</p>
                <p className="text-xs text-gray-600">{rev.comment}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              placeholder="Write a comment..."
              className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-green-500 text-black"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              onClick={handleSend}
              className="bg-green-600 text-white px-3 py-2 rounded-xl text-xs font-bold active:scale-95"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}