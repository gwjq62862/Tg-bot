// index.js
import 'dotenv/config';

import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
import { GoogleGenAI } from '@google/genai';

import * as dataStore from './data_store.js'; 
import * as weather from './weather.js';
import * as gemini from './gemini.js';

// ------------------------------------
// ⚙️ FIXED SETTINGS AND INITIALIZATION
// ------------------------------------

// 🎁 သင့်ရဲ့ ချစ်ရသူအတွက် အချက်အလက်များကို ဤနေရာတွင် သတ်မှတ်ပါ
const FIXED_SETTINGS = {
    city: "Taungoo",      // 👈 တောင်ငူ (Taungoo)
    birthday: "1990-06-15" // 👈 မွေးနေ့ 'YYYY-MM-DD' ပုံစံဖြင့်
};

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// API Instances
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

let isBotReady = false; 

// Bot စတင်ချိန် Initialization
async function initializeBot() {
    try {
        console.log(`Bot is initializing...`);
        isBotReady = true;

        // Modules များကို Configuration ပေးခြင်း
        weather.setApiKey(process.env.WEATHER_API_KEY, process.env.WEATHER_UNIT);
        weather.setFixedCity(FIXED_SETTINGS.city);
        gemini.setAiInstance(ai);

    } catch (err) {
        console.error('Failed to initialize bot settings:', err);
    }
}

initializeBot(); 

// ------------------------------------
// 🛑 STRICT AUTHORISATION FUNCTION (Testing အတွက် ဖြုတ်ထားသည်)
// ------------------------------------
function isAuthorised(chatId) {
    // 🚨 Testing အတွက် လူတိုင်းသုံးနိုင်ရန် 'true' ပြန်ပေးသည်
    return true; 
}

// ------------------------------------
// 🤖 COMMAND HANDLERS
// ------------------------------------

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    if (!isBotReady) {
        await bot.sendMessage(chatId, "Bot ကို စတင်နေပါသည်... ကျေးဇူးပြု၍ ခဏစောင့်ပါ။");
        return;
    }

    const currentData = await dataStore.readData();

    // 1️⃣ ပထမဆုံးအကြိမ် `/start` ပို့သူကို Cron Job အတွက် Authorized User အဖြစ် သတ်မှတ်ပါ
    if (currentData.chat_id === 0) {
        await dataStore.initializeChatId(chatId);
        await bot.sendMessage(chatId, "✅ သင့်ကို Bot ရဲ့ **Cron Job Receiver** အဖြစ် သတ်မှတ်လိုက်ပါပြီ။\n\nမနက် ၇ နာရီတိုင်း ဂရုစိုက်စာများ ရရှိပါလိမ့်မယ်။ `/help` ကို ပို့ပြီး commands များကို ကြည့်ရှုနိုင်ပါတယ်။");
        return;
    }
    
    // 🚨 Testing အတွက် Chat ID ကို စစ်ဆေးစရာမလိုဘဲ အားလုံးကို Welcom ပြုလုပ်ပါ
    const welcomeMessage = `မင်္ဂလာပါရှင်၊ Caring Bot ပါ။ 
ကျွန်တော်က Shaminaရဲ့ ကိုယ်ရေးကိုယ်တာ လက်ထောက်ပါ။ /help နဲ့ ရနိုင်တာတွေကို ကြည့်ပါ။`;

    await bot.sendMessage(chatId, welcomeMessage);
});

bot.onText(/\/myinfo/, async (msg) => {
    const chatId = msg.chat.id;
    if (!isAuthorised(chatId)) return;

    const infoMessage = `
**လက်ရှိ အချက်အလက်များ**
🏙️ မြို့- **${FIXED_SETTINGS.city}**
🎂 မွေးနေ့- **${FIXED_SETTINGS.birthday}**
    `;

    await bot.sendMessage(chatId, infoMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/weather/, async (msg) => {
    const chatId = msg.chat.id;
    if (!isAuthorised(chatId)) return;

    try {
        // AI ဖြင့် ဂရုစိုက်မှုပါသော စာသားကို ယူပါ
        const rawWeatherData = await weather.getWeatherMessage(); 
        const careMessage = await gemini.generateWeatherCareMessage(rawWeatherData, FIXED_SETTINGS.city);

        await bot.sendMessage(chatId, careMessage, { parse_mode: 'Markdown' });
    } catch (error) {
        await bot.sendMessage(chatId, `Weather data ကိုယူရာတွင် error ရှိပါသည်။: ${error.message}`);
    }
});

bot.onText(/\/joke/, async (msg) => {
    const chatId = msg.chat.id;
    if (!isAuthorised(chatId)) return;

    try {
        await bot.sendMessage(chatId, 'Joke ကို စဉ်းစားနေပါတယ်... 😉');
        const joke = await gemini.generateJoke();
        await bot.sendMessage(chatId, joke);
    } catch (error) {
        await bot.sendMessage(chatId, `Joke ကိုယူရာတွင် error ရှိပါသည်။: ${error.message}`);
    }
});


bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    if (!isAuthorised(chatId)) return;
    
    const helpMessage = `
**Bot Commands များ**
/start - Bot ကို စတင်သုံးစွဲခြင်း
/help - ဤစာရင်းကို ပြသခြင်း
/myinfo - သတ်မှတ်ထားသော မြို့နှင့် မွေးနေ့ကို ကြည့်ခြင်း
/weather - လက်ရှိ ရာသီဥတုကို ချက်ချင်းကြည့်ခြင်း (ဂရုစိုက်မှုပါသော စာသားဖြင့်)
/joke - ရယ်စရာ Joke တစ်ခုကို တောင်းဆိုခြင်း
    `;
    await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});


// ------------------------------------
// 📅 CRON JOB (Daily Reminder)
// ------------------------------------

// ⚠️ မနက် ၇ နာရီတိုင်း အကြောင်းကြားစာ ပို့ရန် (0 7 * * *)
cron.schedule('0 7 * * *', async () => {
    if (!isBotReady) {
        return console.log('Cron skipped: Bot is not ready.');
    }

    // 🚨 နေ့စဉ် စာပို့ခြင်းကို JSON ထဲက ပထမဆုံး `/start` ပို့သူဆီသို့သာ ပို့မည်
    const targetChatId = await dataStore.getChatId(); 
    if (targetChatId === 0) {
        return console.log('Cron skipped: Authorized user not set in JSON file.');
    }
    
    console.log(`Running daily check for ${FIXED_SETTINGS.city} to Chat ID: ${targetChatId}`);

    let messages = [];

    // 1. Weather Message (AI Care Message ဖြင့်)
    try {
        const rawWeatherData = await weather.getWeatherMessage(); 
        const careMessage = await gemini.generateWeatherCareMessage(rawWeatherData, FIXED_SETTINGS.city);
        
        messages.push(`**🌤️ မင်္ဂလာမနက်ခင်းပါရှင်။**\n\n${careMessage}`);
    } catch (error) {
        console.error('Weather cron error:', error.message);
        messages.push("ရာသီဥတု သတင်းယူရာတွင် အနည်းငယ် အခက်အခဲရှိနေပါတယ်ရှင်။");
    }

    // 2. Birthday Message
    const isBirthday = weather.checkBirthday(FIXED_SETTINGS.birthday);
    if (isBirthday) {
        try {
            const bdayMessage = await gemini.generateBirthdayWish();
            messages.push(`🎂 **မွေးနေ့ပွဲ စပါပြီ!** 🥳\n${bdayMessage}`);
        } catch (error) {
            console.error('Birthday wish cron error:', error.message);
        }
    }

    if (messages.length > 0) {
        const finalMessage = messages.join('\n\n---\n\n');
        await bot.sendMessage(targetChatId, finalMessage, { parse_mode: 'Markdown' });
    } else {
        console.log('No messages to send (Not birthday or no weather data).');
    }

}, {
    timezone: "Asia/Yangon" 
});

// ------------------------------------
// ⚠️ Unhandled Message/Error Handling
// ------------------------------------

bot.on('polling_error', (error) => {
    // console.error(error); 
});

bot.on('message', (msg) => {
    if (!isAuthorised(msg.chat.id)) {
        return;
    }
    // Commands တွေ မဟုတ်တဲ့ စာတွေကို Gemini နဲ့ ပြန်ဖြေပါ
    if (msg.text && !msg.text.startsWith('/')) {
        gemini.handleNonCommandMessage(bot, msg);
    }
});

console.log('Caring Bot is running...');