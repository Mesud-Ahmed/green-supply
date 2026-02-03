"use client";

import { ShoppingBag, Settings } from "lucide-react";
import Link from "next/link";

export default function Header({ isAdmin }: { isAdmin: boolean }) {
  return (
    <header className=" text-white p-5  sticky top-0 z-50">
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <ShoppingBag
              className="text-green-300"
              fill="currentColor"
              size={24}
            />
            EcoPack <span className="text-green-200">Addis</span>
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <p className="text-sm text-green-100/90 leading-relaxed max-w-md">
    Access Addis Ababa’s largest selection of eco-friendly wholesale bags with transparent pricing and direct seller contact.
  </p>
          </div>
        </div>

        {isAdmin && (
          <Link
            href="/admin"
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/20 shadow-lg backdrop-blur-md"
          >
            <Settings size={20} className="text-white" />
          </Link>
        )}
      </div>
    </header>
  );
}
