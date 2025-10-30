// data_store.js (အပြည့်အစုံ အစားထိုး ပြင်ဆင်ပါ)
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.resolve(__dirname, 'user_data.json');

let isWriting = false;

// 🚨 Data Structure ကို { chat_ids: [] } အဖြစ် ပြောင်းလိုက်ပါပြီ။
export async function readData() {
    try {
        const data = await readFile(DATA_FILE, 'utf-8');
        const json = JSON.parse(data);
        // data.chat_ids သည် Array ဖြစ်ပြီး၊ မရှိရင် Array အလွတ် [] ကို ပြန်ပေးပါမည်။
        return { 
            chat_ids: Array.isArray(json.chat_ids) ? json.chat_ids : []
        };
    } catch (error) {
        // File မရှိရင် { chat_ids: [] } ကို ပြန်ပေးပါ
        return { chat_ids: [] }; 
    }
}

async function writeData(data) {
    if (isWriting) {
        // Writing လုပ်နေရင် စောင့်ပါ
        await new Promise(resolve => setTimeout(resolve, 50)); 
        return writeData(data);
    }
    
    isWriting = true;
    try {
        const jsonString = JSON.stringify(data, null, 2);
        await writeFile(DATA_FILE, jsonString, 'utf-8');
    } catch (error) {
        console.error("Error writing data file:", error);
    } finally {
        isWriting = false;
    }
}

// 🆕 Function အသစ်: Chat ID ကို စာရင်းထဲ ထည့်သွင်းခြင်း
export async function addChatId(chatId) {
    const data = await readData();
    const chatIdNum = Number(chatId);
    
    // စာရင်းထဲမှာ မရှိသေးမှသာ အသစ်ထည့်သွင်းပါ
    if (!data.chat_ids.includes(chatIdNum)) {
        data.chat_ids.push(chatIdNum);
        await writeData(data);
        return true; // အသစ်ထည့်သွင်းကြောင်း ပြန်ပေးသည်
    }
    return false; // ရှိပြီးသားဖြစ်ကြောင်း ပြန်ပေးသည်
}

// 🆕 Function အသစ်: Chat ID အားလုံးကို ပြန်ယူခြင်း (Cron Job အတွက်)
export async function getAllChatIds() {
    const data = await readData();
    return data.chat_ids;
}

