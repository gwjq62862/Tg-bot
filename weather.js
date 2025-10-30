// weather.js
import axios from 'axios';

let apiKey = '';
let unit = 'metric';
let fixedCity = ''; 

export function setApiKey(key, u = 'metric') {
    apiKey = key;
    unit = u;
}

export function setFixedCity(city) {
    fixedCity = city;
}

async function getWeatherData() {
    if (!fixedCity) {
        throw new Error("City is not set in FIXED_SETTINGS.");
    }
    if (!apiKey) {
        throw new Error("Weather API Key is not set.");
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${fixedCity}&appid=${apiKey}&units=${unit}`;
    
    const response = await axios.get(apiUrl);
    return response.data;
}

export async function getWeatherMessage() {
    const data = await getWeatherData();
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const humidity = data.main.humidity;

    return `${fixedCity} မှာ အပူချိန် ${temp}°C, အခြေအနေ: ${description}, စိုထိုင်းဆ: ${humidity}% ဖြစ်ပါတယ်။`;
}

export function checkBirthday(birthday) {
    if (!birthday) return false;
    const today = new Date();
    const bday = new Date(birthday);
    
    return today.getMonth() === bday.getMonth() && today.getDate() === bday.getDate();
}