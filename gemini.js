// gemini.js
let ai = null;

// 🚨 ဤနေရာတွင် စကားပြောဟန်နှင့် ခင်ဗျား၏ အခန်းကဏ္ဍကို သတ်မှတ်ထားသည်
const SYSTEM_INSTRUCTION = `
You are a caring, male personal assistant representing your 'Sir' (the user who owns the bot). 
Your personality should be kind, respectful, and slightly formal but warm, using terms like 'ရှင်' (shin) or 'နော်' (naw) appropriately at the end of sentences for politeness in Burmese. 
When giving advice or information, make it clear that you are doing it on behalf of your Sir, and your purpose is to take care of the recipient (Sir's sister one). 
Your output must be in BURMESE language.
`;

export function setAiInstance(aiInstance) {
    ai = aiInstance;
}

async function runGenerativeModel(prompt) {
    if (!ai) {
        throw new Error("Gemini AI Instance is not initialized.");
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
        },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    return response.text.trim();
}

// 🚨 ရာသီဥတု Data ကိုလက်ခံပြီး ဂရုစိုက်မှုပါသော စာသားထုတ်ပေးခြင်း (Prompt ပြောင်းလဲထားသည်)
export async function generateWeatherCareMessage(weatherData, city) {
    const prompt = `Based on the weather data for ${city}, please write a short, caring, and protective message. State clearly in the message that this weather report and care message is sent on behalf of your Sir to his loved one. The weather data is: "${weatherData}".`;
    
    return runGenerativeModel(prompt);
}

export async function generateJoke() {
    const prompt = "Please tell a very short, cheerful, and simple joke. Start the joke message by saying, 'အရှင် (Sir) က ပျော်ရွှင်စေချင်လို့ ပြောခိုင်းလိုက်တာပါနော်။'";
    return runGenerativeModel(prompt);
}

export async function generateBirthdayWish() {
    const prompt = "Please write a heartfelt, short, and sweet birthday wish. Make sure to clearly state that this message is from your Sir.";
    return runGenerativeModel(prompt);
}

// Non-command message များကို Gemini ဖြင့် ဖြေကြားခြင်း (Prompt ပြောင်းလဲထားသည်)
export async function handleNonCommandMessage(bot, msg) {
    try {
        await bot.sendChatAction(msg.chat.id, 'typing');
        const responseText = await runGenerativeModel(`User: ${msg.text}\n\nContinue the conversation with the user (Sir's loved one) naturally, maintaining your caring male persona.`);
        await bot.sendMessage(msg.chat.id, responseText, { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
    } catch (error) {
        console.error('Gemini chat error:', error);
        await bot.sendMessage(msg.chat.id, "တောင်းပန်ပါတယ်၊ AI နဲ့ စကားပြောရာမှာ အဆင်မပြေမှု ဖြစ်နေပါတယ်။");
    }
}