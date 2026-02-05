import { ShoppingBag } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-12 bg-emerald-950 text-emerald-100/60 py-10 px-6 border-t border-white/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="relative text-center max-w-sm mx-auto">
        <div className="flex justify-center gap-4 mb-6">
          <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-900/50">
            <ShoppingBag size={20} fill="currentColor" />
          </div>
        </div>
        
        <h3 className="text-lg font-black text-white tracking-tight mb-2">
          EcoPack <span className="text-green-400">Addis</span>
        </h3>
        
        <p className="text-xs leading-relaxed max-w-xs mx-auto mb-8 font-medium">
          Connecting Addis Ababa&apos;s best eco-friendly packaging suppliers with businesses. 
        </p>

        <div className="flex flex-col items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-emerald-100/40">
          <div className="flex items-center gap-3">
             <span>© 2026 EcoPack Addis</span>
             <span className="w-1 h-1 bg-green-500 rounded-full"></span>
             <span>Ethiopia</span>
          </div>

          <a
            href="https://t.me/EcoPack_Addis"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 transition-colors border border-green-500/30 px-3 py-1.5 rounded-lg hover:bg-green-500/10"
          >
            Contact Support
          </a>
        </div>
      </div>
    </footer>
  );
}
