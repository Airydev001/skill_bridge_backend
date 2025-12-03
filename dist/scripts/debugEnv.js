"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const envPath = path_1.default.resolve(__dirname, '../../.env');
console.log("Loading .env from:", envPath);
const result = dotenv_1.default.config({ path: envPath });
if (result.error) {
    console.error("Error loading .env:", result.error);
}
console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
    console.log("GEMINI_API_KEY length:", process.env.GEMINI_API_KEY.length);
    console.log("GEMINI_API_KEY start:", process.env.GEMINI_API_KEY.substring(0, 5));
}
else {
    console.log("GEMINI_API_KEY is undefined or empty");
}
