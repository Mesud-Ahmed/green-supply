import { ShoppingBag } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-10 -mb-15 px-6 border-t border-gray-100 pt-8">
      <div className="text-center">
        <div className="flex justify-center gap-4 mb-4">
          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <ShoppingBag size={16} />
          </div>
        </div>
        <p className="text-sm font-bold text-gray-900">
          EcoPack Addis - Marketplace
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Connecting Addis Ababa's best sellers.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span>© 2026 EcoPack Addis</span>
          <span>•</span>
          {/* UPDATE: Change 'YourUsername' to your actual Telegram handle without the @ */}
          <a
            href="https://t.me/EcoPack_Addis"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 transition-colors"
          >
            
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
}
