"use client";

import { ShoppingBag, Settings } from "lucide-react";
import Link from "next/link";

export default function Header({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="text-white w-full">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2.5 drop-shadow-sm">
            <div className="p-2 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg shadow-green-900/20">
              <ShoppingBag
                className="text-white"
                fill="currentColor"
                size={24}
              />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-green-100">
              EcoPack
            </span>
            <span className="text-green-300 font-bold">Addis</span>
          </h1>
          <div className="flex items-center gap-2 mt-2 ml-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_theme(colors.green.400)]"></span>
            <p className="text-sm font-medium text-green-100/80 leading-relaxed max-w-md tracking-wide">
              Addis Ababa’s premium wholesale hub
            </p>
          </div>
        </div>

        {isAdmin && (
          <Link
            href="/admin"
            className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 shadow-lg backdrop-blur-md active:scale-95 group"
          >
            <Settings size={22} className="text-green-100 group-hover:rotate-45 transition-transform duration-500" />
          </Link>
        )}
      </div>
    </div>
  );
}
