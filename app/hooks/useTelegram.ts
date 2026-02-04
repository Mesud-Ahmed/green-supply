"use client";

import { useEffect, useState } from "react";

export function useTelegram() {
  const [user, setUser] = useState<any>(null);
  const [webApp, setWebApp] = useState<any>(null);

  useEffect(() => {
    // 1. Check if Telegram WebApp exists
    const tg = (window as any).Telegram?.WebApp;
    
    if (tg) {
      tg.ready(); // Signal that the app is fully loaded
      tg.expand(); // Make the app take up the full Telegram screen
      
      setWebApp(tg);
      setUser(tg.initDataUnsafe?.user || null);
    }
  }, []);

  return {
    tg: webApp,
    user,
    // Provide clean helpers for the rest of your app
    userName: user?.first_name || "Guest User",
    userId: user?.id ? String(user.id) : null,
  };
}