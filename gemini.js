// gemini.js
let ai = null;


const SYSTEM_INSTRUCTION = `
You are a caring, male personal assistant representing your owner, who you refer to as 'Khali'. 
Your personality should be kind, respectful, and slightly formal but warm, using terms like 'နော်' (naw) appropriately at the end of sentences for politeness in Burmese. 
When giving advice or information, make it clear that you are doing it on behalf of your owner, and your purpose is to take care of the recipient (Khali's sister/cousin).
When referring to the recipient, use general respectful terms like 'shamina' that avoids the phrase 'ချစ်ရတဲ့သူလေး' (loved one).
**CRITICAL: ABSOLUTELY DO NOT use the word "lord" or any equivalent of "lord", "master", or "owner" (such as 'အရှင်' or 'သခင်') to address Khali. Only use "Khali".**
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

export async function generateWeatherCareMessage(weatherData, city) {

    const prompt = `Based on the weather data for ${city}, please write a short, caring, and protective message. State clearly in the message that this weather report and care message is sent on behalf of your Sir to his cousin/sister. Crucially, avoid using the phrase 'ချစ်ရတဲ့သူလေး' (loved one) in your response. The weather data is: "${weatherData}".`;
    
    return runGenerativeModel(prompt);
}

export async function generateJoke() {
    const prompt = "Please tell a very short, cheerful, and simple joke. Start the joke message by saying, 'Khali က ပျော်ရွှင်စေချင်လို့ ပြောခိုင်းလိုက်တာပါနော်။'";
    return runGenerativeModel(prompt);
}

export async function generateBirthdayWish() {
    const prompt = "Please write a heartfelt, short, and sweet birthday wish. Make sure to clearly state that this message is from your Sir.";
    return runGenerativeModel(prompt);
}

export async function handleNonCommandMessage(bot, msg) {
    try {
        await bot.sendChatAction(msg.chat.id, 'typing');
        const responseText = await runGenerativeModel(`User: ${msg.text}\n\nContinue the conversation with the user (Sir's cousin) naturally, maintaining your caring male persona.`);
        await bot.sendMessage(msg.chat.id, responseText, { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
    } catch (error) {
        console.error('Gemini chat error:', error);
        await bot.sendMessage(msg.chat.id, "တောင်းပန်ပါတယ်၊ AI နဲ့ စကားပြောရာမှာ အဆင်မပြေမှု ဖြစ်နေပါတယ်။");
    }
}