// data_store.js
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.resolve(__dirname, 'user_data.json');

let isWriting = false;

async function readData() {
    try {
        const data = await readFile(DATA_FILE, 'utf-8');
        const json = JSON.parse(data);
        return { 
            chat_id: json.chat_id || 0
        };
    } catch (error) {
        return { chat_id: 0 }; 
    }
}

async function writeData(data) {
    if (isWriting) {
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

export async function initializeChatId(chatId) {
    const data = await readData();
    if (data.chat_id === 0) {
        data.chat_id = chatId;
        await writeData(data);
    }
    return data; 
}

export async function getChatId() {
    const data = await readData();
    return data.chat_id;
}