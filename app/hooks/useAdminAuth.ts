import { useState, useEffect } from "react";

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      const user = tg.initDataUnsafe?.user;
      
      if (user && String(user.id) === process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_ID) {
        setIsAdmin(true);
      }
    }
    setLoading(false);
  }, []);

  return { isAdmin, loading };
}