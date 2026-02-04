import { Telegraf } from 'telegraf';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const bot = new Telegraf(process.env.BOT_TOKEN!);

// Helper to update progress in Supabase
async function updateState(userId: string, data: any) {
  await supabase.from('bot_submissions').upsert({ user_id: userId, ...data });
}

bot.command('start', (ctx) => ctx.reply('Welcome! Use /buy to shop or /sell to list items.'));

bot.command('sell', async (ctx) => {
  const userId = String(ctx.from.id);
  await updateState(userId, { step: 'NAME' });
  ctx.reply("Step 1: What is your **Shop Name**?");
});

bot.on('message', async (ctx: any) => {
  const userId = String(ctx.from.id);
  const text = ctx.message.text;

  // 1. Check if user is in the middle of a submission
  const { data: state } = await supabase.from('bot_submissions').select('*').eq('user_id', userId).single();
  if (!state || state.step === 'DONE') return;

  // 2. State Machine Logic
  if (state.step === 'NAME') {
    await updateState(userId, { shop_name: text, step: 'PRICE' });
    return ctx.reply("Step 2: What is the **Price per unit**?");
  }

  if (state.step === 'PRICE') {
    await updateState(userId, { price: text, step: 'PHOTO' });
    return ctx.reply("Step 3: Please send a **Photo** of the product.");
  }

  // Handle Photo Upload
  if (ctx.message.photo && state.step === 'PHOTO') {
    const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    
    // Send to YOU (The Admin)
    const summary = `🔔 **NEW SUBMISSION**\n🏪 Shop: ${state.shop_name}\n💰 Price: ${state.price} ETB\n👤 Seller: @${ctx.from.username || 'unknown'}`;
    await bot.telegram.sendMessage(process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_ID!, summary);
    await bot.telegram.sendPhoto(process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_ID!, photoId);

    // CLEANUP: Delete the row to save storage space
    await supabase.from('bot_submissions').delete().eq('user_id', userId);
    
    return ctx.reply("✅ Done! Your product was sent to the admin for review.");
  }
});

export async function POST(req: Request) {
  const body = await req.json();
  await bot.handleUpdate(body);
  return NextResponse.json({ ok: true });
}