import { Telegraf, Markup } from 'telegraf';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const bot = new Telegraf(process.env.BOT_TOKEN!);

// --- 1. UTILS: Sanitization & Helpers ---
// Trims text and cuts it off if it's too long to prevent database errors
const sanitize = (text: string | undefined, maxLength: number) => {
  if (!text) return "";
  const clean = text.trim();
  return clean.length > maxLength ? clean.substring(0, maxLength) + "..." : clean;
};

// Helper to update progress in Supabase
async function updateState(userId: string, data: any) {
  await supabase.from('bot_submissions').upsert({ user_id: userId, ...data });
}

// --- 2. COMMANDS ---

// Start Command
bot.command('start', (ctx) => ctx.reply(
  'Welcome! / ሰላም!\n\n🛍️ Sell Products: /sell\n💬 Send Feedback: /feedback\n\nምርቶችን ለመሸጥ 👉 /sell \n አስተያየት ለመስጠት 👉 /feedback ይጫኑ'
));

// Feedback Command (New Feature)
bot.command('feedback', async (ctx) => {
  const userId = String(ctx.from.id);
  // Set state to FEEDBACK so the NEXT message they send is captured
  await updateState(userId, { step: 'FEEDBACK' });
  ctx.reply("Please write your question, feedback, or suggestion below:\n(እባክዎ ጥያቄዎን ወይም አስተያየትዎን ከታች ይፃፉ)");
});

// Sell Command
bot.command('sell', async (ctx) => {
  const userId = String(ctx.from.id);
  
  // Check if we already know this seller
  const { data: existingState } = await supabase.from('bot_submissions').select('*').eq('user_id', userId).single();

  // IF seller exists and has a shop name, skip registration
  if (existingState && existingState.shop_name) {
    await updateState(userId, { 
      step: 'TITLE', 
      title: null, price: null, description: null, material: null, min_order: null 
    });
    return ctx.reply(`Welcome back, ${existingState.shop_name}!\n\nLet's add a new product. What is the Product Title? (e.g., 2kg paper Bag)\n\nእንኳን ደህና መጡ! የምርቱ ስም ምንድነው?`);
  }

  // ELSE start fresh
  await updateState(userId, { step: 'PHONE', shop_name: null, title: null, price: null });
  ctx.reply("Let's start! What is your Phone Number? \n\n(የስልክ ቁጥርዎን ያስገቡ)");
});

// Reset Command (To clear shop info)
bot.command('reset', async (ctx) => {
  const userId = String(ctx.from.id);
  await supabase.from('bot_submissions').delete().eq('user_id', userId);
  ctx.reply("Settings reset. Press /sell to start from the beginning.");
});

// Done Command
bot.command('done', async (ctx) => {
    const userId = String(ctx.from.id);
    await handleDone(ctx, userId);
});


// --- 3. MAIN MESSAGE LOOP ---
bot.on(['text', 'photo'], async (ctx: any) => {
  const userId = String(ctx.from.id);
  
  const rawText = ctx.message.text || "";
  // A. IGNORE COMMANDS here (they are handled above)
 if (rawText.startsWith('/') && rawText.toLowerCase() !== '/skip') return;

  // B. FETCH STATE
  const { data: state } = await supabase.from('bot_submissions').select('*').eq('user_id', userId).single();
  
  // C. FILTER RANDOM CHATTER: If state is IDLE or missing, ignore the message
  if (!state || state.step === 'IDLE') return;



  // --- D. LOGIC FLOW ---

  // 1. HANDLE FEEDBACK
  if (state.step === 'FEEDBACK') {
    const feedbackMsg = sanitize(rawText, 1000); // Allow longer text for feedback
    
    // Forward to Admin
    await bot.telegram.sendMessage(process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_ID!, 
      `💡 **NEW FEEDBACK**\n👤 User: @${ctx.from.username || 'unknown'}\n📝 Msg: ${feedbackMsg}`
    );

    // Reset user to IDLE
    await updateState(userId, { step: 'IDLE' });
    return ctx.reply("Thank you! Your message has been sent to the admin.\n\nመልእክትዎ ተልኳል! እናመሰግናለን!");
  }

  // 2. HANDLE SELLING STEPS (With Sanitization)
  
  if (state.step === 'PHONE') {
    const phone = sanitize(rawText, 20);
    await updateState(userId, { phone_number: phone, step: 'SHOP_NAME' });
    return ctx.reply("What is your Shop Name? \n\nየሱቅዎ ስም ምንድነው?");
  }

  if (state.step === 'SHOP_NAME') {
    const shop = sanitize(rawText, 50); // Limit shop name to 50 chars
    await updateState(userId, { shop_name: shop, step: 'LOCATION' });
    return ctx.reply("Where is your Shop Location? (e.g., Merkato) \n\nየሱቅዎ አድራሻ ወይንም አካባቢ?");
  }

  if (state.step === 'LOCATION') {
    const loc = sanitize(rawText, 50);
    await updateState(userId, { location: loc, step: 'TITLE' });
    return ctx.reply("What is the Product Title? (e.g., 2kg Kraft Bag) \n\nየምርቱ ስም ምንድነው?");
  }

  if (state.step === 'TITLE') {
    const title = sanitize(rawText, 60);
    await updateState(userId, { title: title, step: 'DESCRIPTION' });
    return ctx.reply("Add a short Description (Optional). Type /skip if none. \n\nስለ ምርቱ አጭር መግለጫ ያስገቡ, መግለጫ የማይፈልጉ ከሆነ 👉 /skip የሚለውን ይጫኑ");
  }

  if (state.step === 'DESCRIPTION') {
    const descInput = sanitize(rawText, 300);
    const desc = descInput.toLowerCase() === '/skip' ? "" : descInput;
    
    await updateState(userId, { description: desc, step: 'MATERIAL' });
    return ctx.reply("Choose the Material Type: \n\nየምርቱ አይነት ይምረጡ", Markup.keyboard([
      ['Paper (የወረቀት)', 'Cloth (የጨርቅ)'],
      ['Canvas (የሸራ)', 'Jute (የቃጫ )'],
      ['Other (ሌላ)']
    ]).oneTime().resize());
  }

  if (state.step === 'MATERIAL') {
    // Validate that input is not too long (in case they type manually)
    const material = sanitize(rawText, 30);
    await updateState(userId, { material: material, step: 'MIN_ORDER' });
    return ctx.reply("What is the Minimum Order Quantity? \n\nዝቅተኛ የሚቀበሉት የትዕዛዝ መጠን ስንት ነው?", Markup.removeKeyboard());
  }

  if (state.step === 'MIN_ORDER') {
    const minOrder = sanitize(rawText, 20);
    await updateState(userId, { min_order: minOrder, step: 'PRICE' });
    return ctx.reply("What is the Price per Unit (ETB)? \n\nየአንዱ ዋጋ ስንት ነው?");
  }

  if (state.step === 'PRICE') {
    const price = sanitize(rawText, 20);
    await updateState(userId, { price: price, step: 'PHOTO' });
    
    // SEND SUMMARY TO ADMIN
    const summary = `
🔔 **NEW SELLER SUBMISSION**
👤 **User:** @${ctx.from.username || 'unknown'}
📞 **Phone:** ${state.phone_number}
🏪 **Shop:** ${state.shop_name}
📍 **Loc:** ${state.location}
---------------------------
🏷️ **Item:** ${state.title}
📝 **Desc:** ${state.description || "None"} 
🧵 **Mat:** ${state.material}
📦 **Min:** ${state.min_order}
💰 **Price:** ${price} ETB
    `;
    await bot.telegram.sendMessage(process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_ID!, summary);

    return ctx.reply("Great! Now send me Photos of the product.\n📸 You can send multiple! Type /done when finished.\n\nየምርቱን ፎቶዎች ይላኩ. በቂ ፎቶ ከላኩ በኋላ 👉 /done ብለው ይፃፉ");
  }

  if (state.step === 'PHOTO') {
    if (ctx.message.photo) {
      const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
      await bot.telegram.sendPhoto(process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_ID!, photoId, {
        caption: `📸 Photo from ${state.shop_name}`
      });
      return ctx.reply("Photo received! Send another or type /done to finish.\nፎቶውን ተቀብያለሁ! ሌላ ፎቶ ይላኩ ወይም ለመጨረስ 👉 /done ብለው ይፃፉ");
    } else {
      return ctx.reply("Please send a photo or type /done.\nእባክዎ ፎቶ ይላኩ ወይም 👉 /done ብለው ይፃፉ");
    }
  }
});

// --- 4. FINISH HANDLER ---
async function handleDone(ctx: any, userId: string) {
  // Set to IDLE (stops listening to messages)
  await updateState(userId, { 
    step: 'IDLE', 
    title: null, price: null, description: null, material: null, min_order: null 
  });
  
  await ctx.reply("✅ Submission Complete! \nAdmin will review your product and publish it soon.\n\nምርትዎን ተቀብለናል! አገልግሎታችንን ስለተጠቀሙ እናመሰግናለን!");
}

// --- 5. NEXT.JS HANDLER ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Bot Error:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}