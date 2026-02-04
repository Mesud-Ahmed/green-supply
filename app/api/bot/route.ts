import { Telegraf, Markup } from 'telegraf';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const bot = new Telegraf(process.env.BOT_TOKEN!);

// Helper to update progress in Supabase
async function updateState(userId: string, data: any) {
  await supabase.from('bot_submissions').upsert({ user_id: userId, ...data });
}

// 1. Start Command
bot.command('start', (ctx) => ctx.reply(
  'Welcome! / ሰላም!\nUse /sell to submit a product.\nምርቶችዎን ለመሸጥ 👉 /sell የሚለውን ይጫኑ።'
));

// 2. Start Selling Process (UPDATED for Returning Users)
bot.command('sell', async (ctx) => {
  const userId = String(ctx.from.id);
  
  // Check if we already know this seller
  const { data: existingState } = await supabase
    .from('bot_submissions')
    .select('*')
    .eq('user_id', userId)
    .single();

  // IF seller exists and has a shop name, skip registration
  if (existingState && existingState.shop_name) {
    await updateState(userId, { 
      step: 'TITLE', 
      title: null, 
      price: null, 
      description: null, 
      material: null, 
      min_order: null 
    });
    return ctx.reply(`Welcome back, ${existingState.shop_name}!\n\nLet's add a new product. What is the Product Title? (e.g., 2kg Kraft Bag)\n(እንኳን ደህና መጡ! የምርቱ ስም ምንድነው?)`);
  }

  // ELSE start fresh
  await updateState(userId, { step: 'PHONE', shop_name: null, title: null, price: null });
  ctx.reply("Let's start! What is your Phone Number? \n(የስልክ ቁጥርዎን ያስገቡ)");
});

// 3. The Main Logic Loop
bot.on(['text', 'photo'], async (ctx: any) => {
  const userId = String(ctx.from.id);
  
  // Skip if it's a command like /sell or /start
  if (ctx.message.text && ctx.message.text.startsWith('/')) {
    if (ctx.message.text === '/done') return handleDone(ctx, userId);
    // Add a reset option just in case they want to change shop details
    if (ctx.message.text === '/reset') return handleReset(ctx, userId);
    return; 
  }

  // Fetch current state
  const { data: state } = await supabase.from('bot_submissions').select('*').eq('user_id', userId).single();
  
  if (!state) return; // Ignore random messages if not in "sell" mode

  const text = ctx.message.text;

  // --- STEP 1: PHONE ---
  if (state.step === 'PHONE') {
    await updateState(userId, { phone_number: text, step: 'SHOP_NAME' });
    return ctx.reply("What is your Shop Name? \n(የሱቅዎ ስም ምንድነው?)");
  }

  // --- STEP 2: SHOP NAME ---
  if (state.step === 'SHOP_NAME') {
    await updateState(userId, { shop_name: text, step: 'LOCATION' });
    return ctx.reply("Where is your Shop Location? (e.g., Merkato) \n(የሱቅዎ አድራሻ ወይንም አካባቢ?)");
  }

  // --- STEP 3: LOCATION ---
  if (state.step === 'LOCATION') {
    await updateState(userId, { location: text, step: 'TITLE' });
    return ctx.reply("What is the Product Title? (e.g., 2kg Kraft Bag) \n(የምርቱ ስም ምንድነው?)");
  }

  // --- STEP 4: TITLE ---
  if (state.step === 'TITLE') {
    await updateState(userId, { title: text, step: 'DESCRIPTION' });
    return ctx.reply("Add a short Description (Optional). Type /skip if none. \n(ስለ ምርቱ አጭር መግለጫ ያስገቡ, መግለጫ የማይፈልጉ ከሆነ 👉 /skip የሚለውን ይጫኑ)");
  }

  // --- STEP 5: DESCRIPTION ---
  if (state.step === 'DESCRIPTION') {
    const desc = text.toLowerCase() === '/skip' ? "" : text;
    await updateState(userId, { description: desc, step: 'MATERIAL' });
    
    // Show buttons for Material
    return ctx.reply("Choose the Material Type: \n(የምርቱ አይነት ይምረጡ)", Markup.keyboard([
      ['Paper (የወረቀት)', 'Cloth (የጨርቅ)'],
      ['Canvas (የሸራ)', 'Jute (የቃጫ )'],
      ['Other (ሌላ)']
    ]).oneTime().resize());
  }

  // --- STEP 6: MATERIAL ---
  if (state.step === 'MATERIAL') {
    await updateState(userId, { material: text, step: 'MIN_ORDER' });
    return ctx.reply("What is the Minimum Order Quantity? \n(ዝቅተኛ የትዕዛዝ መጠን ስንት ነው?)", Markup.removeKeyboard());
  }

  // --- STEP 7: MIN ORDER ---
  if (state.step === 'MIN_ORDER') {
    await updateState(userId, { min_order: text, step: 'PRICE' });
    return ctx.reply("What is the Price per Unit (ETB)? \n(የአንዱ ዋጋ ስንት ነው?)");
  }

  // --- STEP 8: PRICE ---
  if (state.step === 'PRICE') {
    await updateState(userId, { price: text, step: 'PHOTO' });
    
    // SEND SUMMARY TO ADMIN
    const summary = `
🔔 **NEW SELLER SUBMISSION**
👤 **User:** @${ctx.from.username || 'unknown'}
📞 **Phone:** ${state.phone_number}
🏪 **Shop:** ${state.shop_name}
📍 **Loc:** ${state.location}
---------------------------
🏷️ **Item:** ${state.title}
📝 **Desc:** ${text} 
🧵 **Mat:** ${state.material}
📦 **Min:** ${state.min_order}
💰 **Price:** ${text} ETB
    `;
    await bot.telegram.sendMessage(process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_ID!, summary);

    return ctx.reply("Great! Now send me Photos of the product.\n(የምርቱን ፎቶዎች ይላኩ)\n\n📸 You can send multiple! Type /done when finished.\n(በቂ ፎቶ ከላኩ በኋላ 👉 /done ብለው ይፃፉ)");
  }

  // --- STEP 9: PHOTOS (Loop) ---
  if (state.step === 'PHOTO') {
    if (ctx.message.photo) {
      const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
      await bot.telegram.sendPhoto(process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_ID!, photoId, {
        caption: `📸 Photo from ${state.shop_name}`
      });
      
      return ctx.reply("Photo received! Send another or type /done to finish.\n(ፎቶው ደርሷል! ሌላ ፎቶ ይላኩ ወይም ለመጨረስ 👉 /done ብለው ይፃፉ)");
    } else {
      return ctx.reply("Please send a photo or type /done.\n(እባክዎ ፎቶ ይላኩ ወይም 👉 /done ብለው ይፃፉ)");
    }
  }
});

// 4. Handle Finish (UPDATED: Don't delete, just reset product fields)
async function handleDone(ctx: any, userId: string) {
  await updateState(userId, { 
    step: 'IDLE', // Set to IDLE so they aren't stuck in "sell" mode
    title: null, 
    price: null, 
    description: null, 
    material: null, 
    min_order: null 
    // We KEEP phone, shop_name, and location!
  });
  
  await ctx.reply("✅ Submission Complete! \nAdmin will review your product soon.\n(ምርቱ ለግምገማ ተልኳል! እናመሰግናለን!)");
}

// Optional: Allow them to change shop info if they want
async function handleReset(ctx: any, userId: string) {
  await supabase.from('bot_submissions').delete().eq('user_id', userId);
  await ctx.reply("Settings reset. Press /sell to start from the beginning.");
}

// 5. Next.js Route Handler
export async function POST(req: Request) {
  try {
    const body = await req.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}